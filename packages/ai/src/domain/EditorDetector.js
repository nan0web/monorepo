import { Model } from '@nan0web/types'

/**
 * Editor Definition
 * @typedef {Object} EditorDef
 * @property {string} id
 * @property {string} name
 * @property {string} configUri
 * @property {string} [globalSkillsDir]
 * @property {string} [localSkillsDir]
 * @property {string} [globalRuleUri]
 * @property {string[]} [detectionUris]
 * @property {boolean} detected
 * @property {'mcp' | 'settings' | 'antigravity'} [type]
 */

/**
 * EditorDetector — Shared domain model for discovering installed AI editors
 * and safely merging MCP server configurations without overwriting existing ones.
 */
export class EditorDetector extends Model {
	/**
	 * Registry of supported AI editors using virtual DB mounts.
	 * Add new editors (e.g. Aider, Vibe) here declaratively.
	 * @type {Omit<EditorDef, 'detected'>[]}
	 */
	static EDITORS = [
		{
			id: 'antigravity',
			name: 'Google Antigravity',
			configUri: '@gemini/config/mcp_config.json',
			globalSkillsDir: '@gemini/config/skills',
			localSkillsDir: '@gemini-local/skills',
			globalRuleUri: '@gemini/config/rules/cascade-agents.md',
			type: 'antigravity',
		},
		{
			id: 'cursor',
			name: 'Cursor IDE',
			configUri: '@cursor-local/mcp.json',
			globalSkillsDir: '@cursor/rules',
			localSkillsDir: '@cursor-local/rules',
			globalRuleUri: '@cursor/rules/cascade-agents.mdc',
			detectionUris: ['@cursor-local', '@cursor'],
			type: 'mcp',
		},
		{
			id: 'vscode',
			name: 'VS Code / Windsurf',
			configUri: '@vscode-local/settings.json',
			globalSkillsDir: '@vscode/skills',
			localSkillsDir: '@vscode-local/skills',
			globalRuleUri: '@vscode/rules/cascade-agents.md',
			type: 'settings',
		},
		{
			id: 'claude',
			name: 'Claude Desktop',
			configUri: '@claude/claude_desktop_config.json',
			globalRuleUri: '@claude/CLAUDE.md',
			type: 'mcp',
		},
	]

	/**
	 * @param {Partial<EditorDetector>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions & { db?: any }>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {any} Injected database provider */ this.$db = options.db
	}

	/**
	 * Discovers supported AI editors via virtual DB mounts.
	 * Completely agnostic to OS, process, or filesystem paths.
	 * @returns {Promise<EditorDef[]>}
	 */
	async discoverEditors() {
		/** @type {EditorDef[]} */
		const definitions = EditorDetector.EDITORS.map((def) => ({
			...def,
			detected: false,
		}))

		for (const def of definitions) {
			def.detected = await this.isEditorPresent(def)
		}

		return definitions
	}

	/**
	 * Checks if editor directory or config is present.
	 * @param {EditorDef} def
	 * @returns {Promise<boolean>}
	 */
	async isEditorPresent(def) {
		const stat = await this.$db.stat(def.configUri).catch(() => null)
		if (stat && (stat.isFile || stat.isDirectory)) {
			return true
		}

		const dirUri = this.$db.dirname(def.configUri)
		if (dirUri && dirUri !== '.' && !/^@[^/]+\/?$/.test(dirUri)) {
			const entries = await this.$db.listDir(dirUri).catch(() => [])
			if (entries && entries.length > 0) {
				return true
			}
		}

		if (Array.isArray(def.detectionUris)) {
			for (const uri of def.detectionUris) {
				const extraStat = await this.$db.stat(uri).catch(() => null)
				if (extraStat && extraStat.isFile) {
					return true
				}
				const extraEntries = await this.$db.listDir(uri).catch(() => [])
				if (extraEntries && extraEntries.length > 0) {
					return true
				}
			}
		}

		return false
	}

	/**
	 * Safely merges MCP server entries into an existing editor configuration object
	 * without overwriting unrelated servers.
	 * @param {Record<string, any>} existing
	 * @param {'mcp' | 'settings' | 'antigravity'} [editorType]
	 * @param {Record<string, object>} [servers]
	 * @returns {Record<string, any>}
	 */
	mergeMcpServers(existing = {}, editorType = 'mcp', servers = {}) {
		const target = { ...existing }
		if (editorType === 'settings') {
			const mcpSettings = { ...(target['mcp.servers'] || {}) }
			Object.assign(mcpSettings, servers)
			target['mcp.servers'] = mcpSettings
		} else {
			const mcpServers = { ...(target.mcpServers || {}) }
			Object.assign(mcpServers, servers)
			target.mcpServers = mcpServers
		}
		return target
	}
}
