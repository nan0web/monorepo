import { Model } from '@nan0web/types'
import { resolve, basename } from 'node:path'

/**
 * Initializes a new OLMUI project (JS, TS, or PY)
 *
 * @property {string} dir Target directory to initialize
 * @property {'js'|'ts'|'py'} lang Language for the project (js, ts, or py)
 * @property {boolean} quiet Quiet mode
 */
export class InitProjectModel extends Model {
	/**
	 * @param {Partial<InitProjectModel> | Record<string, any>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
	 */
	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, options)
		/** @type {any} Target directory to initialize */ this.dir
		/** @type {any} Language for the project (js, ts, or py) */ this.lang
		/** @type {boolean} Quiet mode */ this.quiet
	}

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

	#db = null

	get db() {
		// @ts-ignore — Model base class may not declare db
		return super.db || this.#db
	}

	set db(val) {
		this.#db = val
	}

	async *run() {
		const absoluteDir = resolve(process.cwd(), this.dir)
		const projectName = basename(absoluteDir) || 'app'

		if (!(/** @type {any} */ (this._).db)) {
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

		yield {
			type: 'progress',
			message: `Initializing ${this.lang.toUpperCase()} project: ${projectName}`,
		}

		// 1. package.json only if generating JS/TS and it doesn't exist
		if (['js', 'ts'].includes(this.lang)) {
			if (
				!(await /** @type {any} */ (this._).db.has?.('package.json')) &&
				!(await /** @type {any} */ (this._).db.get?.('package.json'))
			) {
				const isTs = this.lang === 'ts'
				const pj = {
					name: projectName,
					version: '1.0.0',
					type: 'module',
					main: 'index.js',
					scripts: {
						test: 'node --test src/**/*.test.js',
					},
				}
				await /** @type {any} */ (this._).db.set?.('package.json', pj)
				yield { type: 'log', level: 'success', message: InitProjectModel.UI.PACKAGE_JSON_CREATED }
			}
		}

		// 2. Create directory structure
		const dirs = ['src/domain', 'src/Chat/commands', 'docs', 'bin']
		for (const d of dirs) {
			if (/** @type {any} */ (this._).db?.mkdir) {
				await /** @type {any} */ (this._).db.mkdir(d)
			} else if (/** @type {any} */ (this._).db?.driver?.ensureDir) {
				await /** @type {any} */ (this._).db.driver.ensureDir(/** @type {any} */ (this._).db.absolute(d))
			} else {
				// DB Fallback
				await /** @type {any} */ (this._).db.set?.(`${d}/.keep`, '')
			}
		}
		yield { type: 'log', level: 'success', message: InitProjectModel.UI.DIR_STRUCTURE_CREATED }

		// 3. Install dependencies for JS/TS
		if (['js', 'ts'].includes(this.lang)) {
			yield { type: 'progress', message: InitProjectModel.UI.NPM_INSTALL_RUN }
			const { execSync } = await import('node:child_process')
			try {
				execSync('npm install @nan0web/types @nan0web/ui-cli', {
					cwd: absoluteDir,
					stdio: this.quiet ? 'ignore' : 'pipe',
				})
				yield {
					type: 'log',
					level: 'success',
					message: InitProjectModel.UI.NPM_INSTALL_SUCCESS,
				}
			} catch (err) {
				yield {
					type: 'log',
					level: 'warning',
					message: InitProjectModel.UI.NPM_INSTALL_FAILED,
				}
			}
		}

		yield { type: 'result', data: { success: true }, message: InitProjectModel.UI.SUCCESS }
	}
}
