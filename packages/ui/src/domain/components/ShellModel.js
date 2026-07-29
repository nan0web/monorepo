import { ModelAsApp } from '../ModelAsApp.js'
import { ask, log } from '../../core/Intent.js'

/**
 * ShellModel — OLMUI Component Model for CLI Orchestration
 * Canonical CLI entry that describes available operations as a schema.
 */
export class ShellModel extends ModelAsApp {
	static $id = '@nan0web/ui/ShellModel'

	static command = {
		help: 'What do you want to do?',
		type: 'select',
		default: null,
		positional: true,
		// options: [
		// 	BootEngine,
		// 	InteractiveCLI,
		// 	DevMode,
		// 	BuildProject,
		// 	TestSSG,
		// 	SSGGallery,
		// 	TestWeb,
		// 	WebGallery,
		// 	ConfigWizard,
		// ],
		options: [
			{ label: '📡 Boot Engine (Run OS)', value: 'run' },
			{ label: '🖥️ Interactive CLI', value: 'cli' },
			{ label: '🧬 Dev Mode (Hot-Reload)', value: 'dev' },
			{ label: '📦 Build Project (Data & UI)', value: 'build' },
			{ label: '🧪 Test SSG', value: 'test:ssg' },
			{ label: '🔭 SSG Gallery', value: 'ssg:gallery' },
			{ label: '🧪 Test Web', value: 'test:web' },
			{ label: '🔭 Web Gallery', value: 'web:gallery' },
			{ label: '🔧 Config Wizard', value: 'config' },
		],
		required: true,
	}

	static data = {
		help: 'Data source (DSN)',
		type: 'string',
		default: 'data/',
		alias: 'dsn',
	}

	static index = {
		help: 'Directory index file name (e.g. README or index)',
		type: 'string',
		default: 'index',
	}

	static locale = {
		help: 'Application locale',
		type: 'string',
		default: 'en',
	}

	static port = {
		help: 'Server port',
		type: 'string',
		default: null,
	}

	#options = {}

