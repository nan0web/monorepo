import { Model } from '../Models.js'

/**
 * DriveModel - Represents physical or virtual storage drive (online or offline catalog).
 */
export class DriveModel extends Model {
	static id = {
		help: 'Unique identifier of the drive (UUID or slug)',
		default: undefined,
	}

	static name = {
		help: 'Human-readable drive label (e.g., HDD_Archive_2026)',
		default: undefined,
	}

	static mountPoint = {
		help: 'Mount path or volume root',
		default: undefined,
	}

	static totalSpace = {
		help: 'Total capacity in bytes',
		default: 0,
	}

	static freeSpace = {
		help: 'Free remaining space in bytes',
		default: 0,
	}

	static status = {
		help: 'Drive status: connected, disconnected, or indexing',
		default: 'disconnected',
	}

	static lastIndexedAt = {
		help: 'ISO Timestamp of the last index snapshot',
		default: undefined,
	}

	/**
	 * @param {Partial<DriveModel>} [data]
	 * @param {object} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this.id = data.id ?? DriveModel.id.default
		this.name = data.name ?? DriveModel.name.default
		this.mountPoint = data.mountPoint ?? DriveModel.mountPoint.default
		this.totalSpace = Number(data.totalSpace ?? DriveModel.totalSpace.default)
		this.freeSpace = Number(data.freeSpace ?? DriveModel.freeSpace.default)
		this.status = data.status ?? DriveModel.status.default
		this.lastIndexedAt = data.lastIndexedAt ?? (data.lastIndexedAt ? new Date(data.lastIndexedAt).toISOString() : new Date().toISOString())
	}
}

/**
 * FileEntryModel - Single indexed file record in the offline drive catalog.
 */
export class FileEntryModel extends Model {
	static driveId = {
		help: 'ID of the parent drive',
		default: undefined,
	}

	static relativePath = {
		help: 'Path relative to drive mount root',
		default: undefined,
	}

	static size = {
		help: 'File size in bytes',
		default: 0,
	}

	static hash = {
		help: 'File content hash (e.g. sha256 or quick hash)',
		default: undefined,
	}

	static mtime = {
		help: 'Last modified ISO timestamp',
		default: undefined,
	}

	/**
	 * @param {Partial<FileEntryModel>} [data]
	 * @param {object} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this.driveId = data.driveId ?? FileEntryModel.driveId.default
		this.relativePath = data.relativePath ?? FileEntryModel.relativePath.default
		this.size = Number(data.size ?? FileEntryModel.size.default)
		this.hash = data.hash ?? FileEntryModel.hash.default
		this.mtime = data.mtime ?? (data.mtime ? new Date(data.mtime).toISOString() : new Date().toISOString())
	}
}
