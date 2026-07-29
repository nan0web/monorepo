import { ModelAsApp, show, progress, result } from '@nan0web/ui'
import { resolve, basename } from 'node:path'

/**
 * Initializes a new OLMUI project (JS, TS, or PY)
 *
 * @property {string} dir Target directory to initialize
 * @property {'js'|'ts'|'py'} lang Language for the project (js, ts, or py)
 * @property {boolean} quiet Quiet mode
 */
export class InitProjectModel extends ModelAsApp {
	static alias = 'init'

	static dir = {
		help: 'Target directory to initialize',
		default: '.',
		positional: true,
	}

	static lang = {
		help: 'Language for the project (js, ts, or py)',
		default: 'js',
		options: ['js', 'ts', 'py'],
	}

	static quiet = {
		help: 'Quiet mode',
		default: false,
		type: 'boolean',
		alias: 'q',
	}

	static UI = {
		PACKAGE_JSON_CREATED: `✔ Created package.json (ESM)`,
		DIR_STRUCTURE_CREATED: '✔ Created OLMUI directory structure',
		NPM_INSTALL_RUN: 'Running npm install...',
		NPM_INSTALL_SUCCESS: '✔ Installed dependencies (@nan0web/types, @nan0web/ui-cli)',
		NPM_INSTALL_FAILED: '⚠ npm install failed or skipped (run manually)',
		SUCCESS: 'Project initialized successfully!',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Target directory to initialize */ this.dir = data.dir || '.'
		/** @type {'js'|'ts'|'py'} Language for the project */ this.lang = data.lang || 'js'
		/** @type {boolean} Quiet mode */ this.quiet = Boolean(data.quiet)
	}

	async *run() {
		const { t, db } = this._
		const absoluteDir = resolve(process.cwd(), this.dir)
		const projectName = basename(absoluteDir) || 'app'

		if (!db) {
			const [{ default: DB }, { default: FSDriver }] = await Promise.all([
				import('@nan0web/db'),
				import('@nan0web/db-fs/src/FSDriver.js'),
			])
			const _this = /** @type {any} */ (this._)
			_this.db = new (/** @type {any} */ (DB))({
				cwd: process.cwd(),
				root: absoluteDir,
				driver: new (/** @type {any} */ (FSDriver))({ root: absoluteDir, cwd: process.cwd() }),
				console: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
			})
			await /** @type {any} */ (this._).db.driver.connect?.()
		}

		const activeDb = /** @type {any} */ (this._.db)

		yield progress(t(`Initializing ${this.lang.toUpperCase()} project: ${projectName}`))

		// 1. package.json only if generating JS/TS and it doesn't exist
		if (['js', 'ts'].includes(this.lang)) {
			const hasPj = (await activeDb.has?.('package.json')) || (await activeDb.get?.('package.json'))
			if (!hasPj) {
				const pj = {
					name: projectName,
					version: '1.0.0',
					type: 'module',
					main: 'index.js',
					scripts: {
						test: 'node --test src/**/*.test.js',
					},
				}
				await activeDb.set?.('package.json', pj)
				yield show(t(InitProjectModel.UI.PACKAGE_JSON_CREATED), 'success')
			}
		}

		// 2. Create directory structure
		const dirs = ['src/domain', 'src/Chat/commands', 'docs', 'bin']
		for (const d of dirs) {
			if (activeDb?.mkdir) {
				await activeDb.mkdir(d)
			} else if (activeDb?.driver?.ensureDir) {
				await activeDb.driver.ensureDir(activeDb.absolute(d))
			} else {
				// DB Fallback
				await activeDb.set?.(`${d}/.keep`, '')
			}
		}
		yield show(t(InitProjectModel.UI.DIR_STRUCTURE_CREATED), 'success')

		// 3. Install dependencies for JS/TS
		if (['js', 'ts'].includes(this.lang)) {
			yield progress(t(InitProjectModel.UI.NPM_INSTALL_RUN))
			const { execSync } = await import('node:child_process')
			try {
				execSync('npm install @nan0web/types @nan0web/ui-cli', {
					cwd: absoluteDir,
					stdio: this.quiet ? 'ignore' : 'pipe',
				})
				yield show(t(InitProjectModel.UI.NPM_INSTALL_SUCCESS), 'success')
			} catch (err) {
				yield show(t(InitProjectModel.UI.NPM_INSTALL_FAILED), 'warn')
			}
		}

		yield show(t(InitProjectModel.UI.SUCCESS), 'success')
		return result({ success: true })
	}
}
