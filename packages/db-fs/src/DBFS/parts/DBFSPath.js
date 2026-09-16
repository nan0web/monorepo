import fs from 'node:fs'
import path from 'node:path'
import DBFSBase from './DBFSBase.js'

/**
 * Path and volume resolution layer for filesystem database.
 * Handles physical path detection, location, relative, realpath and volume scanning.
 *
 * @class
 * @extends {DBFSBase}
 */
export default class DBFSPath extends DBFSBase {
	/**
	 * Returns location for the provided uris.
	 * @param  {...any} args
	 * @returns {string} Absolute location on the drive.
	 */
	location(...args) {
		const uri = this.resolveAlias(args[0])
		const isWindows = this.FS.sep === '\\'

		const isPhysical = (p) => {
			if (typeof p !== 'string') return false
			if (isWindows && p.includes(':')) return true
			if (p.startsWith('/')) {
				const resolvedCwd = this.cwd ? this.FS.resolve(this.cwd) : ''
				if (resolvedCwd && p.startsWith(resolvedCwd)) return true

				// Check if the path or any existing ancestor exists on disk.
				// This correctly detects absolute paths whose subdirectories may not yet exist (e.g. /tmp/... or /var/folders/...).
				let cur = p
				while (cur && cur !== '/') {
					try {
						if (fs.statSync(cur)) return true
					} catch (e) {}
					cur = path.dirname(cur)
				}
			}
			return false
		}

		if (isPhysical(uri)) {
			return uri
		}

		let rel =
			uri !== args[0] && uri.startsWith('..') ? uri : this.resolveSync(uri, ...args.slice(1))

		const parts = [this.cwd, this.root, rel].map((p, i) => {
			if (typeof p !== 'string') return p
			// If it starts with / but is not a real host root boundary, and it is NOT the cwd segment,
			// make it relative to allow FS.resolve to join it with preceding segments.
			if (i > 0 && p.startsWith('/') && !isPhysical(p)) {
				return p.slice(1)
			}
			return p
		})

		return this.FS.resolve(...parts)
	}

	/**
	 * Computes absolute URI for the path segments.
	 * @param {...string} args - Path segments
	 * @returns {string} Absolute URI
	 */
	absolute(...args) {
		return this.location(...args)
	}

	/**
	 * Computes relative URI for the given path.
	 * @param {string} from - Base path
	 * @param {string} [to=from] - Target path (defaults to this.root)
	 * @returns {string} Relative URI
	 */
	relative(from, to) {
		const absFrom =
			from.startsWith('/') || (this.FS.sep === '\\' && from.includes(':'))
				? from
				: this.FS.resolve(this.root, from)

		if (to === undefined) {
			return this.FS.relative(this.root, absFrom)
		}

		const absTo =
			to.startsWith('/') || (this.FS.sep === '\\' && to.includes(':'))
				? to
				: this.FS.resolve(this.root, to)

		return this.FS.relative(absTo, absFrom)
	}

	/**
	 * Resolves the actual underlying URI for a path.
	 * Resolves firmlinks and symlinks back to a relative DB URI.
	 * @param {string} uri The URI to resolve
	 * @returns {string} The resolved real URI
	 */
	realpath(uri) {
		const absPath = this.location(uri)
		try {
			const real = fs.realpathSync(absPath)
			const rel = this.FS.relative(this.root, real)
			return rel.startsWith('..') ? this.normalize(uri) : this.normalize(rel)
		} catch (err) {
			return this.normalize(uri)
		}
	}

	/**
	 * Returns available system volumes/disks as URIs.
	 * Handles macOS (/Volumes), Windows (wmic), and Linux (/mnt, /media).
	 * @returns {Promise<string[]>} Array of volume URIs
	 */
	async getVolumes() {
		const volumes = []
		try {
			if (process.platform === 'win32') {
				const { execSync } = await import('node:child_process')
				const stdout = execSync('wmic logicaldisk get name', { encoding: 'utf8' })
				for (const line of stdout.split('\n')) {
					const trimmed = line.trim()
					if (trimmed && trimmed.endsWith(':')) {
						volumes.push(trimmed + '/')
					}
				}
			} else {
				volumes.push('/') // Root is always a volume
				const mountDirs = process.platform === 'darwin' ? ['/Volumes'] : ['/mnt', '/media']
				for (const mnt of mountDirs) {
					try {
						const entries = await fs.promises.readdir(mnt, { withFileTypes: true })
						for (const entry of entries) {
							if (entry.isDirectory() || entry.isSymbolicLink()) {
								// Keep it absolute for easy mounting
								volumes.push(this.FS.resolve(mnt, entry.name))
							}
						}
					} catch (err) {
						// Ignore if /mnt or /Volumes doesn't exist or permission denied
					}
				}
			}
		} catch (err) {
			this.console.warn('Failed to detect volumes', err)
		}
		return volumes.length > 0 ? volumes : ['/']
	}
}
