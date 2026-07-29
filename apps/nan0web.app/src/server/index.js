// @ts-nocheck
import path from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { createServer } from '@nan0web/http-node'
import { WebSocketBridge } from '../bridge/WebSocketBridge.js'

/**
 * @file Server-Side Rendering (SSR) & HTTP/HTTPS Server for NaN0Web App Engine.
 * Built on top of @nan0web/http-node. Supports TLS via config.ssl.
 */
export class SSRServer {
	/**
	 * @param {import('../runner.js').AppRunner} runner 
	 */
	constructor(runner) {
		this.runner = runner
		this.bridge = new WebSocketBridge(runner)
		
		// Resolve SSL options if configured
		const sslConfig = runner.config?.ssl || null
		/** @type {object | undefined} */
		this.sslOptions = undefined
		
		if (sslConfig && sslConfig.cert && sslConfig.key) {
			this.sslOptions = {
				cert: readFileSync(sslConfig.cert),
				key: readFileSync(sslConfig.key),
			}
		}

		this.app = createServer(this.sslOptions ? { ssl: this.sslOptions } : {})

		// API Routes: /api/* -> data/api/*.js
		this.app.use(async (req, res, next) => {
			const reqAny = /** @type {any} */ (req)
			const rawPath = reqAny.pathname || (req.url || '/').split('?')[0]
			if (!rawPath.startsWith('/api')) {
				return next()
			}
			
			const apiPath = rawPath.replace('/api', '')
			const safePath = apiPath === '' || apiPath === '/' ? '/index' : apiPath
			
			// Phase 6: Move API from content (data/) to code (src/server/api)
			const fullPath = path.resolve(import.meta.dirname, 'api', `.${safePath}.js`)

			try {
				// Dynamically import the endpoint module
				const endpoint = await import(fullPath)
				const method = (req.method || 'GET').toUpperCase()
				
				// Priority: export const GET = ... -> export default function
				const handler = endpoint[method] || endpoint.default || endpoint[(req.method || 'get').toLowerCase()]
				
				if (typeof handler === 'function') {
					await handler(req, res)
					return
				}
				
				res.statusCode = 405
				res.json({ error: `Method ${method} Not Allowed on this endpoint.` })
			} catch (e) {
				const err = /** @type {any} */ (e)
				if (err.code === 'ERR_MODULE_NOT_FOUND') {
					res.statusCode = 404
					res.json({ error: 'API Endpoint not found.' })
				} else {
					console['error']('[API Error]', e)
					res.statusCode = 500
					res.json({ error: 'Internal Server Error' })
				}
			}
		})

		// Static file serving middleware for Cross-UI Lit Assets & Local Packages
		this.app.use(async (req, res, next) => {
			const reqAny = /** @type {any} */ (req)
			const rawPath = reqAny.pathname || (req.url || '/').split('?')[0]
			if (rawPath.includes('..')) {
				return next()
			}

			let workspaceRoot = process.cwd()
			while (workspaceRoot !== path.dirname(workspaceRoot)) {
				if (existsSync(path.join(workspaceRoot, 'pnpm-workspace.yaml'))) {
					break
				}
				workspaceRoot = path.dirname(workspaceRoot)
			}
			if (!existsSync(path.join(workspaceRoot, 'pnpm-workspace.yaml'))) {
				workspaceRoot = path.resolve(process.cwd(), '../../')
			}
			let targetPath
			if (rawPath.startsWith('/packages/') || rawPath.startsWith('/apps/')) {
				targetPath = path.join(workspaceRoot, rawPath)
			} else if (rawPath.startsWith('/src/ui/lit/')) {
				targetPath = path.join(workspaceRoot, 'apps/nan0web.app', rawPath)
			} else {
				targetPath = path.join(process.cwd(), rawPath)
			}

			try {
				let stat = null
				try {
					stat = await fs.stat(targetPath)
				} catch {
					if (!rawPath.startsWith('/packages/') && !rawPath.startsWith('/apps/') && !rawPath.startsWith('/public/')) {
						const fallbackPath = path.join(process.cwd(), 'public', rawPath)
						try {
							stat = await fs.stat(fallbackPath)
							if (stat.isFile()) {
								targetPath = fallbackPath
							}
						} catch {
							// continue
						}
					}
				}

				if (stat && stat.isFile()) {
					const ext = path.extname(targetPath).toLowerCase()
					const mimeTypes = {
						'.js': 'application/javascript; charset=utf-8',
						'.css': 'text/css; charset=utf-8',
						'.svg': 'image/svg+xml; charset=utf-8',
						'.png': 'image/png',
						'.jpg': 'image/jpeg',
						'.jpeg': 'image/jpeg',
						'.json': 'application/json; charset=utf-8',
						'.xml': 'application/xml; charset=utf-8',
						'.html': 'text/html; charset=utf-8',
					}
					res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
					const content = await fs.readFile(targetPath)
					const resAny = /** @type {any} */ (res)
					resAny.end(content)
					return
				}
			} catch {
				// continue
			}

			await next()
		})

		// Repository visualization visualizer
		this.app.get('/git', async (req, res) => {
			const { exec } = await import('node:child_process')
			const runGit = (args) => new Promise((resolve) => {
				exec(`git ${args}`, { cwd: process.cwd() }, (err, stdout, stderr) => {
					resolve({ err, stdout, stderr })
				})
			})

			const { stdout: statusOut } = await runGit('status --porcelain')
			const lines = statusOut.trim().split('\n').filter(Boolean)
			
			const files = lines.map(line => {
				const code = line.slice(0, 2).trim()
				const filepath = line.slice(3)
				let status = 'modified'
				if (code === '??') status = 'untracked'
				else if (code === 'D') status = 'deleted'
				else if (code === 'A') status = 'added'
				return { status, path: filepath }
			})

			const html = this.#renderGitPage(files)
			res.setHeader('Content-Type', 'text/html; charset=utf-8')
			res.end(html)
		})

		this.app.get('/git-diff', async (req, res) => {
			const reqAny = /** @type {any} */ (req)
			const file = reqAny.query?.file || ''
			if (!file) {
				res.statusCode = 400
				return res.end('Missing file parameter')
			}

			const { exec } = await import('node:child_process')
			exec(`git diff -- "${file}"`, { cwd: process.cwd() }, (err, stdout, stderr) => {
				if (!stdout.trim()) {
					exec(`git diff --no-index -- /dev/null "${file}"`, { cwd: process.cwd() }, (err2, stdout2) => {
						res.setHeader('Content-Type', 'text/plain; charset=utf-8')
						res.end(stdout2 || stdout || 'No changes or file is untracked/new.')
					})
				} else {
					res.setHeader('Content-Type', 'text/plain; charset=utf-8')
					res.end(stdout)
				}
			})
		})

		// Catch-all route for SSR pages
		this.app.get('/*', async (req, res) => {
			const reqAny = /** @type {any} */ (req)
			const pathStr = reqAny.pathname || (req.url || '/').split('?')[0]
			const { page, blocks, breadcrumbs } = await this.runner.renderPage(pathStr)

			const title = page ? page.title : '404 - Not Found'
			const html = this.#renderHTML(title, blocks, breadcrumbs)

			if (!page) res.statusCode = 404
			
			res.setHeader('Content-Type', 'text/html; charset=utf-8')
			const resAny = /** @type {any} */ (res)
			resAny.end(html)
		})
	}

