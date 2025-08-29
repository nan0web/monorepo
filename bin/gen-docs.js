#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'

const packages = readdirSync('./packages').filter(pkg =>
	existsSync(`./packages/${pkg}/README.md`)
)

packages.forEach(pkg => {
	const docsDir = `./docs/${pkg}`
	mkdirSync(docsDir, { recursive: true })

	// Copy English README
	const readme = readFileSync(`./packages/${pkg}/README.md`, 'utf8')
	writeFileSync(`${docsDir}/README.md`, readme)

	// Generate Ukrainian translation (stub - implement LLM call)
	try {
		execSync(`echo "${readme}" | some-llm-translate --to uk > ${docsDir}/README.uk.md`)
	} catch {
		writeFileSync(`${docsDir}/README.uk.md`, `# ${pkg}\n\n<!-- @todo Ukrainian translation -->`)
	}
})
