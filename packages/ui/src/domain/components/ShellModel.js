import { Model } from '@nan0web/types'
import { ask, log } from '../../core/Intent.js'

/**
 * ShellModel — OLMUI Component Model for CLI Orchestration
 * Canonical CLI entry that describes available operations as a schema.
 */
export class ShellModel extends Model {
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
		default: '3000',
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

		if (!this.command || this.command === 'help') {
			const res = yield ask('Shell', ShellModel)
			if (res.cancelled) return
			Object.assign(this, res.value)
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
			`\x1b[1m\n${bankFrame}\n📡 Launching Sub-App CLI...\n${bankFrame}\n\x1b[22m`,
		)

		const absPath = (await import('node:path')).resolve('src/ui/cli/index.js')
		const { existsSync } = await import('node:fs')
		if (!existsSync(absPath)) {
			yield log(
				'error',
				`No CLI runner found at ${absPath}. Ensure you are in the application root.`,
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

		const { existsSync } = await import('node:fs')
		const viteConfig = existsSync('vite.docs.js') ? 'vite.docs.js' :
						  existsSync('vite.config.js') ? 'vite.config.js' : null

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
