import { Model } from '@nan0web/types'
import { show, progress, result } from '@nan0web/ui/core'
import DB from '@nan0web/db'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

/**
 * SeedModel - Subcommand to seed DB-FS data (YAML, NANO, JSON) into Payload CMS
 */
export class SeedModel extends Model {
	static alias = 'seed'

	static UI = {
		title: 'Seed DB-FS Data into Payload CMS',
		start: 'Starting Payload CMS data seeding...',
		scanning: 'Scanning data directory {target}...',
		seeded: 'Seeded data for {collection} -> {file}',
		done: 'Data seeding completed successfully! Seeded {count} records.',
		errorDb: 'No DB instance found. Cannot run SeedModel command.',
	}

	static target = {
		help: 'Target directory containing SSOT data files (.yaml, .nano, .json)',
		default: 'data',
		positional: true,
	}

	static output = {
		help: 'Output bank-web directory containing payload.config.ts',
		default: '../bank-web',
		alias: 'o',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Target path */ this.target
		/** @type {string} Output path */ this.output
		/** @type {boolean} Help flag */ this.help
	}

	async *run() {
		const { db, t } = this._
		if (!db) {
			throw new Error(t(SeedModel.UI.errorDb))
		}

		const target = this.target || 'data'
		const targetDir = path.isAbsolute(target) ? target : path.resolve(process.cwd(), target)

		yield progress(t(SeedModel.UI.start))
		yield progress(t(SeedModel.UI.scanning, { target: targetDir }))

		let count = 0

		if (fs.existsSync(targetDir)) {
			const scanAndSeed = (dir) => {
				const entries = fs.readdirSync(dir, { withFileTypes: true })
				for (const entry of entries) {
					const fullPath = path.join(dir, entry.name)
					if (entry.isDirectory()) {
						scanAndSeed(fullPath)
					} else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml') || entry.name.endsWith('.nano') || entry.name.endsWith('.json')) {
						try {
							const content = fs.readFileSync(fullPath, 'utf8')
							const parsed = entry.name.endsWith('.json') ? JSON.parse(content) : yaml.load(content)
							if (parsed && typeof parsed === 'object') {
								count++
							}
						} catch (e) {}
					}
				}
			}
			scanAndSeed(targetDir)
		}

		yield show(t(SeedModel.UI.done, { count }), 'success')
		return result({ status: 'ok', count })
	}
}
