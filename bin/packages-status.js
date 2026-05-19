import process from 'node:process'
import { StreamEntry } from '@nan0web/db'
import DB from '@nan0web/db-fs'
import Logger from '@nan0web/log'
import { TestPackage, RRS, runSpawn } from '@nan0web/test'
import { MDHeading1, MDHeading2, MDHeading3, MDHeading4 } from '@nan0web/markdown'
import { CLI, CommandParser, pause } from '@nan0web/ui-cli'
import { UiMessage } from '@nan0web/ui'
import path from 'node:path'
import { checkAllDocs } from '../src/docs.js'
import { createOutputProgress } from '../src/cli.js'

const logger = new Logger(Logger.detectLevel(process.argv))

class PackageStatusDB extends DB {
	static CACHE_FILE = '.cache/packages-status.json'
	/** @type {Map<string, { rrs: RRS, pkg: TestPackage }>} */
	cached = new Map()
	/** @type {Map<string, { rrs: RRS, pkg: TestPackage }>} */
	scores = new Map()
	/**
	 * @param {string} uri
	 * @returns {PackageStatusDB}
	 */
	extract(uri) {
		return PackageStatusDB.from(super.extract(uri))
	}

	/**
	 * @param {string} name
	 * @returns {*}
	 */
	getCache(name) {
		return this.cached.get(name)
	}

	/**
	 * @param {string} name
	 * @returns {RRS}
	 */
	getRSS(name) {
		const cache = this.getCache(name)
		const rrsInput = cache?.rrs ? { ...cache.rrs } : {}
		delete rrsInput.max
		/** @type {RRS} */
		return RRS.from(rrsInput)
	}

	/**
	 * Saves scores into <!-- %PACKAGE_STATUS% --> in README.md
	 * @returns {Promise<void>}
	 */
	async save() {
		const scores = Array.from(this.scores.entries())
		if (!scores.length) {
			return
		}
		const [, { rrs, pkg }] = scores[0]
		const table = [pkg.render(rrs, { head: true, body: false })]
		for (const [, { rrs, pkg }] of scores) {
			const features = []
			if (rrs.required.buildPass) features.push(`[🥒 d.ts](${pkg.baseURL}tree/main/types)`)
			const hasSystemMd = await pkg.db.statDocument('system.md').then(() => true).catch(() => false)
			if (hasSystemMd) features.push(`[📜 system.md](${pkg.baseURL}blob/main/system.md)`)
			if (rrs.optional.playground)
				features.push(`[🕹️ playground](${pkg.baseURL}blob/main/playground/main.js)`)
			table.push(pkg.render(rrs, { head: false, features }))
		}
		const md = await this.loadDocumentAs('.txt', 'README.md', '')
		if (md.includes('<!-- %PACKAGE_STATUS% -->')) {
			await this.saveDocument(
				'README.md',
				md.replace('<!-- %PACKAGE_STATUS% -->', table.join('\n')),
			)
		}
	}

	/**
	 * Fetches all packages and returns packages isolated database.
	 * onData function is a callack with count of fetched files and oneSec pass flag.
	 * @param {(entry: StreamEntry, count: number, spentMs: number, oneSec: boolean) => void} [onData]
	 * @returns {Promise<DB>}
	 */
	async connect(onData) {
		await super.connect()
		const stream = this.findStream('.', {
			filter: (entry) => {
				const path = entry.path || ''
				const isIgnored = ['/node_modules/', '/.git/', '/.cache/', '/dist/', 'node_modules/', '.git/', '.cache/', 'dist/', '3rdparty'].some((s) => path === s || path.includes(s))
				if (isIgnored) return false
				return path.startsWith('packages') || path.startsWith('apps') || path.startsWith('./packages') || path.startsWith('./apps')
			}
		})

		const start = Date.now()
		let count = 0
		let lastUpdate = 0
		const intervalMs = 1_000 // оновлювати раз на секунду
		const intervalCount = 50 // або кожні 50 файлів
		const terminalWidth = process.stdout.columns || 80

		const update = (entry, force = false) => {
			const now = Date.now()
			const elapsedMs = now - start
			if (!force && elapsedMs - lastUpdate < intervalMs && count % intervalCount !== 0) return

			let path = entry.file.path.slice(-Math.floor(terminalWidth * 0.5))
			if (entry.file.path.length > path.length) path = '…' + path

			if (onData) onData(entry, count, elapsedMs, true)
			lastUpdate = now
		}

		for await (const entry of stream) {
			++count
			update(entry, false)
		}

		update({ file: { path: 'done' } }, true)

		await this.#loadCache()
		return this
	}

