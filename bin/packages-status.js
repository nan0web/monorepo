import DB from '@nan0web/db-fs'
import { runSpawn } from "@nan0web/test"
import RRS from '../src/RRS.js'

const icon = (rrs) => {
	const totalRequired = Object.values(rrs.required).reduce((a, b) => a + b, 0)
	const totalOptional = Object.values(rrs.optional).reduce((a, b) => a + b, 0)
	const score = totalRequired + totalOptional

	let icon = "🔴"
	if (totalRequired >= 400) {
		icon = "🟢"
		if (totalOptional < 24) icon = "🟡"
	}

	return icon + " " + Number(100 * score / rrs.max).toFixed(1) + "%"
}

async function main(argv) {
	const fs = new DB()
	let pkg
	let task = ''
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}

	const stream = fs.findStream("packages/", {
		filter: (uri) => {
			return !uri.inIncludes("/node_modules/", "/.git/")
		}
	})
	let checkpoint = Date.now()
	let count = 0
	for await (const entry of stream) {
		++count
		if (Date.now() - checkpoint > 1_000) {
			checkpoint = Date.now()
			console.info(count + " files found ..")
		}
	}
	const db = fs.extract("packages/")

	/** @type {Map<string, { rrs: RRS, docs: string[], npm: string, score: number }>} */
	const scores = new Map()
	/** @type {Map<string, { rrs: RRS, docs: string[], npm: string, score: number }>} */
	const cached = new Map(await fs.loadDocument(".cache/packages-status.json", []))

	const packageDirs = new Set()
	for (const [key, value] of db.meta) {
		const [name, dir, file, ...deeper] = key.split("/")
		if ("package.json" === dir && undefined === file) {
			packageDirs.add(name)
		}
	}

	const write = process.stdout.write.bind(process.stdout)
	const longest = Array.from(packageDirs).reduce((acc, d) => Math.max(d.length, acc), 0)
	for (const pkgName of packageDirs) {
		const cache = cached.get(pkgName)
		const rrs = cache?.rrs ?? JSON.parse(JSON.stringify(RRS)) // Deep copy
		const docs = cache?.docs ?? []
		const npm = cache?.npm ?? ""
		const cwd = db.absolute(pkgName)

		const spaces = " ".repeat(longest - pkgName.length)
		write(`Checking @nan0web/${pkgName} ${spaces}`)

		if (!cache) {
			const buildResult = await runSpawn("pnpm", ["build"], { cwd })
			if (0 !== buildResult.code) {
				rrs.required.buildPass = 0
			}
		}
		write(rrs.required.buildPass ? " 🟢" : " 🔴")

		const packageDb = db.extract(pkgName)
		if (!cache) {
			const systemMd = await packageDb.loadDocument("system.md", "")
			if ("" === systemMd) {
				rrs.required.systemMd = 0
			}
		}
		write(rrs.required.systemMd ? " 🟢" : " 🔴")

		if (!cache) {
			const pnpmTest = await runSpawn("pnpm", ["test"], { cwd })
			if (0 !== pnpmTest.code) {
				rrs.required.testPass = 0
			}
		}
		write(rrs.required.testPass ? " 🟢" : " 🔴")

		if (!cache) {
			const tsconfig = await packageDb.loadDocument("tsconfig.json", "")
			if ("" === tsconfig) {
				rrs.required.tsconfig = 0
			}
		}
		write(rrs.required.tsconfig ? " 🟢" : " 🔴")

		if (!cache) {
			const contributeMd = await packageDb.loadDocument("CONTRIBUTING.md", "")
			const license = await packageDb.loadDocument("LICENSE", "")
			if ("" === license || contributeMd === "") {
				rrs.optional.contributingAndLicense = 0
			}
		}
		write(rrs.optional.contributingAndLicense ? " 🟢" : " 🟡")

		if (!cache) {
			const npmInfo = await runSpawn("npm", ["info", "@nan0web/" + pkgName], { cwd })
			if (0 !== npmInfo.code) {
				rrs.optional.npmPublished = 0
			} else {
				npm = npmInfo.text
			}
		}
		write(rrs.optional.npmPublished ? " 🟢" : " 🟡")

		if (!cache) {
			if (!packageDb.meta.has("playground/main.js")) {
				rrs.optional.playground = 0
			}
		}
		write(rrs.optional.playground ? " 🟢" : " 🟡")

		const absGit = `https://github.com/nan0web/${pkgName}/blob/main/`
		if (!cache) {
			const readmeMd = await packageDb.loadDocument("README.md", "")
			if ("" === readmeMd) {
				rrs.optional.readmeMd = 0
			} else {
				docs.push(`[English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](${absGit}README.md)`)
			}
		}
		write(rrs.optional.readmeMd ? " 🟢" : " 🟡")

		if (!cache) {
			const docsMd = await packageDb.loadDocument("docs/uk/README.md", "")
			if ("" !== docsMd) {
				docs.push(`[Українською 🇺🇦](${absGit}docs/uk/README.md)`)
			}

			const readmeTest = await packageDb.loadDocument("src/README.md.test.js", "")
			if ("" === readmeTest) {
				rrs.optional.readmeTest = 0
			}
		}
		write(rrs.optional.readmeTest ? " 🟢" : " 🟡")

		if (!cache) {
			const releases = Array.from(packageDb.meta.keys()).filter(k => k.endsWith("release.md") && k.startsWith("releases/"))
			if (1 !== releases.length) {
				rrs.optional.releaseMd = 0
			}
		}
		write(rrs.optional.releaseMd ? " 🟢" : " 🟡")

		const totalRequired = Object.values(rrs.required).reduce((a, b) => a + b, 0)
		const totalOptional = Object.values(rrs.optional).reduce((a, b) => a + b, 0)
		const score = totalRequired + totalOptional

		write(" = " + icon(rrs) + "\n")

		scores.set(pkgName, { rrs, docs, npm, score, totalOptional, totalRequired })
		await fs.saveDocument(".cache/packages-status.json", Array.from(scores.entries()))
	}
	// packagesTable = "| Package | Status |\n|---------|--------|\n"
	// packagesTable += `| [\`${pkgName}\`](./packages/${pkgName}) | ${icon} ${score}/424 |\n`
	const packagesTable = [
		["", "Package", "Status", "Documentation", "Npm version", ""],
		["", "-------", "-------", "-------", "-------", "",],
		...Array.from(scores.entries()).map(([name, score]) => ([
			"", "@nan0web/" + name, icon(score.rrs), score.docs.join(", "), score.npm || "❌ none", ""
		]))
	].map(a => a.join("|")).join("\n")

	const md = await fs.loadDocumentAs(".txt", "README.md", "")
	await fs.saveDocument("README.md", md.replace("%PACKAGES%", packagesTable))
}

main(process.argv.slice(2)).then(() => {
	process.exit(0)
}).catch(err => {
	console.error(err)
	process.exit(1)
})
