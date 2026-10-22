import { ModelAsApp, show, result } from '@nan0web/ui'
import Scanner from '../Release/Scanner.js'
import { ReleaseConfig } from './config/ReleaseConfig.js'

/**
 * ListCommand - ModelAsApp Subcommand to list all available releases in chronological order.
 */
export default class ListCommand extends ModelAsApp {
	static alias = 'list'

	static releasesDir = {
		help: 'Directory containing releases (overrides config)',
		type: 'string',
		default: '',
	}

	static UI = {
		title: 'PM-as-Code Releases List',
		help: 'List all available release versions in structured format',
		noReleases: 'No releases found under {$path}.',
		discoveredReleases: '\n📦 Discovered {$count} release(s) in {$path}/:\n',
		tableHeader: '  {$col1} | {$col2} | {$col3} | {$col4}',
		tableDivider: '  ------------+------------+--------------+----------------',
		tableRow: '  {$col1} | {$col2} | {$col3} | {$col4}',
		stateClosed: '🟢 Closed',
		stateWip: '🟡 WIP',
		statePlanning: '⚪ Planning',
	}

	/**
	 * @param {Partial<ListCommand>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.releasesDir
	}

	async *run() {
		const rawT = this._.t
		const t = (template, params = {}) => {
			let str = (rawT ? rawT(template, params) : template) || template || ''
			if (params && typeof params === 'object') {
				for (const [k, v] of Object.entries(params)) {
					str = str.replaceAll(`{$${k}}`, String(v)).replaceAll(`{${k}}`, String(v))
				}
			}
			return str
		}
		const db = this._.db
		const targetDir = process.env.RELEASE_CWD || process.env.INIT_CWD || process.cwd()

		let config = null
		if (db) {
			config = await ReleaseConfig.load(db, targetDir)
		}
		const effectiveReleasesDir = this.releasesDir || config?.releasesDir || 'releases'

		const scanner = new Scanner(targetDir)
		const statuses = scanner.status(effectiveReleasesDir)

		if (!statuses.length) {
			yield show(t(ListCommand.UI.noReleases, { path: `${effectiveReleasesDir}/` }), 'warn')
			return result({ versions: [], statuses: [] })
		}

		// Sort SemVer descending (newest first)
		const sorted = [...statuses].sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))

		const pad = (str, len) => String(str).padEnd(len, ' ')
		yield show(t(ListCommand.UI.discoveredReleases, { count: sorted.length, path: effectiveReleasesDir }), 'info')
		yield show(
			t(ListCommand.UI.tableHeader, {
				col1: pad('Version', 12),
				col2: pad('State', 10),
				col3: pad('Specs (WIP)', 12),
				col4: pad('Tests (Closed)', 14),
			})
		)
		yield show(t(ListCommand.UI.tableDivider))

		for (const item of sorted) {
			const badge =
				item.state === 'closed'
					? t(ListCommand.UI.stateClosed)
					: item.state === 'wip'
						? t(ListCommand.UI.stateWip)
						: t(ListCommand.UI.statePlanning)
			yield show(
				t(ListCommand.UI.tableRow, {
					col1: pad(item.version, 12),
					col2: pad(badge, 10),
					col3: pad(String(item.specs.length), 12),
					col4: pad(String(item.tests.length), 14),
				})
			)
		}
		yield show('')

		return result({ versions: sorted.map((s) => s.version), statuses: sorted })
	}
}

export { ListCommand }
