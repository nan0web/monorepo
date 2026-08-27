import { ModelAsApp } from '@nan0web/ui-cli'
import { DriveIndexerService } from '../storage/DriveIndexerService.js'

/**
 * DriveIndexCommand - Indexes storage drive and saves metadata to offline catalog.
 */
export class DriveIndexCommand extends ModelAsApp {
	static alias = 'drive:index'

	static UI = {
		title: 'Storage Drive & Backup Offline Indexer',
	}

	static mountPoint = {
		type: 'string',
		required: true,
		help: 'Drive path or directory to index',
	}

	static name = {
		type: 'string',
		required: false,
		help: 'Custom label for the drive catalog',
	}

	static driveId = {
		type: 'string',
		required: false,
		help: 'Unique identifier for the drive (e.g. hdd_01)',
	}

	/**
	 * @param {object} [data]
	 * @param {object} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const mountPoint = this.mountPoint
		const driveId = this.driveId || `drive_${Date.now().toString(36)}`
		const name = this.name || driveId

		yield {
			type: 'progress',
			message: `Indexing drive "${name}" at ${mountPoint}...`,
		}

		const indexer = new DriveIndexerService({ db: this._?.db })
		const result = await indexer.indexDrive({ driveId, name, mountPoint })

		yield {
			type: 'log',
			level: 'success',
			message: `Indexed ${result.totalFiles} files (${Math.round(result.totalBytes / (1024 * 1024))} MB) for drive ${name}.`,
		}

		return {
			type: 'result',
			data: {
				success: true,
				drive: result.drive,
				totalFiles: result.totalFiles,
				totalBytes: result.totalBytes,
			},
		}
	}
}
