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
import { checkAllDocs } from "../src/docs.js"

/* -------------------------------------------------------------------------- */
/* Run a command asynchronously, printing at most `maxLines` lines of output. */
/* -------------------------------------------------------------------------- */
const logger = new Logger(Logger.detectLevel(process.argv))
const format = new Intl.NumberFormat("en-US").format

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
 * Swallow errors to continue testing others.
 */
async function installDependencies(cwd, onChunk) {
	try {
		const res = await runCommandAsync('pnpm', ['install'], { cwd, onChunk })
		if (res.code !== 0) throw new Error(`pnpm install failed in ${cwd}`)
	} catch (e) {
		logger.warn(`Install failed for ${path.basename(cwd)}: ${e.message}`)
		throw e  // re-throw to be caught by caller
	}
}

/**
 * Run the package’s `test:all` script.
 * Swallow errors to continue testing others.
 */
async function runTests(cwd, onChunk) {
	try {
		const res = await runCommandAsync('pnpm', ['run', 'test:all'], { cwd, onChunk })
		if (res.code !== 0) throw new Error(`Tests failed in ${cwd}\n${res.output}`)
	} catch (e) {
		logger.warn(`Tests failed for ${path.basename(cwd)}: ${e.message}`)
		throw e  // re-throw to be caught by caller
	}
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
	logger.success(`Total vulnerabilities: ${result.length}`)

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

	await db.saveDocument(".cache/chunks.log", "")
	await db.saveDocument(".cache/error.log", "")

	// Log per-package errors to .cache/error.log without failing main()
	const logError = async (pkg, error) => {
		const errEntry = `[${new Date().toISOString()}] ${pkg}: ${error.message}\n`
		try {
			await db.writeDocument('.cache/error.log', errEntry)
		} catch (logErr) {
			logger.warn(`Failed to log error for ${pkg}: ${logErr.message}`)
		}
	}

	const isFix = argv.includes('--fix')
	const isDebug = argv.includes('--debug')

	let chunks = ["Loading monorepo..."]

	/** @type {import('../src/runCommandAsync.js').onChunkFn} */
	const onChunk = (data, error = false) => {
		const str = String(data)
		chunks.push(str)
		// keep a persistent record for debugging
		db.writeDocument(".cache/chunks.log", str)
	}

	const start = async (options = {}, fn) => {
		const opts = { ...options, logger, fps: 33 }
		const interval = createOutputProgress(opts)
		const result = await fn()
		/** @description pause is required to see the results due to the fps */
		await pause(33)
		clearInterval(interval)
		logger.cursorUp(opts.printed || 0, true)
		return result
	}

	/* ----------------------------- repo info ----------------------------- */
	let monorepoUrl = ''
	try {
		chunks = ["% git rev-parse --show-toplevel"]
		const rootRes = await start({ chunks }, async () => {
			return await runCommandAsync('git', ['rev-parse', '--show-toplevel'], { onChunk })
		})

		const repoRoot = rootRes.output.trim()
		chunks = [`% git -C ${repoRoot} config --get remote.origin.url`]
		const urlRes = await start({ chunks }, async () => {
			return await runCommandAsync('git', ['-C', repoRoot, 'config', '--get', 'remote.origin.url'], { onChunk })
		})
		monorepoUrl = urlRes.output.trim()
	} catch {
		/* ignore – will surface later if needed */
	}

	/* --------------------- load workspace & package list ----------------- */
	chunks = ["Loading pnpm-workspace.yaml"]
	let pkgs = []
	await start({ chunks }, async () => {
		const ws = await db.loadDocument('pnpm-workspace.yaml')
		pkgs = ws.packages
			.filter(p => p.startsWith('packages/'))
			.map(p => p.slice('packages/'.length))
		onChunk(format(JSON.stringify(ws).length) + " bytes loaded, " + pkgs.length + " packages\n")
	})

	chunks = ["Checking docs …"]
	let docs = { incorrect: [], deps: {} }
	await start({ chunks }, async () => {
		docs = await checkAllDocs({ db, pkgs, chunks, onChunk, logger })
	})
	const count = Object.keys(docs.deps).length
	logger.info(`Documentation loaded with ${docs.incorrect.length} fail packages and ${count} dependency trees`)
	if (docs.incorrect.length) {
		logger.info(`  ${Logger.YELLOW}Missing documentation in${Logger.RESET}`)
		docs.incorrect.forEach(i => logger.info(`  - ${Logger.YELLOW}${i}${Logger.RESET}`))
	}

	/* ------------------- isolation tests ------------------------------- */
	const isolation = []          // { native, passed }
	const tableRows = []         // markdown rows as they appear

	let idx = 0
	// @todo sort here by dependencies less first
	for (const name of pkgs) {
		logger.info(`${String(++idx).padStart(String(pkgs.length).length)}. ${name}`)
		let pkgPath = ""
		let passed = false
		const repoUrl = `git@github-nan0web:nan0web/${name}.git`
		try {
			chunks = [`Cloning ${name}…`]
			await start({ chunks }, async () => {
				pkgPath = await clonePackage(repoUrl, name, onChunk)
			})

			// ----------- install dependencies -----------
			chunks = [`Installing deps for ${name}…`]
			await start({ chunks }, async () => {
				await installDependencies(pkgPath, onChunk)
			})

			// ----------- run tests -----------
			chunks = [`Running tests for ${name}…`]
			await start({ chunks }, async () => {
				await runTests(pkgPath, onChunk)
			})

			passed = true
			if (isDebug) {
				logger.success(`✅ ${name} passed isolation tests`)
			}
			tableRows.push(`| ${name} | ✅ |`)
		} catch (e) {
			passed = false
			if (isDebug) {
				logger.error(`❌ ${name} isolation failed: ${e.message}`)
			}
			tableRows.push(`| ${name} | ❌ |`)
			await logError(name, e)
		} finally {
			if (pkgPath) {
				const tempRoot = path.dirname(path.dirname(pkgPath))
				// The cleanup itself may fail (EPERM etc.). We swallow the error
				// but record it for later troubleshooting.
				try {
					await fs.rm(tempRoot, { recursive: true, force: true })
				} catch (cleanErr) {
					logger.debug(`Cleanup failed for ${name}: ${cleanErr.message}`)
					await logError(name, { message: `Cleanup error: ${cleanErr.message}` })
				}
			}
			isolation.push({ name, passed })
		}
		if (passed) logger.success(`${String(idx).padStart(2)}. ✅ ${name}`)
		else logger.error(`${String(idx).padStart(2)}. ❌ ${name}`)
	}
	/* --------------------------- audit --------------------------------- */
	let audited
	if (isFix) {
		chunks = ["Auto-fixing vulnerabilities"]
		interval = createOutputProgress({ logger, chunks })
		await runCommandAsync('pnpm', ['audit', 'fix'], { chunks })
		clearInterval(interval)
	}
	chunks = ["Auditing vulnerabilities..."]
	audited = await runPnpmAudit({ chunks })
	if (audited.length && !isFix) {
		console.info('\n! To automatically fix issues provide --fix in a command line\n')
	}

	/* --------------------------- reporting ------------------------------- */
	const order = getBuildOrder(depMap)

	logger.info('--- Dependency Map ---')
	console.log(JSON.stringify(depMap, null, 2))

	logger.info('--- Recommended Release Order (most independent first) ---')
	order.forEach((p, i) => console.log(`${i + 1}. ${p}`))

	logger.info('--- Isolation Test Results ---')
	const ok = isolation.filter(r => r.passed).length
	logger.info(`${ok}/${pkgs.length} packages passed isolation tests`)

	logger.success('Audit completed. Check .cache/error.log for detailed errors.')
}

/* -------------------------------------------------------------------------- */
/* RUN                                                                        */
/* -------------------------------------------------------------------------- */
main()
	.then(() => process.exit(0))
	.catch(err => {
		const errLogger = new Logger(Logger.detectLevel(process.argv))
		errLogger.error('Audit failed')
		errLogger.error(err.message)
		if (err.stack) errLogger.debug(err.stack)
		process.exit(1)
	})
