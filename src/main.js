import process from "node:process"
import path from "node:path"
import Logger from "@nan0web/log"
import FS from "@nan0web/db-fs"
import { runCommandAsync } from "./runCommandAsync.js"
import { getDependencies } from "./getDependencies.js"
import { getBuildOrder } from "./getBuildOrder.js"
import { clonePackage } from "./clonePackage.js"
import { installDependencies } from "./installDependencies.js"
import { runTests } from "./runTests.js"
import { runPnpmAudit } from "./runPnpmAudit.js"
import { autoFixAudit } from "./autoFixAudit.js"
import { cleanup } from "./cleanup.js"

/**
 * Core entry point – kept deliberately tiny for testability.
 *
 * @param {string[]} argv
 */
export async function main(argv = process.argv.slice(2)) {
	const logger = new Logger(Logger.detectLevel(process.argv))
	logger.info(Logger.style(Logger.LOGO, { color: Logger.MAGENTA }))

	const isFix = argv.includes("--fix")

	// repo info
	const rootRes = await runCommandAsync("git", ["rev-parse", "--show-toplevel"])
	const repoRoot = rootRes.output.trim()
	const urlRes = await runCommandAsync("git", ["-C", repoRoot, "config", "--get", "remote.origin.url"])
	const repoUrl = urlRes.output.trim()
	if (!repoUrl) throw new Error("Cannot obtain remote.origin.url")

	const db = new FS()
	await db.connect()
	const ws = await db.loadDocument("pnpm-workspace.yaml")
	const pkgs = ws.packages
		.filter(p => p.startsWith("packages/"))
		.map(p => p.slice("packages/".length))

	/* ── audit ── */
	const audited = await runPnpmAudit()
	if (audited.length && !isFix) {
		console.info("To automatically fix issues provide --fix in a command line")
	}
	if (isFix) {
		await autoFixAudit()
		await runPnpmAudit()
	}

	/* ── isolation tests ── */
	const depMap = {}
	const isolation = []
	let idx = 0
	for (const name of pkgs) {
		logger.info(`${String(++idx).padStart(String(pkgs.length).length)}. ${name}`)
		const pkgDb = db.extract(`packages/${name}/`)
		const deps = await getDependencies(pkgDb)
		depMap[name] = deps.map(d => d.replace("@nan0web/", ""))

		const pkgPath = await clonePackage(repoUrl, name)
		let passed = false
		try {
			await installDependencies(pkgPath)
			await runTests(pkgPath)
			passed = true
			logger.success(`✅ ${name} passed isolation tests`)
		} catch (e) {
			logger.error(`❌ ${name} isolation failed: ${e.message}`)
		} finally {
			const tempRoot = path.dirname(path.dirname(pkgPath))
			await cleanup(tempRoot)
			isolation.push({ name, passed })
		}
	}

	/* ── reporting ── */
	const order = getBuildOrder(depMap)

	logger.info("--- Dependency Map ---")
	console.log(JSON.stringify(depMap, null, 2))

	logger.info("--- Recommended Release Order (most independent first) ---")
	order.forEach((p, i) => console.log(`${i + 1}. ${p}`))

	logger.info("--- Isolation Test Results ---")
	const ok = isolation.filter(r => r.passed).length
	logger.info(`${ok}/${pkgs.length} packages passed isolation tests`)
	isolation.forEach(r => console.log(`${r.passed ? "✅" : "❌"} ${r.name}`))

	logger.info("✅ Audit completed")
}
