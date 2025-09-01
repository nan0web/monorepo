import process from "node:process"
import { StreamEntry } from '@nan0web/db'
import DB from '@nan0web/db-fs'
import Logger from '@nan0web/log'
import { TestPackage, RRS, runSpawn } from "@nan0web/test"
import { MDHeading1, MDHeading2, MDHeading3, MDHeading4 } from "@nan0web/markdown"
import { Command, CommandMessage } from "@nan0web/co"

const console = new Logger(Logger.detectLevel(process.argv))

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
		const [, { rrs, pkg }] = scores[0]
		const table = [pkg.render(rrs, { head: true, body: false })]
		scores.forEach(
			([, { rrs, pkg }]) => {
				const features = []
				if (rrs.required.buildPass) features.push(`[🥒 d.ts](${pkg.baseURL}tree/main/types)`)
				if (rrs.required.systemMd) features.push(`[📜 system.md](${pkg.baseURL}blob/main/system.md)`)
				if (rrs.optional.playground) features.push(`[🕹️ playground](${pkg.baseURL}blob/blob/playground/main.js)`)
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
			filter: (uri) => !uri.inIncludes("/node_modules/", "/.git/")
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
	 * @param {string} pkgName
	 * @param {{ rrs: RRS, pkg: TestPackage }} score
	 * @returns {Promise<void>}
	 */
	async setScore(pkgName, score) {
		this.scores.set(pkgName, score)
		await this.#saveCache()
	}
}

class StatusCommandOptions {
	/** @type {string[]} */
	ignore = []
	/** @type {boolean} */
	todo
	/** @type {boolean} */
	fix
	constructor(input) {
		const {
			ignore = [],
			todo = false,
			fix = false,
		} = input
		this.ignore = Array.isArray(ignore) ? ignore : [String(ignore)]
		this.todo = Boolean(todo)
		this.fix = Boolean(fix)
	}
	/**
	 * @param {any} input
	 * @returns {StatusCommandOptions}
	 */
	static from(input) {
		if (input instanceof StatusCommandOptions) return input
		return new StatusCommandOptions(input)
	}
}

class StatusCommandMessage extends CommandMessage {
	/** @type {StatusCommandOptions} */
	opts
	constructor(input) {
		super(input)
		const { opts = {} } = input
		this.opts = StatusCommandOptions.from(opts)
	}
}

class StatusCommand extends Command {
	static Message = StatusCommandMessage
	constructor() {
		super({
			"name": "status",
			"help": "Packages status collector"
		})
		this.addOption("ignore", Array, [], "Ignored packages", "i")
		this.fs = new PackageStatusDB()
		this.packageDirs = new Set()
		this.longest = 0
	}
	findPackages(db, ignore = []) {
		this.longest = 0
		this.packageDirs = new Set()
		for (const [key] of db.meta) {
			const [name, dir, file] = key.split("/")
			if ("package.json" === dir && undefined === file && !ignore.includes(name)) {
				this.packageDirs.add(name)
				this.longest = Math.max(name.length, this.longest)
			}
		}
	}
	/**
	 * @param {StatusCommandMessage} msg
	 */
	async run(msg) {
		console.debug("Command message:")
		console.debug(JSON.stringify(msg))
		console.info("Reading packages ..")
		console.info("")
		const format = new Intl.NumberFormat("en-US").format
		const db = await this.fs.connect((entry, count, spentMs) => {
			console.cursorUp(1, true)
			console.info(`${format(count)} ${Number(spentMs / 1000).toFixed(1)}s ${entry.file.path}`)
		})

		this.findPackages(db, msg.opts.ignore)

		console.cursorUp(1, true)
		console.info([db.meta.size, "entries found in", this.packageDirs.size, "packages"].join(" "))

		let i = 0
		for (const pkgName of this.packageDirs) {
			await this.collectPackage(pkgName, db, ++i)
		}
		await this.fs.save()
		if (msg.opts.todo) {
			this.renderTodo()
		}
		if (msg.opts.fix) {
			let i = 0
			for (const { rrs, pkg } of this.fs.scores.values()) {
				try {
					await this.fixPackage(pkg, rrs, ++i)
				} catch (err) {
					console.error(`Cannot fix package packages/${pkg.name}: ${err.message}`)
					console.debug(err.stack)
				}
			}
		}
	}

	async collectPackage(pkgName, db, i) {
		const rrs = this.fs.getRSS(pkgName)
		const cache = this.fs.getCache(pkgName)

		const pkg = new TestPackage({
			cwd: db.absolute(pkgName),
			db: db.extract(pkgName),
			name: pkgName,
			baseURL: "https://github.com/nan0web/" + pkgName + "/",
		})

		const no = String(i).padStart(String(this.packageDirs.size).length, " ") + ". "

		const spaces = " ".repeat(this.longest - pkgName.length)
		let message = `@nan0web/${pkgName} ${spaces}`
		console.info(no + message)
		console.info("")
		console.info("")

		for await (const msg of pkg.run(rrs, cache)) {
			message += msg.value
			console.cursorUp(2, true)
			console.info(no + message)
			console.info(console.cut(msg.name))
			console.info("")
		}

		message += " = " + rrs.icon("") + "\n"
		console.cursorUp(2, true)
		if (message.endsWith(" 0.0%\n")) {
			console.error(no + message.trim())
		} else {
			console.info(no + message.trim())
		}

		await this.fs.setScore(pkgName, { rrs, pkg })
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
				console.warn(`${pkg.name} ${space}scripts.${key} = ${current}`)
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
				console.warn(`${pkg.name} incorrect devDependencies.${key} = ${current}`)
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
				console.cursorUp(1, true)
				const recent = rows.slice(-1)[0] ?? ""
				console.info(console.cut(recent))
			}
			console.info(`${pkg.name} / pnpm update\n`)
			const npmUpdate = await runSpawn("pnpm", ["update"], { cwd, onData })
			console.cursorUp(1, true)
			if (0 !== npmUpdate.code) {
				throw new Error("Cannot update node_modules\n" + content)
			}
		}

		const husky = pkg.db.loadDocument(".husky/pre-commit", "")
		if ("" === husky) {
			content = ""
			console.info(`${pkg.name} / pnpm prepare\n`)
			const huskyInstall = runSpawn("pnpm", ["prepare"], { cwd, onData })
			console.cursorUp(1, true)
			if (0 !== huskyInstall.code) {
				throw new Error("Cannot update node_modules\n" + content)
			}
		}

		const readmeTest = await pkg.db.loadDocument("src/README.md.js", "")
		if ("" === readmeTest) {
			const llmProvenDocs = await this.fs.loadDocument("llm/templates/provendocs.md")
			const content = llmProvenDocs.replaceAll("$pkgName", pkg.name)
			await this.fs.saveDocument(`llm/queue/${pkg.name}/README.md`, content)
		}

		const playground = await pkg.db.loadDocument("playground/main.js", "")
		if ("" === playground) {
			const llmPlayground = await this.fs.loadDocument("llm/templates/playground.md")
			const content = llmPlayground.replaceAll("$pkgName", pkg.name)
			await this.fs.saveDocument(`llm/queue/${pkg.name}/playground.md`, content)
		}

		const readmeMd = await pkg.db.loadDocument("README.md", "")
		const readmeUk = await pkg.db.loadDocument("docs/uk/README.md", "")
		if ("" === readmeUk && readmeMd) {
			const llmTranslate = await this.fs.loadDocument("llm/templates/translate-readme.md")
			const content = llmTranslate.replaceAll("$pkgName", pkg.name)
			await this.fs.saveDocument(`llm/queue/${pkg.name}/README.uk.md`, content)
		}

		const tsConfigTemplate = await this.fs.loadDocumentAs(".txt", "tsconfig.json")
		const tsConfig = await pkg.db.loadDocumentAs(".txt", "tsconfig.json")
		if (tsConfigTemplate !== tsConfig) {
			const template = await this.fs.loadDocument("tsconfig.json")
			await pkg.db.saveDocument("tsconfig.json", template)
			console.info(`${pkg.name} / tsconfig.json 💿\n`)
		}

		const systemMd = await pkg.db.loadDocument("system.md", "")
		if ("" === systemMd) {
			const llmSystem = await this.fs.loadDocument("llm/templates/system.md")
			const content = llmSystem.replaceAll("$pkgName", pkg.name)
			await this.fs.saveDocument(`llm/queue/${pkg.name}/system.md`, content)
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
		console.info(String(root))
	}

}

const command = new StatusCommand()
const msg = command.parse(process.argv.slice(2))
command.run(msg).then(() => {
	process.exit(0)
}).catch(err => {
	console.error(err.message)
	console.debug(err.stack)
	process.exit(1)
})
