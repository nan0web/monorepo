import { ModelAsApp } from '@nan0web/ui-cli'
import { show, result } from '@nan0web/ui'

/**
 * ListDirTool — ModelAsApp for listing files and directories.
 *
 * Traverses directories recursively up to the specified depth.
 * Returns { entries } where each entry has { name, path, isDir, isFile }.
 *
 * @example
 * const tool = new ListDirTool({ path: 'src', depth: 2 }, { db })
 * yield* tool.run()
 */
export class ListDirTool extends ModelAsApp {
	static alias = 'list_dir'
	static UI = { title: 'List Directory', icon: '📂' }

	static path = {
		help: 'Directory path to list',
		positional: true,
		default: '.',
	}
	static depth = {
		help: 'Maximum traversal depth',
		type: 'number',
		default: undefined,
	}

	/**
	 * @param {Record<string, any>} [data={}]
	 * @param {Record<string, any>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Directory path */ this.path
		/** @type {number | undefined} Depth limit */ this.depth
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const db = this._.db
		if (!db) {
			yield show('No database configured')
			return result({ error: true, entries: [] })
		}

		const rootPath = this.path || '.'
		const maxDepth = this.depth ?? Infinity
		const entries = []

		/**
		 * @param {string} currentPath
		 * @param {number} currentDepth
		 */
		const traverse = async (currentPath, currentDepth) => {
			if (currentDepth > maxDepth) return

			let list
			try {
				list = await db.listDir(currentPath)
			} catch {
				list = []
			}

			for (const item of list) {
				const isDir = !!(item.isDirectory || item.stat?.isDirectory)
				entries.push({
					name: item.name,
					path: item.path,
					isDir,
					isFile: !isDir,
				})

				if (isDir && currentDepth < maxDepth) {
					await traverse(item.path, currentDepth + 1)
				}
			}
		}

		await traverse(rootPath, 1)

		// Print summary to user
		const summary = entries
			.map(e => ` ${e.isDir ? '📁' : '📄'} ${e.path}`)
			.join('\n')

		yield show(`Contents of ${rootPath}:\n${summary || ' (empty)'}`)

		return result({ path: rootPath, entries })
	}
}
