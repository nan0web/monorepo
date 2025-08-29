#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { readdirSync } from 'node:fs'

const packages = readdirSync('./packages').filter(pkg =>
	readdirSync(`./packages/${pkg}`).includes('tsconfig.json')
)

packages.forEach(pkg => {
	try {
		execSync(`cd packages/${pkg} && tsc --noEmit`, { stdio: 'inherit' })
		console.log(`✅ ${pkg}: types OK`)
	} catch {
		console.error(`❌ ${pkg}: type check failed`)
		process.exit(1)
	}
})