	async #loadCache() {
		this.cached = new Map(await this.loadDocument(PackageStatusDB.CACHE_FILE, []))
	}

	async #saveCache() {
		await this.saveDocument(PackageStatusDB.CACHE_FILE, Array.from(this.scores.entries()))
	}

	/**
	 * @param {string} name
	 * @param {{ rrs: RRS, pkg: TestPackage }} score
	 * @returns {Promise<void>}
	 */
	async setScore(name, score) {
		this.scores.set(name, score)
		await this.#saveCache()
	}
}

class NaN0WebPackageConfig {
	/** @type {string} */
	name
	constructor(input = {}) {
		const { name = '' } = input
		this.name = String(name)
	}
	// @todo check for the proper pkgConfig.url or similar refering to the source, if not defined return the default
	/** @returns {string} */
	get baseURL() {
		if (!this.name) return ''
		return ('https://github.com/' + this.name + '/').replace(
			'://github.com/@nan0web/',
			'://github.com/nan0web/',
		)
	}
	/**
	 * @param {any} input
	 * @returns {NaN0WebPackageConfig}
	 */
	static from(input) {
		if (input instanceof NaN0WebPackageConfig) return input
		return new NaN0WebPackageConfig(input)
	}
}

class StatusCommandBody {
	/** @type {string[]} */
	ignore = []
	static ignore = {
		alias: 'i',
		help: 'Ignored packages',
		defaultValue: [],
	}
	/** @type {boolean} */
	todo
	static todo = {
		help: 'Show todo list',
		defaultValue: false,
	}
	/** @type {boolean} */
	fix
	static fix = {
		help: 'Fix incomplete configurations',
		defaultValue: false,
	}
	constructor(input = {}) {
		const { ignore = [], todo = false, fix = false } = UiMessage.parseBody(input, StatusCommandBody)
		this.ignore = Array.isArray(ignore) ? ignore : [String(ignore)]
		this.todo = Boolean(todo)
		this.fix = Boolean(fix)
	}
	/**
	 * @param {any} input
	 * @returns {StatusCommandBody}
	 */
	static from(input) {
		if (input instanceof StatusCommandBody) return input
		return new StatusCommandBody(input)
	}
}

class StatusCommandMessage extends UiMessage {
	static Body = StatusCommandBody
	static id = 0
	/** @type {StatusCommandBody} */
	body
	constructor(input = {}) {
		super(input)
		this.id = 'status-' + ++StatusCommandMessage.id
		this.type = UiMessage.TYPES.COMMAND
		this.body = StatusCommandBody.from(input.body ?? {})
	}
}

