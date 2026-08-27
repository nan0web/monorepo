import { ModelAsApp } from '@nan0web/ui-cli'
import { DriveIndexerService } from '../storage/DriveIndexerService.js'
import { DeduplicationEngine } from '../storage/DeduplicationEngine.js'

/**
 * DeduplicateCommand - Scans directory or indexed drive to detect and report duplicates.
 */
export class DeduplicateCommand extends ModelAsApp {
	static alias = 'drive:dedup'

	static UI = {
		title: 'Storage & Media File Deduplication',
	}

	static dir = {
		type: 'string',
		required: false,
		help: 'Directory to scan for duplicate files',
	}

	static driveId = {
		type: 'string',
		required: false,
		help: 'Indexed Drive ID to inspect for duplicates',
	}

	/**
	 * @param {object} [data]
	 * @param {object} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const targetDir = this.dir || '.'
		yield {
			type: 'progress',
			message: `Scanning files for duplicates in ${targetDir}...`,
		}

		const indexer = new DriveIndexerService({ db: this._?.db })
		const { files } = await indexer.indexDrive({
			driveId: this.driveId || 'temp_scan',
			name: 'Temporary Scan',
			mountPoint: targetDir,
		})

		const engine = new DeduplicationEngine()
		const duplicates = engine.findDuplicates(files)

		const wastedMb = Math.round(duplicates.reduce((acc, d) => acc + d.wastedBytes, 0) / (1024 * 1024))
		yield {
			type: 'log',
			level: 'info',
			message: `Found ${duplicates.length} duplicate groups. Total recoverable space: ~${wastedMb} MB.`,
		}

		return {
			type: 'result',
			data: {
				success: true,
				duplicateCount: duplicates.length,
				wastedBytes: wastedMb * 1024 * 1024,
				duplicates,
			},
		}
	}
}
