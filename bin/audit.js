#!/usr/bin/env node
import process from 'node:process'
import fs from 'node:fs/promises'
import path from 'node:path'
import FS from "@nan0web/db-fs"
import Logger from "@nan0web/log"

import { parseAuditResult } from '../src/audit.js'
import { runCommandAsync } from '../src/runCommandAsync.js'
import { clonePackage } from '../src/clonePackage.js'   // respects MOCK_CLONE (but we don’t force it)
import { createOutputProgress, pause } from '../src/cli.js'

/* -------------------------------------------------------------------------- */
/* Run a command asynchronously, printing at most `maxLines` lines of output. */
/* -------------------------------------------------------------------------- */
const logger = new Logger(Logger.detectLevel(process.argv))
const format = new Intl.NumberFormat("en-US").format

/**
 * Read package.json via a DB‑like instance and return all @nan0web/ deps.
 */
async function getDependencies(db) {
	try {
		const data = await db.loadDocument('package.json')
		const all = { ...data.dependencies, ...data.devDependencies, ...data.peerDependencies }
		return Object.keys(all).filter(d => d.startsWith('@nan0web/'))
	} catch (e) {
		logger.error(`Failed to read ${db.absolute('package.json')}: ${e.message}`)
		return []
	}
}

/**
 * Topological sort – returns a safe build order.
 * If a cycle is detected we fall back to the original insertion order.
 */
function getBuildOrder(map) {
	const order = []
	const indeg = new Map()
	const adj = new Map()

	for (const node in map) {
		indeg.set(node, 0)
		adj.set(node, [])
	}
	for (const [node, deps] of Object.entries(map)) {
		for (const dep of deps) {
			if (!adj.has(dep)) {
				adj.set(dep, [])
				indeg.set(dep, 0)
			}
			adj.get(dep).push(node)
			indeg.set(node, (indeg.get(node) ?? 0) + 1)
		}
	}
	const queue = []
	for (const [n, i] of indeg.entries()) if (i === 0) queue.push(n)

	while (queue.length) {
		const n = queue.shift()
		order.push(n)
		for (const m of adj.get(n) ?? []) {
			indeg.set(m, indeg.get(m) - 1)
			if (indeg.get(m) === 0) queue.push(m)
		}
	}
	if (order.length !== indeg.size) {
		logger.warn('Circular dependency detected – using insertion order')
		return Object.keys(map)
	}
	return order
}

/**
 * Run `pnpm install` inside a directory.
 */
async function installDependencies(cwd) {
	const res = await runCommandAsync('pnpm', ['install'], { cwd })
	if (res.code !== 0) throw new Error(`pnpm install failed in ${cwd}`)
}

/**
 * Run the package’s `test:all` script.
 */
async function runTests(cwd) {
	const res = await runCommandAsync('pnpm', ['run', 'test:all'], { cwd })
	if (res.code !== 0) throw new Error(`Tests failed in ${cwd}\n${res.output}`)
}

/**
 * Execute `pnpm audit`, parse & display a short summary.
 */
async function runPnpmAudit({ chunks = [], maxLines = 3 } = {}) {
	const onChunk = (chunk, error = false) => {
		const color = error ? Logger.RED : ''
		const text = color + chunk.toString() + Logger.RESET
		chunks.push(text)
	}
	const progressInterval = createOutputProgress({ logger, chunks, maxLines })

	const res = await runCommandAsync('pnpm', ['audit'], { onChunk })

	const result = parseAuditResult(res.output)
	const tally = { critical: [], high: [], moderate: [], low: [] }
	for (const i of result) tally[i.type].push(i.pkg)

	await pause(99)
	clearInterval(progressInterval)

	logger.success('pnpm audit completed')

	if (tally.critical.length) logger.error(`  ${Logger.RED}${tally.critical.length} critical:${Logger.RESET} ${tally.critical.join(', ')}`)
	if (tally.high.length) logger.error(`  ${Logger.RED}${tally.high.length} high:${Logger.RESET} ${tally.high.join(', ')}`)
	if (tally.moderate.length) logger.info(`  ${Logger.YELLOW}${tally.moderate.length} moderate:${Logger.RESET} ${tally.moderate.join(', ')}`)
	if (tally.low.length) logger.info(`  ${Logger.YELLOW}${tally.low.length} low: ${tally.low.join(', ')}`)

	return result
}