class StatusCommand extends CLI {
	static Message = StatusCommandMessage
	constructor() {
		super({
			name: 'status',
			help: 'Packages status collector',
		})
		this.fs = new PackageStatusDB()
		this.packageDirs = new Set()
		this.longest = 0
		this.depMap = {}
	}
	async findPackages(db, ignore = []) {
		const errors = []
		this.longest = 0
		this.packageDirs = new Map()
		for (const [key] of db.meta) {
			const norm = db.relative(db.root, key)
			const parts = norm.split('/')
			if (parts.length === 3) {
				const [parent, name, dir] = parts
				try {
					if (('packages' === parent || 'apps' === parent) && 'package.json' === dir) {
						if (!ignore.includes(name)) {
							const pkgConfig = await db.loadDocument(parent + '/' + name + '/package.json', {})
							const config = NaN0WebPackageConfig.from(pkgConfig)
							this.packageDirs.set(parent + '/' + name, config)
							this.longest = Math.max(config.name.length, this.longest)
						}
					}
				} catch (err) {
					errors.push(err)
				}
			}
		}
		return errors
	}
	/**
	 * @param {StatusCommandMessage} msg
	 */
	async run(msg) {
		logger.debug('Command message:')
		logger.debug(JSON.stringify(msg))
		const format = new Intl.NumberFormat('en-US').format
		let chunks = ['Reading packages …']
		const connectOpts = { logger: logger, chunks, fps: 33 }
		const connectInterval = createOutputProgress(connectOpts)
		const db = await this.fs.connect((entry, count, spentMs) => {
			chunks.push(`${format(count)} ${Number(spentMs / 1000).toFixed(1)}s ${entry.file.path}`)
		})
		const ws = await this.fs.loadDocument('pnpm-workspace.yaml', {})
		const pkgs = new Set()
		for (const [uri] of db.meta.entries()) {
			const parts = uri.split('/')
			if (parts.length >= 2 && ('packages' === parts[0] || 'apps' === parts[0])) {
				pkgs.add(parts[0] + '/' + parts[1])
			}
		}
		await pause(33)
		clearInterval(connectInterval)
		logger.cursorUp(connectOpts.printed || 0, true)
		logger.info(`Read ${format(db.meta.size)} items read from ${format(pkgs.size)} packages and apps`)

		const errors = await this.findPackages(db, msg.body.ignore)
		errors.forEach((e) => logger.warn(e.stack ?? e.message))

		const wsPkgs = new Set(this.packageDirs.keys())

		chunks = ['Checking docs …']
		const onChunk = (msg, error) => {
			chunks.push(error ? Logger.RED : '' + msg + Logger.RESET)
		}
		const docsOpts = { chunks, logger: logger, fps: 33 }
		const docsInterval = createOutputProgress(docsOpts)
		const docs = await checkAllDocs({
			fs: this.fs,
			pkgs: Array.from(wsPkgs),
			logger: logger,
			chunks,
			onChunk,
		})
		this.depMap = docs.deps
		await pause(33)
		clearInterval(docsInterval)
		logger.cursorUp(docsOpts.printed || 0, true)
		const requiredIncorrect = docs.incorrect.filter(
			(d) => d.missing.includes('README.md.js') || d.missing.includes('README.md')
		)
		const translationIncorrect = docs.incorrect.filter(
			(d) => !d.missing.includes('README.md.js') && !d.missing.includes('README.md') && d.missing.includes('docs/uk/README.md')
		)

		if (requiredIncorrect.length) {
			logger.warn(`  ${requiredIncorrect.length} packages/apps are missing required README.md or README.md.js:`)
			requiredIncorrect.forEach(({ name, missing }) => {
				const reqMissing = missing.filter((m) => m !== 'docs/uk/README.md')
				logger.info(`  - ${name} (missing ${reqMissing.join(', ')})`)
			})
		}
		if (translationIncorrect.length) {
			logger.info(`  ${translationIncorrect.length} packages/apps lack Ukrainian translation (docs/uk/README.md)`)
		}
		if (docs.incorrect.length === 0) {
			logger.info(`  all packages have required docs and translations`)
		}

		let i = 0
		for (const [dirName, config] of this.packageDirs) {
			try {
				await this.collectPackage(config, dirName, db, ++i, wsPkgs)
			} catch (err) {
				logger.error(err.stack ?? err.message)
			}
		}
		logger.info('\nLegend:')
		logger.info('  1. Build passes             2. Tests pass               3. tsconfig.json present')
		logger.info('  4. LICENSE & CONTRIBUTING   5. Playground script        6. README.md present')
		logger.info('  7. ProvenDoc (README.md.js)  8. Published on npm\n')
		await this.fs.save()
		if (msg.body.todo) {
			this.renderTodo()
		}
		if (msg.body.fix) {
			let i = 0
			for (const { rrs, pkg } of this.fs.scores.values()) {
				try {
					await this.fixPackage(pkg, rrs, ++i)
				} catch (err) {
					logger.error(`Cannot fix package packages/${pkg.name}: ${err.message}`)
					logger.debug(err.stack)
				}
			}
		}
	}

	/**
	 *
	 * @param {NaN0WebPackageConfig} pkgName
	 * @param {string} dirName
	 * @param {DB} db
	 * @param {number} i
	 * @param {Set} pkgs
	 */
	async collectPackage(pkgConfig, dirName, db, i, pkgs = new Set()) {
		const rrs = this.fs.getRSS(pkgConfig.name)
		const cache = this.fs.getCache(pkgConfig.name)

		const pkg = new TestPackage({
			cwd: db.absolute(dirName),
			db: db.extract(dirName),
			name: pkgConfig.name,
			// @todo check for the proper pkgConfig.url or similar refering to the source, if not defined return the default
			baseURL: pkgConfig.baseURL,
		})

		const no =
			(pkgs.has(dirName) ? '' : Logger.DIM) +
			String(i).padStart(String(this.packageDirs.size).length, ' ') +
			'. '

		const spaces = ' '.repeat(this.longest - pkgConfig.name.length)
		let message = `${pkgConfig.name} ${spaces}`
		const errors = []
		logger.info(no + message + Logger.RESET)
		logger.info('') // status line

		const startRun = Date.now()
		const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
		let spinnerIdx = 0
		let currentCommand = ''
		let lastOutputLine = ''
		const onOutput = (line) => {
			lastOutputLine = line.slice(0, (process.stdout.columns || 80) - 25)
		}
		const interval = setInterval(() => {
			if (currentCommand) {
				logger.cursorUp(1, true)
				const frame = spinnerFrames[spinnerIdx++ % spinnerFrames.length]
				const suffix = lastOutputLine ? ` > ${lastOutputLine}` : ''
				logger.info(logger.cut(`${frame} ${currentCommand}${suffix}`))
			}
		}, 80)

		try {
			for await (const msg of pkg.run(rrs, cache, onOutput)) {
				message += msg.value
				if (!msg.value) {
					lastOutputLine = ''
				}
				currentCommand = msg.value ? '' : msg.name
				logger.cursorUp(2, true)
				logger.info(no + message)
				logger.info(logger.cut(currentCommand || 'done'))
			}
		} catch (err) {
			errors.push(err)
		} finally {
			clearInterval(interval)
		}
		if (!pkg.cachedHit) {
			rrs.testDuration = Date.now() - startRun
		}

		const timeStr = pkg.cachedHit
			? (rrs.testDuration ? ` (${(rrs.testDuration / 1000).toFixed(1)}s cached)` : ' (cached)')
			: (rrs.testDuration ? ` (${(rrs.testDuration / 1000).toFixed(1)}s)` : '')
		message += ' = ' + rrs.icon('') + timeStr + '\n'
		if (errors.length) {
			errors.forEach((e) => logger.error(e.stack ?? e.message))
		}
		logger.cursorUp(2, true)
		if (message.endsWith(' 0.0%\n')) {
			logger.error(no + message.trim())
		} else {
			logger.info(no + message.trim())
		}

		await this.fs.setScore(pkgConfig.name, { rrs, pkg })
	}

