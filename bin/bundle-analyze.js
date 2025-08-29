#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const packages = readdirSync('./packages')
const sizes = []

packages.forEach(pkg => {
	try {
		const distPath = resolve('./packages', pkg, 'dist')
		if (readdirSync(distPath)) {
			const totalSize = readdirSync(distPath)
				.map(file => statSync(resolve(distPath, file)).size)
				.reduce((acc, size) => acc + size, 0)

			sizes.push([pkg, `${(totalSize / 1024).toFixed(2)}KB`])
		}
	} catch {
		// No dist folder
	}
})

console.table(sizes)
