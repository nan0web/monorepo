#!/usr/bin / env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readdir } from 'node:fs/promises'
import process from 'node:process'

import Logger from "@nan0web/log"
import FS from "@nan0web/db-fs"

const logger = new Logger(Logger.detectLevel(process.argv))
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PACKAGES_DIR = path.resolve(__dirname, '../packages')

const fs = new FS()

/**
 * Parses the dependencies from a package.json file.
 * @param {string} packageJsonPath - The path to the package.json file.
 * @returns {Promise<string[]>} - A promise that resolves to an array of dependency names.
 */
async function getDependencies(db, packageJsonPath) {
	try {
		const content = await fs.loadDocument(packageJsonPath)
		const packageJson = JSON.parse(content)
		const allDeps = {
			...packageJson.dependencies,
			...packageJson.devDependencies,
			...packageJson.peerDependencies
		}
		// Filter for internal packages (those starting with '@nan0web/')
		return Object.keys(allDeps).filter(dep => dep.startsWith('@nan0web/'))
	} catch (error) {
		logger.error(`Failed to read or parse ${packageJsonPath}: ${error.message}`)
		return []
	}
}

/**
 * Builds a dependency map for all packages in the workspace.
 * @returns {Promise<{ [packageName: string]: string[] }>}
 */
async function buildDependencyMap() {
	const dependencyMap = {}
	try {

		const packageDirs = await readdir(PACKAGES_DIR)
		for (const dir of packageDirs) {
			const packageJsonPath = path.join(PACKAGES_DIR, dir, 'package.json')
			const dependencies = await getDependencies(packageJsonPath)
			// Remove the '@nan0web/' prefix for cleaner mapping
			const cleanDeps = dependencies.map(dep => dep.replace('@nan0web/', ''))
			dependencyMap[dir] = cleanDeps
		}
	} catch (error) {
		logger.error(`Failed to read packages directory: ${error.message}`)
	}
	return dependencyMap
}

/**
 * Performs a topological sort on the dependency map to determine the build order.
 * @param {{ [packageName: string]: string[] }} dependencyMap
 * @returns {string[]}
 */
function getBuildOrder(dependencyMap) {
	const buildOrder = []
	const visited = new Set()
	const visiting = new Set()

	function visit(name) {
		if (visiting.has(name)) {
			throw new Error(`Circular dependency detected involving package: ${name}`)
		}
		if (visited.has(name)) {
			return
		}
		visiting.add(name)
		const deps = dependencyMap[name] || []
		for (const dep of deps) {
			visit(dep)
		}
		visiting.delete(name)
		visited.add(name)
		buildOrder.push(name)
	}

	for (const name in dependencyMap) {
		visit(name)
	}

	return buildOrder
}

async function main() {
	logger.info('Building dependency tree...')
	const dependencyMap = await buildDependencyMap()
	const buildOrder = getBuildOrder(dependencyMap)

	logger.info('\
--- Dependency Map ---')
	console.log(JSON.stringify(dependencyMap, null, 2))

	logger.info('\
--- Recommended Release Order (most independent first) ---')
	buildOrder.forEach((pkg, index) => {
		console.log(`${index + 1}. ${pkg}`)
	})

	logger.info('\
✅ Dependency tree analysis complete.')
}

main().catch(err => {
	logger.error(`❌ An error occurred: ${err.message}`)
	process.exit(1)
})
