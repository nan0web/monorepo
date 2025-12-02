#!/usr/bin/env node
import FS from "@nan0web/db-fs"
import Logger from "@nan0web/log"

import { getProvenDocs, getTranslateDocs } from './llm/templates/index.js'

/**
 * Read package.json via a DB‑like instance and return all @nan0web/ deps.
 * @param {FS} db
 */
export async function getDependencies(db) {
	const data = await db.loadDocument('package.json')
	const all = { ...data.dependencies, ...data.devDependencies, ...data.peerDependencies }
	return Object.keys(all).filter(d => d.startsWith('@nan0web/'))
}

/**
 * @typedef {Object} checkDocsOptions
 * @property {FS} db
 * @property {FS} pkgDb
 * @property {string} name
 * @property {string} stepsMd
 * @property {import('../src/runCommandAsync.js').onChunkFn} onChunk
 */

/**
 * @param {checkDocsOptions} param0
 */
export async function checkDocs({ db, pkgDb, name, stepsMd, onChunk = () => { } }) {
	/** @type {(str: string) => string} */
	const transform = str => str.replaceAll("$pkgDir", name)
	const src = await pkgDb.loadDocument("src/README.md.js")
	if (!src) {
		const path = `chat/steps/${name}/provendocs.md`
		onChunk(`No README.md.js => ${db.absolute(path)}\n`, true)
		await db.saveDocument(path, transform(getProvenDocs()))
		await db.writeDocument(stepsMd, "provendocs.md\n")
	}
	const md = await pkgDb.loadDocument("README.md")
	if (!md || !src) {
		const pkg = await pkgDb.loadDocument("package.json")
		if (!pkg) {
			onChunk(`No package.json\n`)
			throw new Error(`Missing package.json in ${name}`)
		}
		if (!pkg.scripts?.['test:docs']) {
			pkg.scripts['test:docs'] = "node --test --test-timeout=3333 src/README.md.js"
			onChunk(`No test:docs in package.json => ${pkg.scripts['test:docs']}\n`, true)
		}
		if (!pkg.scripts?.['test:status']) {
			pkg.scripts['test:status'] = "nan0test status --hide-name"
			onChunk(`No test:status in package.json => ${pkg.scripts['test:status']}\n`, true)
		}
		onChunk(`No README.md => % npm run test:docs\n`, true)
		await db.writeDocument(stepsMd, "% npm run test:docs\n")
		await db.writeDocument(stepsMd, "% npm run test:status\n")
	}
	const uk = await pkgDb.loadDocument("docs/uk/README.md")
	if (!uk) {
		const path = `chat/steps/${name}/translatedocs.md`
		onChunk(`No docs/uk/README.md => ${db.absolute(path)}\n`, true)
		await db.saveDocument(path, transform(getTranslateDocs()))
		await db.writeDocument(stepsMd, "translatedocs.md\n")
	}
}

/**
 * @typedef {Object} checkAllDocsOptions
 * @property {FS} db
 * @property {string[]} pkgs
 * @property {Logger} logger
 * @property {string[]} chunks[]
 * @property {import('./runCommandAsync.js').onChunkFn} onChunk
 */

/**
 * @param {checkAllDocsOptions} param0
 * @returns {Promise<{ incorrect: string[], deps: Record<string, string[] >}>}
 */
export async function checkAllDocs({ db, pkgs, logger, chunks, onChunk }) {
	/** @type {Record<string, string[]>} */
	const depMap = {}
	let idx = 0
	const incorrect = []
	for (const name of pkgs) {
		chunks = [`${String(++idx).padStart(String(pkgs.length).length)}. ${name}`]

		const pkgDb = db.extract(`packages/${name}/`)
		try {
			const deps = await getDependencies(pkgDb)
			depMap[name] = deps.map(d => d.replace('@nan0web/', ''))
		} catch (/** @type {any} */ err) {
			onChunk(`Failed to read ${pkgDb.absolute('package.json')}: ${err.stack ?? err.message}`, true)
		}

		/**
		 * LLiMo steps to fix the package.
		 * Reset steps.
		 */
		const stepsMd = `chat/steps/${name}.md`
		await db.saveDocument(stepsMd, "")
		await checkDocs({ db, pkgDb, name, stepsMd, onChunk })

		const steps = await db.loadDocument(stepsMd)
		if (steps) {
			incorrect.push(stepsMd)
		} else {
			await db.dropDocument(stepsMd)
		}
	}
	return { incorrect, deps: depMap }
}

