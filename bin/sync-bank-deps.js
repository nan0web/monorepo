#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const root = path.resolve(__dirname, '..')
const bankAppsDir = path.join(root, 'apps/@/industrialbank')

if (!fs.existsSync(bankAppsDir)) {
	console.error(`Directory ${bankAppsDir} not found`)
	process.exit(1)
}

const apps = fs.readdirSync(bankAppsDir).filter((f) => {
	// Exclude bin directory explicitly
	return (
		fs.statSync(path.join(bankAppsDir, f)).isDirectory() && !['bin', 'node_modules'].includes(f)
	)
})

const versionCache = new Map()

const getLatestVersion = (pkgName) => {
	if (versionCache.has(pkgName)) return versionCache.get(pkgName)
	try {
		console.log(`Fetching latest version for ${pkgName}...`)
		const ver = execSync(`npm view ${pkgName} version`, { encoding: 'utf8' }).trim()
		versionCache.set(pkgName, ver)
		return ver
	} catch (e) {
		console.warn(`Failed to fetch version for ${pkgName}: ${e.message.split('\n')[0]}`)
		return null
	}
}

apps.forEach((app) => {
	const pkgPath = path.join(bankAppsDir, app, 'package.json')
	if (!fs.existsSync(pkgPath)) return

	console.log(`Processing ${app}...`)
	let pkg
	try {
		pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
	} catch (e) {
		console.error(`Failed to parse ${pkgPath}`)
		return
	}

	let changed = false

	const updateDeps = (deps) => {
		if (!deps) return
		Object.keys(deps).forEach((dep) => {
			if (dep.startsWith('@nan0web/') || dep.startsWith('@industrialbank/')) {
				const current = deps[dep]
				// Skip if it's already a file: dependency (sometimes used for local dev)
				if (current.startsWith('file:')) return

				const latest = getLatestVersion(dep)

				if (latest) {
					const newVer = `^${latest}`
					if (current !== newVer) {
						console.log(`  [${app}] Updating ${dep}: ${current} -> ${newVer}`)
						deps[dep] = newVer
						changed = true
					}
				}
			}
		})
	}

	updateDeps(pkg.dependencies)
	updateDeps(pkg.devDependencies)

	if (changed) {
		fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n')
		console.log(`  Saved ${pkgPath}`)
	}
})