	/**
	 * Start the HTTP/HTTPS server.
	 * @param {number} [port=3000] 
	 * @returns {Promise<{ port: number, protocol: string }>}
	 */
	async listen(port = 3000) {
		this.app.port = port
		await this.app.listen()
		
		// Attach real-time bridge (Phase 4)
		if (this.app.server) {
			this.bridge.attach(this.app.server)
		}

		const protocol = this.sslOptions ? 'https' : 'http'
		return { port: this.app.port, protocol }
	}

	/**
	 * Stop the server and bridge.
	 * @returns {Promise<void>}
	 */
	async close() {
		this.bridge.stop()
		await this.app.close()
	}

	/**
	 * Export all registered paths as static HTML files to outDir (SSG).
	 * @param {string} outDir 
	 */
	async exportStatic(outDir = 'dist') {
		const fs = await import('node:fs/promises')
		const paths = this.runner.router.paths()

		await fs.mkdir(outDir, { recursive: true })

		let count = 0
		for (const p of paths) {
			const { page, blocks, breadcrumbs } = await this.runner.renderPage(p)
			if (!page) continue // skip 404s in static export

			const title = page.title || 'Untitled'
			const html = this.#renderHTML(title, blocks, breadcrumbs)

			const filePath = p === '/' ? '/index.html' : `${p}.html`
			const fullDest = path.join(outDir, filePath)

			await fs.mkdir(path.dirname(fullDest), { recursive: true })
			await fs.writeFile(fullDest, html, 'utf-8')
			count++
		}
		
		return { count, total: paths.length }
	}

