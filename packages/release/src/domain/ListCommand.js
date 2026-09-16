import { ModelAsApp, show, result } from '@nan0web/ui'
import Scanner from '../Release/Scanner.js'

/**
 * ListCommand - ModelAsApp Subcommand to list all available releases in chronological order.
 */
export default class ListCommand extends ModelAsApp {
	static alias = 'list'

	static UI = {
		title: 'list',
		help: 'List all available release versions',
		noReleases: 'No releases found.',
	}

	/**
	 * @param {Partial<ListCommand>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const targetDir = process.env.RELEASE_CWD || process.env.INIT_CWD || process.cwd()
		const scanner = new Scanner(targetDir)
		const statuses = scanner.status()

		if (!statuses.length) {
			yield show(ListCommand.UI.noReleases, 'warn')
			return result({ versions: [] })
		}

		// Sort SemVer descending (newest first)
		const sorted = [...statuses].sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))

		for (const item of sorted) {
			yield show(item.version)
		}

		return result({ versions: sorted.map((s) => s.version) })
	}
}

export { ListCommand }
