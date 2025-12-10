import process from "node:process"
import { StreamEntry } from '@nan0web/db'
import DB from '@nan0web/db-fs'
import Logger from '@nan0web/log'
import { TestPackage, RRS, runSpawn } from "@nan0web/test"
import { MDHeading1, MDHeading2, MDHeading3, MDHeading4 } from "@nan0web/markdown"
import { CLI, CommandParser, pause } from "@nan0web/ui-cli"
import { UiMessage } from "@nan0web/ui"
import path from "node:path"
import { checkAllDocs } from '../src/docs.js'
import { getProvenDocs, getPlayground, getSystem } from '../src/llm/templates/index.js'
import { createOutputProgress } from "../src/cli.js"

const logger = new Logger(Logger.detectLevel(process.argv))

class PackageStatusDB extends DB {
	static CACHE_FILE = ".cache/packages-status.json"
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
		/** @type {RRS} */
		return RRS.from(cache?.rrs ?? {})
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
		scores.forEach(
			([, { rrs, pkg }]) => {
				const features = []
				if (rrs.required.buildPass) features.push(`[🥒 d.ts](${pkg.baseURL}tree/main/types)`)
				if (rrs.required.systemMd) features.push(`[📜 system.md](${pkg.baseURL}blob/main/system.md)`)
				if (rrs.optional.playground) features.push(`[🕹️ playground](${pkg.baseURL}blob/main/playground/main.js)`)
				table.push(pkg.render(rrs, { head: false, features }))
			}
		)
		const md = await this.loadDocumentAs(".txt", "README.md", "")
		if (md.includes("<!-- %PACKAGE_STATUS% -->")) {
			await this.saveDocument("README.md", md.replace("<!-- %PACKAGE_STATUS% -->", table.join("\n")))
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
		const stream = this.findStream("packages/", {
			filter: (entry) => !["/node_modules/", "/.git/"].some(s => entry.path.includes(s))
		})

		const start = Date.now()
		let count = 0
		let lastUpdate = 0
		const intervalMs = 1_000     // оновлювати раз на секунду
		const intervalCount = 50     // або кожні 50 файлів
		const terminalWidth = process.stdout.columns || 80

		const update = (entry, force = false) => {
			const now = Date.now()
			const elapsedMs = now - start
			if (!force && elapsedMs - lastUpdate < intervalMs && count % intervalCount !== 0) return

			let path = entry.file.path.slice(-Math.floor(terminalWidth * 0.5))
			if (entry.file.path.length > path.length) path = "…" + path

			if (onData) onData(entry, count, elapsedMs, true)
			lastUpdate = now
		}

		for await (const entry of stream) {
			++count
			update(entry, false)
		}

		update({ file: { path: "done" } }, true)

		await this.#loadCache()
		return this.extract("packages/")
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
		const {
			name = ""
		} = input
		this.name = String(name)
	}
	// @todo check for the proper pkgConfig.url or similar refering to the source, if not defined return the default
	/** @returns {string} */
	get baseURL() {
		if (!this.name) return ""
		return ("https://github.com/" + this.name + "/").replace(
			"://github.com/@nan0web/", "://github.com/nan0web/"
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
		alias: "i",
		help: "Ignored packages",
		defaultValue: []
	}
	/** @type {boolean} */
	todo
	static todo = {
		help: "Show todo list",
		defaultValue: false
	}
	/** @type {boolean} */
	fix
	static fix = {
		help: "Fix incomplete configurations",
		defaultValue: false
	}
	constructor(input = {}) {
		const {
			ignore = [],
			todo = false,
			fix = false,
		} = UiMessage.parseBody(input, StatusCommandBody)
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
		this.id = "status-" + ++StatusCommandMessage.id
		this.type = UiMessage.TYPES.COMMAND
		this.body = StatusCommandBody.from(input.body ?? {})
	}
}

class StatusCommand extends CLI {
	static Message = StatusCommandMessage
	constructor() {
		super({
			"name": "status",
			"help": "Packages status collector"
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
			const [name, dir, file] = norm.split("/")
			try {
				if ("package.json" === dir && undefined === file && !ignore.includes(name)) {
					const pkgConfig = await db.loadDocument(name + "/package.json", {})
					const config = NaN0WebPackageConfig.from(pkgConfig)
					this.packageDirs.set(name, config)
					this.longest = Math.max(config.name.length, this.longest)
				}
			} catch (err) {
				errors.push(err)
			}
		}
		return errors
	}
	/**
	 * @param {StatusCommandMessage} msg
	 */
	async run(msg) {
		logger.debug("Command message:")
		logger.debug(JSON.stringify(msg))
		const format = new Intl.NumberFormat("en-US").format
		let chunks = ["Reading packages …"]
		const connectOpts = { logger: logger, chunks, fps: 33 }
		const connectInterval = createOutputProgress(connectOpts)
		const db = await this.fs.connect((entry, count, spentMs) => {
			chunks.push(`${format(count)} ${Number(spentMs / 1000).toFixed(1)}s ${entry.file.path}`)
		})
		const ws = await this.fs.loadDocument("pnpm-workspace.yaml", {})
		const pkgs = new Set()
		for (const [uri] of db.meta.entries()) {
			const [name] = uri.split("/")
			if (["_", "."].some(s => name.includes(s))) continue
			pkgs.add(name)
		}
		await pause(33)
		clearInterval(connectInterval)
		logger.cursorUp(connectOpts.printed || 0, true)
		const wsPkgs = new Set(
			ws.packages.filter(p => p.startsWith("packages/")).map(p => p.slice(9))
		)
		logger.info(`Read ${format(db.meta.size)} items read from ${format(pkgs.size)} packages`)

		const errors = await this.findPackages(db, msg.body.ignore)
		errors.forEach(e => logger.warn(e.stack ?? e.message))

		chunks = ["Checking docs …"]
		const onChunk = (msg, error) => {
			chunks.push(error ? Logger.RED : "" + msg + Logger.RESET)
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
		if (docs.incorrect.length) {
			logger.error(`  ${docs.incorrect.length} packages are preapared for LLiMo transformation`)
			docs.incorrect.forEach(i => logger.info(`  - ${i}`))
		} else {
			logger.info(`  all packages have required docs`)
		}

		let i = 0
		for (const [dirName, config] of this.packageDirs) {
			try {
				await this.collectPackage(config, dirName, db, ++i, wsPkgs)
			} catch (err) {
				logger.error(err.stack ?? err.message)
			}
		}
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

		const no = (pkgs.has(dirName) ? "" : Logger.DIM)
			+ String(i).padStart(String(this.packageDirs.size).length, " ") + ". "

		const spaces = " ".repeat(this.longest - pkgConfig.name.length)
		let message = `${pkgConfig.name} ${spaces}`
		const errors = []
		logger.info(no + message + Logger.RESET)
		logger.info("")  // status line

		try {
			for await (const msg of pkg.run(rrs, cache)) {
				message += msg.value
				logger.cursorUp(2, true)
				logger.info(no + message)
				logger.info(logger.cut(msg.name))
			}
		} catch (err) {
			errors.push(err)
		}

		message += " = " + rrs.icon("") + "\n"
		if (errors.length) {
			errors.forEach(e => logger.error(e.stack ?? e.message))
		}
		logger.cursorUp(2, true)
		if (message.endsWith(" 0.0%\n")) {
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
		const pkgJson = await pkg.db.loadDocument("package.json")
		if (!pkgJson) {
			throw new Error("Missing package.json. Create it first.")
		}
		const cwd = pkg.db.absolute()
		const gitStatus = await runSpawn("git", ["status", "--porcelain"], { cwd })
		const ignore = ["package.json"]
		const pending = gitStatus.text.split("\n").filter(Boolean).map(s => s.slice(3)).filter(s => !ignore.includes(s))
		if (0 !== gitStatus.code) {
			throw new Error("Seems git is not initialized in the directory: " + cwd)
		}
		if (pending.length > 0) {
			throw new Error("Pending changes in git. Commit all changes before fix.")
		}
		const space = " ".repeat(this.longest - pkg.name.length)
		if (!pkgJson.scripts) {
			pkgJson.scripts = {}
		}
		for (const [key, value] of Object.entries(pkg.SCRIPTS)) {
			const current = pkgJson.scripts[key]
			if (!current) {
				pkgJson.scripts[key] = value
			}
			else if (current !== value) {
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
			}
			else if (current !== value) {
				logger.warn(`${pkg.name} incorrect devDependencies.${key} = ${current}`)
			}
		}
		if (!pkgJson.files) {
			pkgJson.files = pkg.NPM_FILES
		}
		const prev = await pkg.db.loadDocument("package.json")
		const pkgChanged = JSON.stringify(prev) !== JSON.stringify(pkgJson)
		if (pkgChanged) {
			await pkg.db.saveDocument("package.json", pkgJson)
			let content = ""
			const onData = (chunk) => {
				content += String(chunk)
				const rows = content.split("\n").filter(Boolean)
				logger.cursorUp(1, true)
				const recent = rows.slice(-1)[0] ?? ""
				logger.info(logger.cut(recent))
			}
			logger.info(`${pkg.name} / pnpm update\n`)
			const npmUpdate = await runSpawn("pnpm", ["update"], { cwd, onData })
			logger.cursorUp(1, true)
			if (0 !== npmUpdate.code) {
				throw new Error("Cannot update node_modules\n" + content)
			}
		}

		const husky = pkg.db.loadDocument(".husky/pre-commit", "")
		if ("" === husky) {
			content = ""
			logger.info(`${pkg.name} / pnpm prepare\n`)
			const huskyInstall = runSpawn("pnpm", ["prepare"], { cwd, onData })
			logger.cursorUp(1, true)
			if (0 !== huskyInstall.code) {
				throw new Error("Cannot update node_modules\n" + content)
			}
		}

		const dirName = path.basename(pkg.cwd)
		const readmeTest = await pkg.db.loadDocument("src/README.md.js", "")
		if ("" === readmeTest) {
			const content = getProvenDocs().replaceAll("$pkgDir", dirName).replaceAll("$pkgName", pkg.name)
			await pkg.db.saveDocument("src/README.md.js", content)
		}

		const playground = await pkg.db.loadDocument("playground/main.js", "")
		if ("" === playground) {
			const content = getPlayground().replaceAll("$pkgDir", dirName)
			await pkg.db.saveDocument("playground/main.js", content)
		}

		const systemMd = await pkg.db.loadDocument("system.md", "")
		if ("" === systemMd) {
			const content = getSystem().replaceAll("$pkgName", pkg.name)
			await pkg.db.saveDocument("system.md", content)
		}

		const tsConfigTemplate = await this.fs.loadDocumentAs(".txt", "tsconfig.json")
		const tsConfig = await pkg.db.loadDocumentAs(".txt", "tsconfig.json")
		if (tsConfigTemplate !== tsConfig) {
			const template = await this.fs.loadDocument("tsconfig.json")
			await pkg.db.saveDocument("tsconfig.json", template)
			logger.info(`${pkg.name} / tsconfig.json 💿\n`)
		}
	}

	renderTodo() {
		const todo = Array.from(this.packageDirs).map(
			name => ({ name, ...this.fs.scores.get(name) })
		)
		todo.sort((a, b) => b.rrs.percentage - a.rrs.percentage)
		const root = new MDHeading1({ content: "TODO" })
		for (const { name, pkg, rrs } of todo) {
			const md = pkg.toMarkdown(rrs)
			root.add(new MDHeading2({ content: "@nan0web/" + name }))
			md.map(
				el => el instanceof MDHeading1 ? MDHeading3.from(el)
					: el instanceof MDHeading2 ? MDHeading3.from(el)
						: el instanceof MDHeading3 ? MDHeading4.from(el)
							: el
			).forEach(el => root.add(el))
		}
		logger.info(String(root))
	}

}

const command = new StatusCommand()
const parser = new CommandParser([
	StatusCommandMessage,
])
const msg = parser.parse(process.argv.slice(2))
logger.debug((msg.constructor?.name ?? '') + ": " + JSON.stringify(msg))
command.run(msg).then(() => {
	process.exit(0)
}).catch(err => {
	logger.error(err.message)
	logger.debug(err.stack)
	process.exit(1)
})


