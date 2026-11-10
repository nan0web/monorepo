import { ModelAsApp, result, show, progress, render } from '@nan0web/ui'
import { InstallApp } from './InstallApp.js'

/**
 * DoctorApp — Health check and diagnostics for MCP cross-editor integration.
 */
export class DoctorApp extends ModelAsApp {
	static alias = 'doctor'

	static UI = {
		title: 'Cross-Editor Health & MCP Doctor',
		description: 'Validates editor configurations and verifies inspect MCP bridge availability.',
		diagnosing: 'Diagnosing installed editors and MCP configurations...',
		checking_editor: 'Checking {editor}...',
		all_green: '✅ Green Ready: inspect MCP server is configured and ready for agents.',
		no_configured: '⚠️ Warning: No editors have nan0web-inspect MCP server configured.',
		editor: 'Editor',
		detected: 'Detected',
		mcp_configured: 'MCP Configured',
		config_path: 'Config Path',
		yes: 'Yes',
		no: 'No',
		active: 'Active',
		inactive: 'Inactive',
	}

	static dir = {
		type: 'string',
		help: 'Workspace root directory',
		positional: true,
		default: '.',
	}

	static homedir = {
		type: 'string',
		help: 'Home directory for user-level editor configs',
		default: '',
	}

	/**
	 * @param {Partial<DoctorApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Workspace root directory */ this.dir
		/** @type {string} Home directory for user-level editor configs */ this.homedir
	}

	/**
	 * Run the diagnostic doctor.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t } = this._
		yield progress(t(DoctorApp.UI.diagnosing))

		const installer = new InstallApp({ dir: this.dir, homedir: this.homedir }, { db: this.$db, t })
		const editors = await installer.discoverEditors()

		const colEditor = t(DoctorApp.UI.editor)
		const colDetected = t(DoctorApp.UI.detected)
		const colMcpConfigured = t(DoctorApp.UI.mcp_configured)
		const colConfigPath = t(DoctorApp.UI.config_path)

		const statusYes = t(DoctorApp.UI.yes)
		const statusNo = t(DoctorApp.UI.no)
		const statusActive = `✅ ${t(DoctorApp.UI.active)}`
		const statusInactive = `❌ ${t(DoctorApp.UI.inactive)}`

		const diagnostics = []
		let activeCount = 0

		for (const editor of editors) {
			let isConfigured = false
			const doc = (await this.$db.loadDocument(editor.configUri).catch(() => null)) || {}

			if (editor.type === 'settings') {
				isConfigured = Boolean(doc['mcp.servers']?.['nan0web-inspect'])
			} else {
				isConfigured = Boolean(doc.mcpServers?.['nan0web-inspect'])
			}

			if (isConfigured) {
				activeCount++
			}

			diagnostics.push({
				[colEditor]: editor.name,
				[colDetected]: editor.detected ? statusYes : statusNo,
				[colMcpConfigured]: isConfigured ? statusActive : statusInactive,
				[colConfigPath]: editor.configUri,
			})
		}

		yield render('Table', {
			UI: t(DoctorApp.UI.title),
			columns: [colEditor, colDetected, colMcpConfigured, colConfigPath],
			data: diagnostics,
			interactive: false,
		})

		if (activeCount > 0) {
			yield show(t(DoctorApp.UI.all_green), 'success')
			return result({
				status: 'ok',
				activeCount,
				diagnostics,
			})
		}

		yield show(t(DoctorApp.UI.no_configured), 'warn')
		return result({
			status: 'warning',
			activeCount,
			diagnostics,
		})
	}
}