	/**
	 * @param {object} data
	 * @param {object} [options] External dependencies (AppRunner, SSRServer, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data)
		this.#options = options
		/** @type {string|null} */ this.command
		/** @type {string} */ this.data
		/** @type {string} */ this.index
		/** @type {string} */ this.locale
		/** @type {string} */ this.port
	}

	async *run() {
		yield log('info', '📡 NaN0Web Engine OLMUI Shell Ready')

		// Try to load nav items from AppRunner if available
		const { AppRunner } = this.#options
		let navItems = []
		let runner = null
		if (AppRunner) {
			runner = new AppRunner({ dsn: this.data, locale: this.locale, apps: this.#options.apps })
			try {
				for await (const _ of runner.run()) {
				}
				if (runner.state && runner.state.nav) {
					navItems = runner.state.nav
				}
			} catch (e) {
				// Ignore initialization errors for empty environments
			}
		}

		if (!this.command || this.command === 'help') {
			if (navItems.length > 0) {
				const choices = []
				for (const nav of navItems) {
					choices.push({ label: `📖 ${nav.title}`, value: `nav:${nav.href}` })
					if (nav.children) {
						for (const child of nav.children) {
							choices.push({ label: `  ↳ ${child.title}`, value: `nav:${child.href}` })
						}
					}
				}
				choices.push({ label: '──────────────────────────────', disabled: true })
				choices.push({ label: '🔧 Config Wizard', value: 'config' })
				choices.push({ label: '📦 Build Project (Data & UI)', value: 'build' })
				choices.push({ label: '🧬 Dev Mode (Hot-Reload)', value: 'dev' })
				choices.push({ label: '🧪 Test SSG', value: 'test:ssg' })
				choices.push({ label: '🧪 Test Web', value: 'test:web' })

				const res = yield ask('navigation', {
					command: {
						type: 'select',
						help: 'Select a page or command:',
						options: choices,
						required: true,
					},
				})
				if (res.cancelled) return
				this.command = res.value.command
			} else {
				const res = yield ask('Shell', ShellModel)
				if (res.cancelled) return
				Object.assign(this, res.value)
			}
		}

		if (this.command && this.command.startsWith('nav:')) {
			const href = this.command.replace('nav:', '')
			if (runner) {
				try {
					const { page, blocks } = await runner.renderPage(href)
					if (page) {
						const mdContent = pageBlocksToMarkdown(blocks)
						yield ask('pageViewer', {
							hint: 'content-viewer',
							title: page.title || href,
							content: mdContent,
						})
					} else {
						yield log('error', `Page not found: ${href}`)
					}
				} catch (/** @type {any} */ e) {
					yield log('error', `Failed to render page: ${e.message}`)
				}
			}
			this.command = null
			return
		}

		if (this.command !== 'cli' && this.command !== 'help') {
			yield log('info', `📡 Executing command: ${this.command}...`)
		}

		switch (this.command) {
			case 'run':
				return yield* this.#runEngine()
			case 'cli':
				return yield* this.#runCli()
			case 'config':
				return yield* this.#runConfig()
			case 'build':
				return yield* this.#runBuild()
			case 'dev':
				return yield* this.#runDev()
			case 'test:ssg':
			case 'ssg:gallery':
			case 'test:web':
			case 'web:gallery':
				return yield* this.#runNpmScript(this.command)
			default:
				yield log('error', `Unknown command: ${this.command}`)
		}

		this.command = null
	}

	async *#runCli() {
		const { spawn, locale, dsn } = this.#options
		if (!spawn) {
			yield log('error', 'Spawn utility missing. CLI mode requires Node environment.')
			return
		}

		const bankFrame = ' ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ '
		yield log(
			'success',
			`\x1b[1m\n${bankFrame}\n📡 Launching Sub-App CLI...\n${bankFrame}\n\x1b[22m`
		)

		let absPath = 'src/ui/cli/index.js'
		try {
			if (typeof process !== 'undefined' && process.versions?.node) {
				const path = await import(/* webpackIgnore: true */ 'node:path')
				absPath = path.resolve(absPath)
			}
		} catch (e) {}
		let existsSync = () => false
		try {
			if (typeof process !== 'undefined' && process.versions?.node) {
				const fs = await import(/* webpackIgnore: true */ 'node:fs')
				existsSync = fs.existsSync
			}
		} catch (e) {}
		if (!existsSync(absPath)) {
			yield log(
				'error',
				`No CLI runner found at ${absPath}. Ensure you are in the application root.`
			)
			return
		}

		const args = [absPath]
		if (this.locale) args.push('--locale', this.locale)
		if (this.data) args.push('--data', this.data)

		const extra = (process.argv || []).slice(3)
		args.push(...extra)

		try {
			const code = await spawn('node', args, { stdio: 'inherit' })
			if (code !== 0) yield log('error', `CLI exited with code ${code}`)
		} catch (/** @type {any} */ e) {
			yield log('error', `Failed to spawn CLI: ${e.message}`)
		}
	}

	async *#runEngine() {
		const { AppRunner, SSRServer } = this.#options
		if (!AppRunner) return yield log('error', 'AppRunner dependency missing')

		const runner = new AppRunner({
			dsn: this.data,
			port: this.port,
			locale: this.locale,
			directoryIndex: this.index,
			apps: this.#options.apps,
		})
		for await (const msg of runner.run()) {
			yield log('info', msg)
		}

		const server = new SSRServer(runner)
		const port = runner.config?.port || 3000
		const { protocol } = await server.listen(port)

		yield log('success', `\n🌐 Server running on ${protocol}://localhost:${port}`)

		// Keep alive in CLI mode
		if (typeof process !== 'undefined') {
			while (true) {
				await new Promise((r) => setTimeout(r, 60000))
			}
		}
	}

	async *#runConfig() {
		const { NaN0WebConfig, DBwithFSDriver } = this.#options
		const res = yield ask('config', NaN0WebConfig)
		if (res.cancelled) return

		const data = res.value
		if (typeof process !== 'undefined' && DBwithFSDriver) {
			const db = new DBwithFSDriver({ cwd: process.cwd() })
			await db.connect()
			await db.saveDocument('nan0web.config.yaml', {
				name: data.name,
				dsn: data.data || data.dsn,
				locale: data.locale,
				port: data.port,
				directoryIndex: data.index,
			})
			yield log('success', '\n✅ Config saved to nan0web.config.yaml')
		}
	}

	async *#runBuild() {
		const { spawn, AppRunner, SSRServer } = this.#options
		if (!spawn) return yield log('error', 'Spawn missing')

		let existsSync = (p) => false
		try {
			if (typeof process !== 'undefined' && process.versions?.node) {
				const fs = await import(/* webpackIgnore: true */ 'node:fs')
				existsSync = fs.existsSync
			}
		} catch (e) {}
		const viteConfig = existsSync('vite.docs.js')
			? 'vite.docs.js'
			: existsSync('vite.config.js')
				? 'vite.config.js'
				: null

		if (viteConfig) {
			yield log('info', `🛠 Building UI (Vite using ${viteConfig})...`)
			const exitCode = await spawn('npx', ['vite', 'build', '-c', viteConfig])
			if (exitCode !== 0) yield log('error', '⚠️ Vite build failed.')
		}

		const runner = new AppRunner({
			dsn: this.data,
			locale: this.locale,
			directoryIndex: this.index,
		})
		for await (const msg of runner.run()) yield log('info', msg)
		const server = new SSRServer(runner)
		const stats = await server.exportStatic('dist')
		yield log('success', `✅ Built ${stats.count}/${stats.total} pages into /dist`)
	}

	async *#runDev() {
		const { spawn } = this.#options
		if (!spawn) return yield log('error', 'Dev mode requires spawn')
		yield log('info', '🧬 Starting VITE Dev Server...')
		await spawn('npx', ['vite'], { stdio: 'inherit' })
	}

	async *#runNpmScript(script) {
		const { spawn } = this.#options
		if (!spawn) return
		yield log('info', `🔭 Running npm run ${script}...`)
		await spawn('npm', ['run', script], { stdio: 'inherit' })
	}
}

