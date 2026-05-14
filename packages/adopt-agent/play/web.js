import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { Engine } from '../src/index.js'
import Markdown from '@nan0web/markdown'

const PORT = process.env.PORT || 3055

async function run() {
	console.log('🌐 Starting Advanced Web SSR...')

	const engine = new Engine()
	await engine.boot()

	const mdParser = new Markdown()
	const db = {} // In-memory path to content map

	const loadRecursive = (dir, exts) => {
		let results = []
		if (!fs.existsSync(dir)) return results
		for (const file of fs.readdirSync(dir)) {
			if (
				['node_modules', 'snapshots', 'dist', '.git', '.cache', 'play', 'releases'].includes(file)
			)
				continue
			const filePath = path.join(dir, file)
			if (fs.statSync(filePath).isDirectory()) {
				results = results.concat(loadRecursive(filePath, exts))
			} else if (exts.some((ext) => file.endsWith(ext))) {
				results.push(filePath)
			}
		}
		return results
	}

	// Gather MD files based on config rules
	const configDocs = engine.config.docs || ['./']
	for (const docRule of configDocs) {
		const cleanRule = docRule.replace(/\*\*.*/, '')
		const fullPath = path.resolve(engine.cwd, cleanRule)
		if (fs.existsSync(fullPath)) {
			if (fs.statSync(fullPath).isDirectory()) {
				const mds = loadRecursive(fullPath, ['.md'])
				for (const f of mds) {
					let name = path.relative(engine.cwd, f).replace(/\\/g, '/')
					if (name.startsWith('../')) name = `ext/${name.replace(/\.\.\//g, 'up/')}`
					if (!name.startsWith('/')) name = '/' + name
					db[name] = { type: 'markdown', content: fs.readFileSync(f, 'utf-8') }
				}
			} else {
				let name = path.relative(engine.cwd, fullPath).replace(/\\/g, '/')
				if (name.startsWith('../')) name = `ext/${name.replace(/\.\.\//g, 'up/')}`
				if (!name.startsWith('/')) name = '/' + name
				db[name] = {
					type: fullPath.endsWith('.yaml') ? 'yaml' : 'markdown',
					content: fs.readFileSync(fullPath, 'utf-8'),
				}
			}
		}
	}

	// Always fetch data YAMLs into db (for fallback display if needed)
	const dataYamls = loadRecursive(path.join(engine.cwd, 'data'), ['.yaml'])
	for (const f of dataYamls) {
		let name = path.relative(engine.cwd, f).replace(/\\/g, '/')
		if (!name.startsWith('/')) name = '/' + name
		db[name] = { type: 'yaml', content: fs.readFileSync(f, 'utf-8') }
	}

	// Fetch Languages for UI
	const langsDocRaw = await engine.dataDb.fetch('_/langs').catch(() => [])
	const langsDoc = langsDocRaw.length
		? langsDocRaw
		: [
				{ locale: 'en', title: 'English', flag: '🇬🇧' },
				{ locale: 'uk', title: 'Ukrainian', flag: '🇺🇦' },
			]

	// Setup virtual routing maps
	const routeMap = {} // e.g. '/uk/docs/README.md' -> '/docs/uk/README.md' (key in db)
	const navHtmls = {} // locale -> HTML string of the sidebar
	const tCache = {} // locale -> translations

	for (const lang of langsDoc) {
		const locale = lang.locale
		const uriNav = locale === 'en' ? '_/nav' : `${locale}/_/nav`
		const uriT = locale === 'en' ? '_/t' : `${locale}/_/t`

		// Translations
		try {
			const rawT = db[`/data/${locale === 'en' ? '' : locale + '/'}_/t.yaml`]?.content || ''
			const dict = {}
			rawT.split('\n').forEach((line) => {
				const idx = line.indexOf(':')
				if (idx > -1) dict[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
			})
			tCache[locale] = dict
		} catch (e) {
			console.error(`[SSR] Translation load error for ${locale}:`, e.message)
			tCache[locale] = {}
		}

		const t = (k) => tCache[locale][k] || k

		// Navigation Structure
		let navHtml = ''
		try {
			const navDoc = await engine.dataDb.fetch(uriNav) // has 'children'

			const renderNode = (node, depth) => {
				if (!node) return ''
				let html = ''
				const padding = depth * 15

				if (node.src) {
					// It's a file link
					// register route
					let s = node.src
					if (!s.startsWith('/')) s = '/' + s
					routeMap[node.url] = s

					html += `<a href="${node.url}" class="nav-link" data-url="${node.url}" style="padding-left: ${padding}px">${node.title}</a>`
				} else {
					// It's a category
					html += `<div class="nav-title" style="padding-left: ${padding}px; margin-top: ${depth === 0 ? '16px' : '8px'}">${node.title}</div>`
				}

				if (node.children) {
					for (const child of node.children) {
						html += renderNode(child, depth + 1)
					}
				}
				return html
			}

			if (navDoc && navDoc.children) {
				navHtml = renderNode(navDoc, 0)
			}
		} catch (e) {
			// Fallback: Dump everything in flat structure for this locale if no nav.yaml
			navHtml += `<div class="nav-section"><div class="nav-title">${t('Documents')}</div>`
			Object.keys(db)
				.filter((k) => k.endsWith('.md'))
				.forEach((k) => {
					const url = `/${locale}${k}`
					routeMap[url] = k
					navHtml += `<a href="${url}" class="nav-link" data-url="${url}">${k.split('/').pop()}</a>`
				})
			navHtml += `</div><div class="nav-section"><div class="nav-title">${t('YAML Data')}</div>`
			Object.keys(db)
				.filter((k) => k.endsWith('.yaml'))
				.forEach((k) => {
					const url = `/${locale}${k}`
					routeMap[url] = k
					navHtml += `<a href="${url}" class="nav-link" data-url="${url}">${k.split('/').pop()}</a>`
				})
			navHtml += `</div>`
		}

		navHtmls[locale] = navHtml
	}

	const buildHtml = (reqUrl, activeDocKey, locale) => {
		const docObj = db[activeDocKey]
		const activeContent = docObj ? docObj.content : '# 404\nDocument not found.'
		const t = (k) => tCache[locale][k] || k

		let htmlContent = ''
		if (activeDocKey && activeDocKey.endsWith('.yaml')) {
			htmlContent = `<pre><code class="language-yaml">${activeContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
		} else {
			mdParser.parse(activeContent)
			htmlContent = mdParser.stringify()
		}

		const langLinks = `<div class="lang-switch">
			${langsDoc.map((l) => `<a href="/${l.locale}/" class="${l.locale === locale ? 'active' : ''}">${l.flag || ''} ${l.title}</a>`).join('')}
		</div>`

		// Inject active class to the correct link
		let sideNav = navHtmls[locale]
		sideNav = sideNav.replace(
			`data-url="${reqUrl}"`,
			`data-url="${reqUrl}" class="nav-link active"`,
		)

		return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<title>${engine.config.name}</title>
	<style>
		:root {
			--primary: #4F46E5;
			--bg: #0F172A;
			--surface: #1E293B;
			--surface-hover: #334155;
			--text: #F8FAFC;
			--text-muted: #94A3B8;
			--border: #334155;
		}
		body.light-theme {
			--bg: #FFFFFF;
			--surface: #F1F5F9;
			--surface-hover: #E2E8F0;
			--text: #0F172A;
			--text-muted: #475569;
			--border: #CBD5E1;
		}
		* { box-sizing: border-box; }
		body {
			font-family: 'Inter', -apple-system, sans-serif;
			margin: 0; background: var(--bg); color: var(--text);
			display: flex; height: 100vh; overflow: hidden;
		}

		/* Mobile UI Header */
		.mobile-header { display: none; background: var(--surface); padding: 15px 20px; border-bottom: 1px solid var(--border); align-items: center; justify-content: space-between; }
		.btn-menu { background: transparent; border: none; color: var(--text); font-size: 1.5rem; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 8px; }
		.btn-menu:hover { background: var(--surface-hover); }

		nav {
			width: 300px; background: var(--surface); padding: 20px 0;
			border-right: 1px solid var(--border);
			display: flex; flex-direction: column; overflow-y: auto;
		}
		nav.open { left: 0; }
		.overlay {
			display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
			background: rgba(0,0,0,0.5); z-index: 99; backdrop-filter: blur(2px);
		}
		.overlay.open { display: block; }

		.nav-title { font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 8px; }
		nav h1 { font-size: 1.25rem; color: var(--primary); margin: 0 20px 5px 20px; }
		.version-badge { margin: 0 20px 20px 20px; font-size: 0.8rem; color: var(--text-muted); }

		nav a.nav-link {
			color: var(--text-muted); text-decoration: none; padding: 8px 12px; display: block;
			border-radius: 6px; font-size: 0.9rem; transition: 0.2s;
			white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0 10px 2px 10px;
		}
		nav a.nav-link:hover { background: var(--surface-hover); color: var(--text); }
		nav a.nav-link.active { background: rgba(79, 70, 229, 0.15); color: var(--primary); font-weight: 500; border-left: 3px solid var(--primary); border-radius: 0 6px 6px 0; }

		main { flex: 1; padding: 40px 8vw; overflow-y: auto; line-height: 1.7; font-size: 1.05rem; overflow-x: hidden; }
		main h1, main h2, main h3 { border-bottom: 1px solid var(--border); padding-bottom: 0.3em; margin-top: 2em; }
		main h1 { margin-top: 0; color: var(--primary); border-bottom: 2px solid var(--primary); display: inline-block; }

		blockquote { border-left: 4px solid var(--primary); margin: 1.5em 0; padding: 0.5em 1.5em; color: var(--text-muted); background: rgba(255,255,255,0.03); border-radius: 0 8px 8px 0; }
		pre { background: #000; padding: 20px; border-radius: 8px; overflow-x: auto; border: 1px solid var(--border); }
		code { font-family: 'JetBrains Mono', monospace; color: #38BDF8; font-size: 0.9em; }
		p code { padding: 2px 6px; background: rgba(255,255,255,0.1); border-radius: 4px; color: var(--primary); }
		img { max-width: 100%; border-radius: 8px; margin: 1em 0; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

		.controls { display: flex; gap: 10px; padding: 0 20px; margin-bottom: 20px; }
		.btn-theme { background: var(--surface-hover); border: 1px solid var(--border); color: var(--text); padding: 5px 10px; border-radius: 6px; cursor: pointer; }
		.lang-switch { display: flex; gap: 5px; flex-wrap: wrap; }
		.lang-switch a { padding: 4px 8px; font-size: 0.8rem; border: 1px solid var(--border); background: var(--bg); text-decoration: none; color: var(--text); border-radius: 4px; }
		.lang-switch a:hover { background: var(--surface-hover); }
		.lang-switch a.active { border-color: var(--primary); color: var(--primary); }

		/* Mobile First Adjustments */
		@media (max-width: 768px) {
			body { flex-direction: column; }
			.mobile-header { display: flex; }
			nav {
				position: fixed; top: 0; left: -100%; width: 80%; max-width: 320px; height: 100vh;
				z-index: 100; transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 2px 0 10px rgba(0,0,0,0.5);
			}
			main { padding: 20px; overflow-x: hidden; }
		}
	</style>
</head>
<body id="body">
	<div class="mobile-header">
		<strong>🤖 ${engine.config.name}</strong>
		<button class="btn-menu" aria-label="Menu" onclick="document.getElementById('nav').classList.toggle('open'); document.getElementById('overlay').classList.toggle('open')">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
		</button>
	</div>
	<div id="overlay" class="overlay" onclick="document.getElementById('nav').classList.remove('open'); document.getElementById('overlay').classList.remove('open')"></div>

	<nav id="nav">
		<h1>🤖 ${engine.config.name}</h1>
		<div class="version-badge">Version: ${engine.config.version} | ${engine.config.strictness}</div>

		<div class="controls">
			<button class="btn-theme" onclick="document.getElementById('body').classList.toggle('light-theme')">${t('Theme') || 'Theme'}</button>
		</div>
		<div class="controls">${langLinks}</div>

		<div class="nav-links">
			${sideNav}
		</div>
	</nav>

	<main>
		${htmlContent}
	</main>
</body>
</html>
`
	}

	const server = http.createServer((req, res) => {
		const reqUrl = new URL(req.url, `http://${req.headers.host}`)
		let pathStr = decodeURIComponent(reqUrl.pathname)

		// Static rendering logic for `.png`
		if (pathStr.endsWith('.png') || pathStr.endsWith('.jpg')) {
			const staticPath = path.join(engine.cwd, pathStr)
			if (fs.existsSync(staticPath)) {
				res.writeHead(200, { 'Content-Type': 'image/png' })
				res.end(fs.readFileSync(staticPath))
				return
			}
		}

		// API logic
		if (pathStr === '/api/index.json') {
			res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
			res.end(JSON.stringify({ db, routeMap }, null, 2))
			return
		}

		// Determine Locale. E.g. /uk/docs/README.md -> uk
		let locale = langsDoc[0].locale
		const segments = pathStr.split('/').filter(Boolean)
		if (segments.length > 0 && langsDoc.some((l) => l.locale === segments[0])) {
			locale = segments[0]
		}

		// Router redirection if just root
		if (pathStr === '/' || pathStr === `/${locale}` || pathStr === `/${locale}/`) {
			// Find first route available in this locale to redirect
			const firstRoute =
				Object.keys(routeMap).find((p) => p.startsWith(`/${locale}/`)) || Object.keys(routeMap)[0]
			if (firstRoute) {
				res.writeHead(302, { Location: firstRoute })
				res.end()
				return
			}
		}

		// Find mapping
		let dbKey = routeMap[pathStr]
		// Physical fallback mappings if custom route format was not defined
		if (!dbKey) {
			const candidate1 = pathStr.replace(`/${locale}`, '')
			if (db[candidate1]) dbKey = candidate1
			else if (db[pathStr]) dbKey = pathStr
			else if (db[pathStr.replace(/^\//, '')]) dbKey = pathStr.replace(/^\//, '')
		}

		if (!dbKey || !db[dbKey]) {
			res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
			res.end(buildHtml(pathStr, null, locale))
			return
		}

		res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
		res.end(buildHtml(pathStr, dbKey, locale))
	})

	server.listen(PORT, () => {
		const argDemo = process.argv.find((a) => a.startsWith('--demo='))
		if (argDemo) {
			console.log('# Web SSR Index Snapshot\n')
			for (const [key, doc] of Object.entries(db)) {
				console.log(`## 📄 ${key} (${doc.type})`)
				console.log(`Content length: ${doc.content.length} bytes\n`)
			}
			server.close()
			return
		}

		console.log(`\n✅ Advanced Web SSR running. Loaded ${Object.keys(db).length} files.`)
		console.log(`📡 Full Data JSON: http://localhost:${PORT}/api/index.json`)
		console.log(`🚀 Open in browser:  http://localhost:${PORT}/\n`)
	})
}

run().catch(console.error)
