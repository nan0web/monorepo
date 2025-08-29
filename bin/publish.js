#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const packages = readdirSync('./packages')
const errors = []

packages.forEach(pkg => {
	try {
		const pkgJson = JSON.parse(
			readFileSync(resolve('./packages', pkg, 'package.json'), 'utf8')
		)

		if (!pkgJson.private) {
			console.log(`🚢 Publishing ${pkg}@${pkgJson.version}`)
			execSync(`cd packages/${pkg} && npm publish --access public`, {
				stdio: 'inherit'
			})
		}
	} catch (err) {
		errors.push(`${pkg}: ${err.message}`)
	}
})

if (errors.length) {
	console.error('❌ Publish errors:', errors)
	process.exit(1)
}