	/**
	 * Render OLMUI blocks into an HTML document shell.
	 * @param {string} title 
	 * @param {Array<object>} blocks 
	 * @param {Array<object>} breadcrumbs
	 * @returns {string}
	 */
	#renderHTML(title, blocks, breadcrumbs) {
		const lang = this.runner.config?.locale || 'en'
		const siteName = this.runner.state?.title || 'NaN0Web'
		const t = (key) => this.runner.i18n?.t(key) || key
		const documentTitle = title ? `${t(title)} — ${t(siteName)}` : t(siteName)

		// Convert structured blocks into simple static HTML string for SSR.
		const bodyContent = blocks.map(block => {
			if (block['ui-html']) return block['ui-html']
			if (block.h1) return `<h1>${t(block.h1)}</h1>`
			if (block.h2) return `<h2 id="${t(block.h2).toLowerCase().replace(/[^a-z0-9]+/g, '-')}">${t(block.h2)}</h2>`
			if (block.p) return `<p>${t(block.p)}</p>`
			if (block['nan0-sandbox']) {
				return `<nan0-sandbox src="${block.src || ''}" url="${block.url || ''}" ui="${block.ui || ''}"></nan0-sandbox>`
			}
			
			// Render specialized blocks
			if (block.type === 'Hero') {
				const action = block.action || {}
				return `
					<section class="hero">
						<h1>${t(block.title)}</h1>
						<p class="subtitle">${t(block.subtitle)}</p>
						${action.href ? `<a href="${action.href}" class="btn">${t(action.label)}</a>` : ''}
					</section>
				`
			}
			
			// Auto serialize dot-notation keys (UI.Hero) into Web Component tags (ui-hero)
			const keys = Object.keys(block)
			if (keys.length === 1 && (keys[0].startsWith('ui-') || /^([A-Z][a-zA-Z0-9]*\.)+[A-Za-z0-9]+$/.test(keys[0]))) {
				const tag = keys[0].replace(/\./g, '-').toLowerCase()
				const props = block[keys[0]] || {}
				
				let attrs = ''
				for (const [k, v] of Object.entries(props)) {
					const val = typeof v === 'string' ? t(v) : v
					if (typeof val === 'string') {
						attrs += ` ${k}="${val.replace(/"/g, '&quot;')}"`
					} else if (val !== null && v !== undefined) {
						attrs += ` ${k}='${JSON.stringify(val).replace(/'/g, '&apos;')}'`
					}
				}
				return `<${tag}${attrs}></${tag}>`
			}
			
			// Fallback placeholder for complex blocks (lists, forms)
			return `<div class="nan0-block">${JSON.stringify(block, null, 2)}</div>`
		}).join('\n')