/* -------------------------------------------------------------------------- */
/* MAIN                                                                      */
/* -------------------------------------------------------------------------- */
async function main(argv = process.argv.slice(2)) {
	logger.info(Logger.style(Logger.LOGO, { color: Logger.MAGENTA }))
	const db = new FS()
	await db.connect()

	const isFix = argv.includes('--fix')

	let chunks = []
	await db.saveDocument(".cache/chunks.log", "")
	await db.saveDocument(".cache/error.log", "")

	const onChunk = (data, error = false) => {
		const str = String(data)
		chunks.push(str)
		// keep a persistent record for debugging
		db.writeDocument(".cache/chunks.log", str)
	}

	/* ----------------------------- repo info ----------------------------- */
	let monorepoUrl = ''
	try {
		chunks = ["% git rev-parse --show-toplevel"]
		let interval = createOutputProgress({ logger, chunks })
		const rootRes = await runCommandAsync('git', ['rev-parse', '--show-toplevel'], { onChunk })
		clearInterval(interval)

		const repoRoot = rootRes.output.trim()
		chunks = [`% git -C ${repoRoot} config --get remote.origin.url`]
		interval = createOutputProgress({ logger, chunks })
		const urlRes = await runCommandAsync('git', ['-C', repoRoot, 'config', '--get', 'remote.origin.url'], { onChunk })
		clearInterval(interval)
		monorepoUrl = urlRes.output.trim()
	} catch { /* ignore – will surface later if needed */ }

	/* --------------------- load workspace & package list ----------------- */
	chunks = ["Loading pnpm-workspace.yaml"]
	let interval = createOutputProgress({ logger, chunks })
	const ws = await db.loadDocument('pnpm-workspace.yaml')
	chunks.push(format(JSON.stringify(ws).length) + " bytes loaded ")
	const pkgs = ws.packages
		.filter(p => p.startsWith('packages/'))
		.map(p => p.slice('packages/'.length))

	clearInterval(interval)

	/* --------------------------- audit --------------------------------- */
	let audited
	if (isFix) {
		chunks = ["Fixing all packages"]
		interval = createOutputProgress({ logger, chunks })
		await runCommandAsync('pnpm', ['audit', 'fix'], { onChunk })
		clearInterval(interval)
	}
	chunks = ["Auditing all packages"]
	audited = await runPnpmAudit({ chunks: ['Running pnpm audit...'] })
	if (audited.length && !isFix) {
		console.info('\n! To automatically fix issues provide --fix in a command line\n')
	}

	/* ------------------- isolation tests ------------------------------- */
	const depMap = {}
	const isolation = []          // { name, passed }
	const tableRows = []         // markdown rows as they appear

	let idx = 0
	for (const name of pkgs) {
		logger.info(`${String(++idx).padStart(String(pkgs.length).length)}. ${name}`)

		const pkgDb = db.extract(`packages/${name}/`)
		const deps = await getDependencies(pkgDb)
		depMap[name] = deps.map(d => d.replace('@nan0web/', ''))

		let pkgPath = null
		try {
			// ----------- clone package -----------
			chunks = [`Cloning ${name}…`]
			const cloneInterval = createOutputProgress({ logger, chunks })
			const repoUrl = `git@github-nan0web:nan0web/${name}.git`
			pkgPath = await clonePackage(repoUrl, name, onChunk)
			clearInterval(cloneInterval)

			// ----------- install dependencies -----------
			chunks = [`Installing deps for ${name}…`]
			const installInterval = createOutputProgress({ logger, chunks })
			await installDependencies(pkgPath)
			clearInterval(installInterval)

			// ----------- run tests -----------
			chunks = [`Running tests for ${name}…`]
			const testInterval = createOutputProgress({ logger, chunks })
			await runTests(pkgPath)
			clearInterval(testInterval)

			isolation.push({ name, passed: true })
			logger.success(`✅ ${name} passed isolation tests`)
			tableRows.push(`| ${name} | ✅ |`)
		} catch (e) {
			isolation.push({ name, passed: false })
			logger.error(`❌ ${name} isolation failed: ${e.message}`)
			logger.debug(e.stack)
			tableRows.push(`| ${name} | ❌ |`)

			// persist per‑package error details
			const errEntry = `[${new Date().toISOString()}] ${name}: ${e.message}\n`
			try {
				await db.writeDocument('.cache/error.log', errEntry)
			} catch (logErr) {
				// If even logging fails we do not want to abort the whole run.
				logger.warn(`Failed to write error log for ${name}: ${logErr.message}`)
			}
		} finally {
			if (pkgPath) {
				const tempRoot = path.dirname(path.dirname(pkgPath))
				// The cleanup itself may fail (EPERM etc.). We swallow the error
				// but record it for later troubleshooting.
				try {
					await fs.rm(tempRoot, { recursive: true, force: true })
				} catch (cleanErr) {
					logger.warn(`Cleanup failed for ${name}: ${cleanErr.message}`)
					const errEntry = `[${new Date().toISOString()}] cleanup ${name}: ${cleanErr.message}\n`
					try {
						await db.writeDocument('.cache/error.log', errEntry)
					} catch { /* ignore secondary failures */ }
				}
			}
		}
	}

	/* --------------------------- reporting ------------------------------- */
	const order = getBuildOrder(depMap)

	// --- Dependency Map (json) ---
	logger.info('--- Dependency Map ---')
	console.log(JSON.stringify(depMap, null, 2))

	// --- Recommended Release Order ---
	logger.info('--- Recommended Release Order (most independent first) ---')
	order.forEach((p, i) => console.log(`${i + 1}. ${p}`))

	// --- Isolation Test Results (markdown) ---
	logger.info('--- Isolation Test Results (markdown) ---')
	const header = '| Package | Isolation |\n|---------|------------|'
	console.log(header)

	// sort rows by the recommended order
	const orderIdx = Object.fromEntries(order.map((n, i) => [n, i]))
	const sortedRows = tableRows
		.map(row => {
			const pkgName = row.split('|')[1].trim()
			return { pkgName, row }
		})
		.sort((a, b) => (orderIdx[a.pkgName] ?? Infinity) - (orderIdx[b.pkgName] ?? Infinity))
		.map(o => o.row)

	sortedRows.forEach(r => console.log(r))

	const ok = isolation.filter(r => r.passed).length
	logger.info(`${ok}/${pkgs.length} packages passed isolation tests`)

	logger.info('✅ Audit completed')
}

/* -------------------------------------------------------------------------- */
/* RUN                                                                        */
/* -------------------------------------------------------------------------- */
main()
	.then(() => process.exit(0))
	.catch(err => {
		const errLogger = new Logger(Logger.detectLevel(process.argv))
		errLogger.error('❌ Audit failed')
		errLogger.error(err.message)
		if (err.stack) errLogger.debug(err.stack)
		process.exit(1)
	})