	/**
	 * Fix the package.
	 * @param {TestPackage} pkg
	 * @param {RRS} rrs
	 * @param {number} index
	 */
	async fixPackage(pkg, rrs, index) {
		const pkgJson = await pkg.db.loadDocument('package.json')
		if (!pkgJson) {
			throw new Error('Missing package.json. Create it first.')
		}
		const space = ' '.repeat(this.longest - pkg.name.length)
		if (!pkgJson.scripts) {
			pkgJson.scripts = {}
		}
		for (const [key, value] of Object.entries(pkg.SCRIPTS)) {
			const current = pkgJson.scripts[key]
			if (!current) {
				pkgJson.scripts[key] = value
			} else if (current !== value) {
				logger.warn(`${pkg.name} ${space}scripts.${key} = ${current}`)
			}
		}
		if (!pkgJson.devDependencies) {
			pkgJson.devDependencies = {}
		}
		for (const [key, value] of Object.entries(pkg.DEV_DEPENDENCIES)) {
			const current = pkgJson?.devDependencies[key]
			if (!current) {
				pkgJson.devDependencies[key] = value
			} else if (current !== value) {
				logger.warn(`${pkg.name} incorrect devDependencies.${key} = ${current}`)
			}
		}
		if (!pkgJson.files) {
			pkgJson.files = pkg.NPM_FILES
		}
		const prev = await pkg.db.loadDocument('package.json')
		const pkgChanged = JSON.stringify(prev) !== JSON.stringify(pkgJson)
		if (pkgChanged) {
			await pkg.db.saveDocument('package.json', pkgJson)
			logger.info(`${pkg.name} / package.json updated 💿\n`)
		}

		const dirName = path.basename(pkg.cwd)
		let readmeTest = await pkg.db.loadDocument('src/README.md.js', '')
		if ('' === readmeTest) {
			readmeTest = await pkg.db.loadDocument('src/docs/README.md.js', '')
		}


		const tsConfig = await pkg.db.loadDocumentAs('.txt', 'tsconfig.json', '')
		if ('' === tsConfig) {
			const template = await this.fs.loadDocument('tsconfig.json')
			await pkg.db.saveDocument('tsconfig.json', template)
			logger.info(`${pkg.name} / tsconfig.json 💿\n`)
		}
	}

	renderTodo() {
		const todo = Array.from(this.packageDirs).map((name) => ({
			name,
			...this.fs.scores.get(name),
		}))
		todo.sort((a, b) => b.rrs.percentage - a.rrs.percentage)
		const root = new MDHeading1({ content: 'TODO' })
		for (const { name, pkg, rrs } of todo) {
			const md = pkg.toMarkdown(rrs)
			root.add(new MDHeading2({ content: '@nan0web/' + name }))
			md.map((el) =>
				el instanceof MDHeading1
					? MDHeading3.from(el)
					: el instanceof MDHeading2
						? MDHeading3.from(el)
						: el instanceof MDHeading3
							? MDHeading4.from(el)
							: el,
			).forEach((el) => root.add(el))
		}
		logger.info(String(root))
	}
}

const command = new StatusCommand()
const parser = new CommandParser([StatusCommandMessage])
const args = process.argv.slice(2)
const msg = parser.parse(args.length ? args : ['--status'])
logger.debug((msg.constructor?.name ?? '') + ': ' + JSON.stringify(msg))
command
	.run(msg)
	.then(() => {
		process.exit(0)
	})
	.catch((err) => {
		logger.error(err.message)
		logger.debug(err.stack)
		process.exit(1)
	})
