import { DBwithFSDriver } from '@nan0web/db-fs'
import { Blueprint } from './domain/Blueprint.js'

/**
 * Universal Agent Engine.
 * Combines structured data (YAML) and unstructured content (Markdown).
 */
export class Engine {
	constructor(cwd = process.cwd()) {
		this.cwd = cwd

		// 1. Content Database: Root directory for Markdown (.md), images (.png), etc.
		// Used for reading System.md, README.md, RULES.md, etc.
		this.contentDb = new DBwithFSDriver({ cwd })

		// 2. Data Database: 'data/' directory for strictly YAML structured data
		this.dataDb = new DBwithFSDriver({ cwd: `${cwd}/data` })
	}

	async boot() {
		// Initialize the content database (root)
		await this.contentDb.connect()

		// Try to initialize the data database if present
		try {
			await this.dataDb.connect()
		} catch (error) {
			// Expected if data directory doesn't exist yet
		}

		// Look for a config file (YAML, JSON, or JS)
		const formats = ['yaml', 'json', 'js', 'nan0']
		let loadedConfig = {}
		let foundConfig = false

		for (const format of formats) {
			try {
				if (format === 'js') {
					const mod = await import(`${this.cwd}/nan0web.config.js`)
					loadedConfig = mod.default || mod
				} else {
					loadedConfig = await this.contentDb.loadDocument(`nan0web.config.${format}`, {})
				}
				foundConfig = true
				break // Stop on first successful config load
			} catch (e) {
				// Continue to next format
			}
		}

		// Initialize the Blueprint (configuration/persona)
		this.config = new Blueprint(foundConfig ? loadedConfig : {})

		return this
	}

	async getDocumentation() {
		// Read specific core files using fs since db-fs handles structured data.
		const possibleFiles = ['README', 'project', 'system', 'next', 'me', 'index', 'guide', 'setup']
		const docs = {}

		const fs = await import('node:fs')

		for (const name of possibleFiles) {
			try {
				const filePath = `${this.cwd}/${name}.md`
				if (fs.existsSync(filePath)) {
					docs[name] = fs.readFileSync(filePath, 'utf-8')
				}
			} catch (e) {
				// Ignore missing files
			}
		}

		return docs
	}
}
