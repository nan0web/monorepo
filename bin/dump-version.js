#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const bump = process.argv[2] || 'patch'
const packages = readdirSync('./packages').filter(pkg =>
	readdirSync('./packages').includes(pkg)
)

packages.forEach(pkg => {
	const pkgPath = resolve('./packages', pkg, 'package.json')
	const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf8'))

	const [major, minor, patch] = pkgJson.version.split('.').map(Number)

	pkgJson.version = bump === 'major'
		? `${major + 1}.0.0`
		: bump === 'minor'
			? `${major}.${minor + 1}.0`
			: `${major}.${minor}.${patch + 1}`

	writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2))
	console.log(`📦 ${pkg}: ${pkgJson.version}`)
})