		return `<!DOCTYPE html>
<html lang="${lang}">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${documentTitle}</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
	<script type="importmap">
	{
		"imports": {
			"lit": "https://esm.sh/lit@3.1.2",
			"lit/": "https://esm.sh/lit@3.1.2/",
			"@nan0web/ui/domain": "/packages/ui/src/domain/index.js",
			"@nan0web/types": "/packages/types/src/index.js",
			"@nan0web/i18n": "/packages/i18n/src/index.js",
			"@nan0web/icons/adapters/lit": "/packages/icons/src/adapters/lit.js",
			"@nan0web/icons/bs": "/packages/icons/src/sets/bs.js",
			"@nan0web/event": "/packages/event/src/index.js",
			"@nan0web/event/oop": "/packages/event/src/oop.js",
			"@nan0web/co": "/packages/co/src/index.js",
			"@nan0web/core": "/packages/core/src/index.js",
			"@nan0web/auth.app": "/apps/auth.app/src/index.js",
			"@nan0web/editor.app": "/apps/editor.app/src/EditorStack.js",
			"@nan0web/auth-core": "/packages/auth-core/src/index.js",
			"@nan0web/auth-browser": "/packages/auth-browser/src/index.js",
			"@nan0web/editor": "/packages/editor/src/core/index.js",
			"@nan0web/db": "/packages/db/src/index.js",
			"@nan0web/db-browser": "/packages/db-browser/src/index.js",
			"@nan0web/ui-lit": "/packages/ui-lit/packages/core/index.js",
			"@nan0web/ui-lit/theme": "/packages/ui-lit/packages/theme/index.js",
			"@nan0web/ui-lit/auth": "/packages/ui-lit/packages/auth/index.js",
			"@nan0web/ui-lit/edit": "/packages/ui-lit/packages/edit/index.js",
			"@nan0web/ui-lit/form": "/packages/ui-lit/packages/form/index.js",
			"@nan0web/ui-lit/i18n": "/packages/ui-lit/packages/i18n/index.js",
			"@nan0web/log": "/packages/log/src/index.js",
			"@nan0web/share.app": "/apps/share.app/src/index.js",
			"@nan0web/share.app/ui/lit": "/apps/share.app/src/ui/lit/ShareWeb.js"
		}
	}
	</script>
	<script type="module" src="/src/ui/lit/app.js"></script>
	${(this.runner.config?.apps || []).map(app => {
		return `<script type="module">
			import "${app.src}/ui/lit"
		</script>`
	}).join('\n')}
	<style>
		:root {
			--bg: #09090b;
			--fg: #fafafa;
			--accent: #3b82f6;
			--accent-hover: #2563eb;
			--glass: rgba(255, 255, 255, 0.03);
			--border: rgba(255, 255, 255, 0.1);
		}
		* { box-sizing: border-box; }
		body { 
			background: var(--bg); 
			color: var(--fg); 
			font-family: 'Outfit', sans-serif; 
			max-width: 1000px; 
			margin: 0 auto; 
			padding: 0;
			line-height: 1.6;
			background-image: 
				radial-gradient(circle at 50% -20%, #1e3a8a 0%, transparent 50%),
				radial-gradient(circle at 0% 100%, #1e1b4b 0%, transparent 30%);
			background-attachment: fixed;
		}
		main { padding: 4rem 2rem; }
		h1 { font-weight: 600; font-size: clamp(2.5rem, 8vw, 4rem); margin-bottom: 1.5rem; letter-spacing: -0.04em; line-height: 1.1; }
		.subtitle { font-weight: 300; font-size: 1.4rem; opacity: 0.7; margin-bottom: 3rem; max-width: 600px; }
		
		.hero {
			padding: 4rem 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}
		
		.btn {
			display: inline-block;
			background: var(--accent);
			color: white;
			padding: 0.8rem 2rem;
			border-radius: 50px;
			text-decoration: none;
			font-weight: 600;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.5);
		}
		.btn:hover {
			background: var(--accent-hover);
			transform: translateY(-2px);
			box-shadow: 0 15px 25px -5px rgba(59, 130, 246, 0.6);
		}
		
		.nan0-block { 
			background: var(--glass); 
			backdrop-filter: blur(12px);
			padding: 2rem; 
			margin: 3rem 0; 
			border-radius: 20px; 
			border: 1px solid var(--border);
			font-family: 'JetBrains Mono', monospace; 
			font-size: 0.85rem;
			white-space: pre-wrap;
			box-shadow: 0 20px 40px -20px rgba(0,0,0,0.7);
			position: relative;
			overflow: hidden;
		}
		.nan0-block::before {
			content: 'DATA';
			position: absolute;
			top: 1rem;
			right: 1.5rem;
			font-size: 0.6rem;
			opacity: 0.3;
			letter-spacing: 0.2em;
		}
		
		#nan0-bridge-status {
			position: fixed;
			top: 1.5rem;
			right: 2rem;
			padding: 0.6rem 1.2rem;
			border-radius: 50px;
			font-size: 0.75rem;
			background: var(--glass);
			backdrop-filter: blur(8px);
			border: 1px solid var(--border);
			display: flex;
			align-items: center;
			gap: 0.6rem;
			z-index: 100;
			font-weight: 500;
			box-shadow: 0 4px 12px rgba(0,0,0,0.3);
		}
		.status-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; transition: all 0.5s ease; }
		.status-dot.online { background: #22c55e; box-shadow: 0 0 12px #22c55e; }
	</style>
</head>
<body>
	<div id="nan0-bridge-status"><div class="status-dot"></div> NaN0 Bridge Offline</div>
	<main>
		${bodyContent}
	</main>
	<script type="module">
		const statusEl = document.getElementById('nan0-bridge-status');
		const dotEl = statusEl.querySelector('.status-dot');
		
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const ws = new WebSocket(protocol + '//' + window.location.host);
		
		ws.onopen = () => {
			dotEl.classList.add('online');
			statusEl.lastChild.textContent = ' NaN0 Bridge Online';
		};
		
		ws.onmessage = (event) => {
			const { type, payload } = JSON.parse(event.data);
			if (type === 'STATE_SYNC' || type === 'STATE_UPDATED') {
				window.dispatchEvent(new CustomEvent('nan0-state-change', { detail: payload }));
			}
		};
	</script>
</body>
</html>`
	}

	/**
	 * Render a beautiful, interactive Git status page with visual diff viewer.
	 * @param {Array<{ status: string, path: string }>} files
	 * @returns {string}
	 */
	#renderGitPage(files) {
		const lang = this.runner.config?.locale || 'en'
		const title = 'Статус Репозиторію — EA Ukraine'
		
		const statusGroups = {
			modified: files.filter(f => f.status === 'modified'),
			untracked: files.filter(f => f.status === 'untracked'),
			deleted: files.filter(f => f.status === 'deleted'),
			added: files.filter(f => f.status === 'added'),
		}

		const totalCount = files.length
		
		let filesListHtml = ''
		if (totalCount === 0) {
			filesListHtml = `
				<div class="empty-state">
					<span class="icon">✨</span>
					<p>У робочій директорії немає незбережених змін.</p>
				</div>
			`
		} else {
			for (const [group, groupFiles] of Object.entries(statusGroups)) {
				if (groupFiles.length === 0) continue
				const groupTitle = {
					modified: 'Змінені файли',
					untracked: 'Нові (untracked) файли',
					deleted: 'Видалені файли',
					added: 'Індексовані файли',
				}[group]

				const groupClass = group

				filesListHtml += `
					<div class="file-group">
						<h3>${groupTitle} <span class="badge-count">${groupFiles.length}</span></h3>
						<ul>
				`

				for (const f of groupFiles) {
					const badgeChar = {
						modified: 'M',
						untracked: 'U',
						deleted: 'D',
						added: 'A',
					}[group]

					filesListHtml += `
						<li class="file-item" data-path="${f.path}" onclick="loadDiff(this, '${f.path}')">
							<span class="status-badge ${groupClass}">${badgeChar}</span>
							<span class="file-path">${f.path}</span>
						</li>
					`
				}

				filesListHtml += `
						</ul>
					</div>
				`
			}
		}

		return `<!DOCTYPE html>
<html lang="${lang}">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${title}</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
	<style>
		:root {
			--bg: #09090b;
			--fg: #fafafa;
			--accent: #3b82f6;
			--accent-hover: #2563eb;
			--glass: rgba(255, 255, 255, 0.03);
			--border: rgba(255, 255, 255, 0.08);
			--red: #ef4444;
			--green: #22c55e;
			--yellow: #f59e0b;
			--blue: #3b82f6;
		}
		* { box-sizing: border-box; }
		body { 
			background: var(--bg); 
			color: var(--fg); 
			font-family: 'Outfit', sans-serif; 
			margin: 0;
			padding: 0;
			line-height: 1.6;
			background-image: 
				radial-gradient(circle at 50% -20%, #1e3a8a 0%, transparent 50%),
				radial-gradient(circle at 0% 100%, #1e1b4b 0%, transparent 30%);
			background-attachment: fixed;
			height: 100vh;
			display: flex;
			flex-direction: column;
		}
		header {
			padding: 1.5rem 2rem;
			border-bottom: 1px solid var(--border);
			background: rgba(9, 9, 11, 0.5);
			backdrop-filter: blur(8px);
			display: flex;
			justify-content: space-between;
			align-items: center;
			z-index: 10;
		}
		header h1 {
			margin: 0;
			font-size: 1.5rem;
			font-weight: 600;
			letter-spacing: -0.02em;
			display: flex;
			align-items: center;
			gap: 0.75rem;
		}
		header h1 .logo {
			background: linear-gradient(135deg, var(--accent), #1d4ed8);
			width: 32px;
			height: 32px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 0.9rem;
			color: white;
			box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
		}
		.stats-summary {
			font-size: 0.85rem;
			color: #a1a1aa;
			background: var(--glass);
			padding: 0.4rem 1rem;
			border-radius: 50px;
			border: 1px solid var(--border);
		}
		.layout-container {
			display: flex;
			flex: 1;
			overflow: hidden;
		}
		.sidebar {
			width: 380px;
			border-right: 1px solid var(--border);
			background: rgba(9, 9, 11, 0.3);
			display: flex;
			flex-direction: column;
			overflow-y: auto;
		}
		.search-container {
			padding: 1rem;
			border-bottom: 1px solid var(--border);
		}
		.search-input {
			width: 100%;
			background: rgba(255,255,255,0.02);
			border: 1px solid var(--border);
			padding: 0.6rem 1rem;
			border-radius: 10px;
			color: var(--fg);
			font-family: inherit;
			font-size: 0.9rem;
			transition: all 0.2s ease;
		}
		.search-input:focus {
			outline: none;
			border-color: var(--accent);
			box-shadow: 0 0 10px rgba(59,130,246,0.15);
		}
		.empty-state {
			padding: 4rem 2rem;
			text-align: center;
			color: #71717a;
		}
		.empty-state .icon {
			font-size: 2.5rem;
			display: block;
			margin-bottom: 1rem;
		}
		.file-group {
			padding: 1rem;
		}
		.file-group h3 {
			margin: 0 0 0.75rem 0.5rem;
			font-size: 0.8rem;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: #71717a;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}
		.badge-count {
			background: var(--glass);
			padding: 0.1rem 0.5rem;
			border-radius: 10px;
			font-size: 0.75rem;
		}
		.file-group ul {
			list-style: none;
			padding: 0;
			margin: 0;
			display: flex;
			flex-direction: column;
			gap: 0.35rem;
		}
		.file-item {
			padding: 0.65rem 0.75rem;
			border-radius: 10px;
			cursor: pointer;
			display: flex;
			align-items: center;
			gap: 0.75rem;
			transition: all 0.2s ease;
			border: 1px solid transparent;
		}
		.file-item:hover {
			background: var(--glass);
			border-color: var(--border);
		}
		.file-item.active {
			background: rgba(59, 130, 246, 0.08);
			border-color: rgba(59, 130, 246, 0.3);
		}
		.status-badge {
			width: 22px;
			height: 22px;
			border-radius: 5px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 0.75rem;
			font-weight: bold;
			color: black;
		}
		.status-badge.modified { background: var(--yellow); }
		.status-badge.untracked { background: var(--green); }
		.status-badge.deleted { background: var(--red); color: white; }
		.status-badge.added { background: var(--blue); color: white; }
		
		.file-path {
			font-family: 'JetBrains Mono', monospace;
			font-size: 0.8rem;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: #d4d4d8;
		}
		.main-content {
			flex: 1;
			display: flex;
			flex-direction: column;
			background: rgba(9, 9, 11, 0.1);
			overflow: hidden;
		}
		.diff-container {
			flex: 1;
			overflow: auto;
			padding: 2rem;
			font-family: 'JetBrains Mono', monospace;
			font-size: 0.85rem;
			line-height: 1.5;
		}
		.diff-placeholder {
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: #71717a;
			gap: 1rem;
		}
		.diff-placeholder svg {
			width: 64px;
			height: 64px;
			opacity: 0.2;
			color: white;
		}
		pre {
			margin: 0;
			white-space: pre-wrap;
		}
		/* Diff highlighting styles */
		.line-added {
			background: rgba(34, 197, 94, 0.15);
			color: #4ade80;
			display: block;
			padding: 0 0.5rem;
			border-left: 3px solid var(--green);
		}
		.line-removed {
			background: rgba(239, 68, 68, 0.15);
			color: #f87171;
			display: block;
			padding: 0 0.5rem;
			border-left: 3px solid var(--red);
		}
		.line-chunk {
			color: #a855f7;
			display: block;
			opacity: 0.85;
		}
		.line-meta {
			color: #71717a;
			display: block;
		}
	</style>
</head>
<body>
	<header>
		<h1><div class="logo">E</div> Статус Репозиторію EAUkraine</h1>
		<div class="stats-summary">Змінено файлів: ${totalCount}</div>
	</header>
	
	<div class="layout-container">
		<div class="sidebar">
			<div class="search-container">
				<input type="text" class="search-input" id="search" placeholder="Швидкий пошук файлів..." oninput="filterFiles()">
			</div>
			${filesListHtml}
		</div>
		
		<div class="main-content">
			<div class="diff-container" id="diff-view">
				<div class="diff-placeholder">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
					</svg>
					<p>Оберіть файл зі списку зліва, щоб переглянути його зміни.</p>
				</div>
			</div>
		</div>
	</div>

	<script>
		async function loadDiff(el, filepath) {
			// Update active class
			document.querySelectorAll('.file-item').forEach(item => item.classList.remove('active'));
			el.classList.add('active');

			const diffView = document.getElementById('diff-view');
			diffView.innerHTML = '<div style="color: #71717a; text-align: center; margin-top: 10%;">Завантаження змін...</div>';

			try {
				const res = await fetch('/git-diff?file=' + encodeURIComponent(filepath));
				if (!res.ok) throw new Error('Помилка завантаження');
				const text = await res.text();
				
				// Escape HTML
				const escapeHtml = (unsafe) => unsafe
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/"/g, "&quot;")
					.replace(/'/g, "&#039;");

				const lines = text.split('\\n');
				const highlighted = lines.map(line => {
					if (line.startsWith('+') && !line.startsWith('+++')) {
						return '<span class="line-added">' + escapeHtml(line) + '</span>';
					} else if (line.startsWith('-') && !line.startsWith('---')) {
						return '<span class="line-removed">' + escapeHtml(line) + '</span>';
					} else if (line.startsWith('@@')) {
						return '<span class="line-chunk">' + escapeHtml(line) + '</span>';
					} else if (line.startsWith('diff') || line.startsWith('index') || line.startsWith('---') || line.startsWith('+++')) {
						return '<span class="line-meta">' + escapeHtml(line) + '</span>';
					}
					return escapeHtml(line);
				}).join('\\n');

				diffView.innerHTML = '<pre><code>' + highlighted + '</code></pre>';
			} catch (e) {
				diffView.innerHTML = '<div style="color: var(--red); text-align: center; margin-top: 10%;">Не вдалося завантажити дифф: ' + e.message + '</div>';
			}
		}

		function filterFiles() {
			const query = document.getElementById('search').value.toLowerCase();
			document.querySelectorAll('.file-item').forEach(item => {
				const path = item.getAttribute('data-path').toLowerCase();
				if (path.includes(query)) {
					item.style.display = 'flex';
				} else {
					item.style.display = 'none';
				}
			});
		}
	</script>
</body>
</html>`
	}
}

export default SSRServer
