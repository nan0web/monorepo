import { ModelAsApp, result, show, render } from '@nan0web/ui'
import { ArchitectureAuditor } from './ArchitectureAuditor.js'

/**
 * ListAuditorsApp — Lists registered auditors and their descriptions/scopes.
 */
export class ListAuditorsApp extends ModelAsApp {
	static alias = 'list'

	static UI = {
		title: '📋 Registered Architecture Auditors',
		description: 'Catalog of registered auditors, aliases, and architectural responsibilities.',
		header_alias: 'Alias',
		header_name: 'Auditor Name',
		header_scope: 'Scope / Layer',
	}

	/**
	 * Run the listing subcommand.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { InspectorApp } = await import('./InspectorApp.js')
		const options = InspectorApp.command.options || []

		const auditors = options.map((AuditorClass) => {
			const alias = AuditorClass.alias || ''
			const name = AuditorClass.name
			const title = AuditorClass.UI?.title || name
			const description = AuditorClass.UI?.description || AuditorClass.command?.help || ''
			return {
				alias,
				name,
				title,
				description,
			}
		})

		yield show(ListAuditorsApp.UI.title, 'info')

		for (const a of auditors) {
			yield show(`• [${a.alias || '-'}] ${a.name} — ${a.description || a.title}`, 'info')
		}

		return result({
			ok: true,
			auditors,
		})
	}
}