/**
 * Converts structured page blocks to markdown format.
 * @param {object[]} blocks
 * @returns {string}
 */
function pageBlocksToMarkdown(blocks) {
	const lines = []
	for (const block of blocks) {
		if (block.section) {
			if (Array.isArray(block.data)) {
				lines.push(pageBlocksToMarkdown(block.data))
			} else if (block.data && typeof block.data === 'object') {
				for (const [k, v] of Object.entries(block.data)) {
					lines.push(`**${k}**: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
				}
			}
		} else if (block.h1) lines.push(`# ${block.h1}\n`)
		else if (block.h2) lines.push(`## ${block.h2}\n`)
		else if (block.h3) lines.push(`### ${block.h3}\n`)
		else if (block.p) lines.push(`${block.p}\n`)
		else if (block.code) lines.push(`\`\`\`\n${block.code}\n\`\`\`\n`)
		else if (block.badge) lines.push(`**[${block.badge}]**\n`)
		else if (block.error) lines.push(`> ⚠️ **Error:** ${block.error}\n`)
		else if (block.items && Array.isArray(block.items)) {
			for (const item of block.items) {
				const icon = item.icon ? `${item.icon} ` : '- '
				lines.push(`${icon}**${item.title || item.label || ''}**`)
				if (item.description) lines.push(`  ${item.description}`)
				lines.push('')
			}
		} else if (block.cards && Array.isArray(block.cards)) {
			for (const card of block.cards) {
				lines.push(`### 📦 ${card.title || ''}`)
				if (card.description) lines.push(`* ${card.description}`)
				if (card.status) lines.push(`* Status: \`${card.status}\``)
				lines.push('')
			}
		} else if (block.form) {
			lines.push(`> 📝 **Form:** ${block.form.schema || 'unknown'}`)
			if (block.form.target) lines.push(`> → Target: \`${block.form.target}\``)
			lines.push('')
		} else if (block.header) {
			lines.push(`**🏷️ ${block.header.brand || block.header.title || ''}**\n`)
		} else if (block.hero) {
			if (block.hero.badge) lines.push(`**[${block.hero.badge}]**\n`)
			lines.push(`# ${block.hero.title || ''}\n`)
			if (block.hero.subtitle) lines.push(`*${block.hero.subtitle}*\n`)
			if (block.hero.code || block.hero.install)
				lines.push(`\`\`\`bash\n${block.hero.code || block.hero.install}\n\`\`\`\n`)
		} else if (block.footer) {
			lines.push(`---\n`)
			if (block.footer.license) lines.push(`📜 ${block.footer.license}\n`)
		} else if (block.nav && Array.isArray(block.nav)) {
			lines.push('### Navigation:')
			for (const n of block.nav) {
				lines.push(`* **${n.title || n.label}** → \`${n.href || ''}\``)
			}
			lines.push('')
		} else {
			const key = Object.keys(block)[0]
			if (key && (key.includes('.') || key.startsWith('ui-'))) {
				const props = block[key] || {}
				lines.push(`### 🧩 ${key}`)
				if (typeof props === 'object' && props !== null) {
					for (const [k, v] of Object.entries(props)) {
						if (k.startsWith('$')) continue
						lines.push(`* **${k}**: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
					}
				} else {
					lines.push(`* **value**: ${props}`)
				}
				lines.push('')
			} else if (key && typeof block[key] === 'string') {
				lines.push(block[key])
			} else {
				lines.push(JSON.stringify(block))
			}
		}
	}
	return lines.join('\n')
}
