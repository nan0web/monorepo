import { ModelAsApp, show, result, ask } from '@nan0web/ui'
import { select } from '@nan0web/ui-cli'
import Scanner from '../Release/Scanner.js'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * ViewCommand - ModelAsApp Subcommand to inspect and view release details across multimodal interfaces.
 */
export default class ViewCommand extends ModelAsApp {
	static alias = 'view'

	static UI = {
		title: 'view',
		help: 'View release summary and launch multimodal playgrounds (CLI, TUI, WEB, CHAT, VOICE)',
		noReleases: 'No releases found in current directory.',
		selectPrompt: 'Select release version to view:',
	}

	static version = {
		help: 'Target release version (e.g. v3.4.0). If omitted, latest version is used.',
		positional: true,
		type: 'string',
		default: '',
	}

	/**
	 * @param {Partial<ViewCommand>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */
		this.version = String(data.version || (options && 'version' in options ? /** @type {any} */ (options).version : ''))
	}

	async *run() {
		const targetDir = process.env.RELEASE_CWD || process.env.INIT_CWD || process.cwd()
		const scanner = new Scanner(targetDir)
		const statuses = scanner.status()

		if (!statuses.length) {
			yield show(ViewCommand.UI.noReleases, 'warn')
			return result({ success: false })
		}

		// Sort SemVer descending (newest first)
		const sorted = [...statuses].sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))

		let targetVer = this.version
		if (!targetVer) {
			// If not specified via CLI arguments, pick the newest
			targetVer = sorted[0].version
		}

		const current = sorted.find((s) => s.version === targetVer) || sorted[0]
		targetVer = current.version

		// Find release dir
		const allSpecs = scanner.findSpecs(targetVer)
		const allTests = scanner.findTests(targetVer)
		const entry = allSpecs[0] || allTests[0]
		const releaseDir = entry ? entry.dir : ''

		let progressStr = '100%'
		let taskCount = '8/8'

		if (releaseDir) {
			try {
				const taskRaw = await readFile(join(releaseDir, 'task.md'), 'utf8')
				const completed = (taskRaw.match(/- \[[xX]\]/g) || []).length
				const pending = (taskRaw.match(/- \[ \]/g) || []).length
				const total = completed + pending
				if (total > 0) {
					const pct = Math.round((completed / total) * 100)
					progressStr = `${pct}%`
					taskCount = `${completed}/${total}`
				}
			} catch {}
		}

		yield show(`Release ${targetVer}`)
		yield show(`Progress ${progressStr} (${taskCount})`)
		yield show('Playground available for CLI, TUI, WEB, CHAT, VOICE to see releases run:')
		yield show('  pnpm exec serve releases # WEB version (http://localhost:3131)')
		yield show('  pnpm exec release        # CLI version')
		yield show('  pnpm exec release --tui  # TUI version')
		yield show(`  pnpm exec release --chat "Show me a release where I have added ${targetVer} features" # CHAT version`)

		return result({
			version: targetVer,
			progress: progressStr,
			tasks: taskCount,
			dir: releaseDir,
		})
	}
}

export { ViewCommand }
