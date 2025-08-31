import process from "node:process"
import { StreamEntry } from '@nan0web/db'
import DB from '@nan0web/db-fs'
import Logger from '@nan0web/log'
import { TestPackage, RRS } from "@nan0web/test"
import { MDHeading1, MDHeading2, MDHeading3, MDHeading4 } from "@nan0web/markdown"

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

async function main(argv = []) {
	const fs = new PackageStatusDB()
	console.info("Reading packages ..")
	console.info("")
	const format = new Intl.NumberFormat("en-US").format
	const db = await fs.connect((entry, count, spentMs) => {
		console.cursorUp(1, true)
		console.info(`${format(count)} ${Number(spentMs / 1000).toFixed(1)}s ${entry.file.path}`)
	})

	const packageDirs = new Set()
	for (const [key] of db.meta) {
		const [name, dir, file] = key.split("/")
		if ("package.json" === dir && undefined === file) {
			packageDirs.add(name)
		}
	}

	console.cursorUp(1, true)
	console.info([db.meta.size, "entries found in", packageDirs.size, "packages"].join(" "))

	const uncached = Array.from(packageDirs).filter(a => argv.includes(a))
	if (uncached.length) {
		console.debug("Force checking package(s): " + uncached.join(", "))
		uncached.map(a => fs.scores.delete(a))
	}

	const longest = Array.from(packageDirs).reduce((acc, d) => Math.max(d.length, acc), 0)
	let i = 0
	for (const pkgName of packageDirs) {
		const rrs = fs.getRSS(pkgName)
		const cache = fs.getCache(pkgName)

		const pkg = new TestPackage({
			cwd: db.absolute(pkgName),
			db: db.extract(pkgName),
			name: pkgName,
			baseURL: "https://github.com/nan0web/" + pkgName + "/",
		})
		++i

		const no = String(i).padStart(String(packageDirs.size).length, " ") + ". "

		const spaces = " ".repeat(longest - pkgName.length)
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

		await fs.setScore(pkgName, { rrs, pkg })
	}
	await fs.save()
	if (argv.includes("--todo")) {
		const todo = Array.from(packageDirs).map(
			name => ({ name, ...fs.scores.get(name) })
		)
		todo.sort((a, b) => b.rrs.percentage - a.rrs.percentage)
		let i = 0
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

main(process.argv.slice(2)).then(() => {
	process.exit(0)
}).catch(err => {
	console.error(err)
	process.exit(1)
})
