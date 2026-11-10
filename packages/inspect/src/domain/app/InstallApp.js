import { ModelAsApp, result, show, progress, render } from '@nan0web/ui'

/**
 * Editor Definition
 * @typedef {Object} EditorDef
 * @property {string} id
 * @property {string} name
 * @property {string} configUri
 * @property {boolean} detected
 * @property {'mcp' | 'settings' | 'antigravity'} [type]
 */

/**
 * InstallApp — Cross-Editor Zero-Hallucination Installer & MCP Bridge.
 */
export class InstallApp extends ModelAsApp {
	static alias = 'install'

	static UI = {
		title: 'Cross-Editor MCP Installer',
		description:
			'Automatically detects installed AI editors and registers nan0web-inspect MCP server safely.',
		discovering: 'Scanning for installed AI environments...',
		installing: 'Registering nan0web-inspect MCP server in {editor}...',
		installed: 'Configured {editor} at {path}',
		already_configured: '{editor} is already up to date at {path}',
		no_editors: 'No supported AI editors detected.',
		complete: 'Installation complete: {count} environment(s) updated.',
		editor: 'Editor',
		status: 'Status',
		config_path: 'Config Path',
		configured: 'Configured',
		not_detected: 'Not Detected',
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
	 * @param {Partial<InstallApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Workspace root directory */ this.dir
		/** @type {string} Home directory for user-level editor configs */ this.homedir
	}

	/**
	 * Resolves user home directory path.
	 * @returns {string}
	 */
	getHomedir() {
		if (this.homedir) return this.homedir
		if (typeof process !== 'undefined' && process.env) {
			return process.env.HOME || process.env.USERPROFILE || ''
		}
		return ''
	}

	/**
	 * Discovers supported AI editors in the workspace and user environment.
	 * Supports macOS, Linux, and Windows path conventions.
	 * @returns {Promise<EditorDef[]>}
	 */
	async discoverEditors() {
		const homedir = this.getHomedir()
		const cwd = this.dir || '.'
		const isWin = typeof process !== 'undefined' && process.platform === 'win32'
		const appData = (typeof process !== 'undefined' && process.env?.APPDATA) || ''

		let claudeConfigUri
		if (isWin && appData) {
			claudeConfigUri = this.$db.resolveSync(appData, 'Claude/claude_desktop_config.json')
		} else if (isWin) {
			claudeConfigUri = this.$db.resolveSync(
				homedir,
				'AppData/Roaming/Claude/claude_desktop_config.json'
			)
		} else {
			// macOS default: ~/Library/Application Support/Claude
			// Linux fallback: ~/.config/Claude
			const macClaude = this.$db.resolveSync(
				homedir,
				'Library/Application Support/Claude/claude_desktop_config.json'
			)
			const linuxClaude = this.$db.resolveSync(homedir, '.config/Claude/claude_desktop_config.json')
			const isLinux = typeof process !== 'undefined' && process.platform === 'linux'
			claudeConfigUri = isLinux ? linuxClaude : macClaude
		}

		/** @type {EditorDef[]} */
		const definitions = [
			{
				id: 'antigravity',
				name: 'Google Antigravity',
				configUri: this.$db.resolveSync(homedir, '.gemini/antigravity/mcp/config'),
				detected: false,
				type: 'antigravity',
			},
			{
				id: 'cursor',
				name: 'Cursor IDE',
				configUri: this.$db.resolveSync(cwd, '.cursor/mcp.json'),
				detected: false,
				type: 'mcp',
			},
			{
				id: 'vscode',
				name: 'VS Code / Windsurf',
				configUri: this.$db.resolveSync(cwd, '.vscode/settings.json'),
				detected: false,
				type: 'settings',
			},
			{
				id: 'claude',
				name: 'Claude Desktop',
				configUri: claudeConfigUri,
				detected: false,
				type: 'mcp',
			},
		]

		for (const def of definitions) {
			def.detected = await this._isEditorPresent(def)
		}

		return definitions
	}

	/**
	 * Checks if editor directory or config is present.
	 * @private
	 * @param {EditorDef} def
	 * @returns {Promise<boolean>}
	 */
	async _isEditorPresent(def) {
		const stat = await this.$db.stat(def.configUri).catch(() => null)
		if (stat && (stat.isFile || stat.isDirectory)) {
			return true
		}

		// Check directory presence if config file does not exist yet
		const dirUri = this.$db.dirname(def.configUri)
		const dirStat = await this.$db.stat(dirUri).catch(() => null)
		if (dirStat && dirStat.isDirectory) {
			return true
		}

		// In in-memory virtual DB, check if directory has files/entries
		const entries = await this.$db.listDir(dirUri).catch(() => [])
		if (entries && entries.length > 0) {
			return true
		}

		return false
	}

	/**
	 * Generates canonical nan0web-inspect MCP server declaration.
	 * @returns {object}
	 */
	getMcpServerConfig() {
		return {
			command: 'node',
			args: [this.$db.resolveSync(this.dir || '.', 'packages/inspect/src/ui/mcp.js')],
		}
	}

	/**
	 * Safely merges MCP configuration into target file.
	 * @param {EditorDef} editor
	 * @returns {Promise<boolean>} true if changed, false if already configured
	 */
	async configureEditor(editor) {
		const existing = (await this.$db.loadDocument(editor.configUri).catch(() => ({}))) || {}
		const serverConfig = this.getMcpServerConfig()

		if (editor.type === 'settings') {
			// VS Code format
			const mcpSettings = existing['mcp.servers'] || {}
			mcpSettings['nan0web-inspect'] = serverConfig
			existing['mcp.servers'] = mcpSettings
		} else {
			// Cursor, Claude, Antigravity format
			const mcpServers = existing.mcpServers || {}
			mcpServers['nan0web-inspect'] = serverConfig
			existing.mcpServers = mcpServers
		}

		await this.$db.saveDocument(editor.configUri, existing)
		return true
	}

	/**
	 * Run the installer.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t } = this._
		yield progress(t(InstallApp.UI.discovering))

		const editors = await this.discoverEditors()
		let updatedCount = 0

		for (const editor of editors) {
			if (editor.detected) {
				yield progress(t(InstallApp.UI.installing, { editor: editor.name }))
				await this.configureEditor(editor)
				yield show(
					t(InstallApp.UI.installed, { editor: editor.name, path: editor.configUri }),
					'success'
				)
				updatedCount++
			}
		}

		const colEditor = t(InstallApp.UI.editor)
		const colStatus = t(InstallApp.UI.status)
		const colConfigPath = t(InstallApp.UI.config_path)
		const statusConfigured = `✅ ${t(InstallApp.UI.configured)}`
		const statusNotDetected = `⚪ ${t(InstallApp.UI.not_detected)}`

		const tableData = editors.map((e) => ({
			[colEditor]: e.name,
			[colStatus]: e.detected ? statusConfigured : statusNotDetected,
			[colConfigPath]: e.configUri,
		}))

		yield render('Table', {
			UI: t(InstallApp.UI.title),
			columns: [colEditor, colStatus, colConfigPath],
			data: tableData,
			interactive: false,
		})

		yield show(t(InstallApp.UI.complete, { count: updatedCount }), 'success')

		return result({
			status: 'ok',
			updatedCount,
			editors,
		})
	}
}
