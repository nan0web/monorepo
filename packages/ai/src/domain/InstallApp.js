import { ModelAsApp, result, show, progress, render } from '@nan0web/ui'
import { EditorDetector } from './EditorDetector.js'

/**
 * InstallApp — Cross-Editor Installer for @nan0web/ai (MCP servers & Skills).
 */
export class InstallApp extends ModelAsApp {
	static alias = 'install'

	static UI = {
		title: 'NaN0•Web AI Installer',
		description:
			'Detects installed AI editors, registers nan0web-knowledge MCP server safely, and syncs skills.',
		discovering: 'Scanning for installed AI environments...',
		installing: 'Configuring {editor}...',
		installed: 'Configured {editor} at {path}',
		skills_synced: 'Synced {count} skill(s) for {editor} in {dir}',
		rule_synced: 'Synced global cascade rule for {editor} at {path}',
		complete: 'Installation complete: {count} environment(s) updated.',
		editor: 'Editor',
		status: 'Status',
		config_path: 'Config Path',
		configured: 'Configured',
		not_detected: 'Not Detected',
	}

	static global = {
		type: 'boolean',
		help: 'Install skills globally to user home directory instead of local workspace',
		alias: 'g',
		default: false,
	}

	static mcp = {
		type: 'boolean',
		help: 'Register nan0web-knowledge MCP server in detected editors',
		default: true,
	}

	static skills = {
		type: 'boolean',
		help: 'Sync workflow skills into detected editors',
		default: true,
	}

	static rules = {
		type: 'boolean',
		help: 'Sync global cascade AGENTS.md rule into detected editors',
		default: true,
	}

	/**
	 * @param {Partial<InstallApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Install skills globally */ this.global
		/** @type {boolean} Register MCP server */ this.mcp
		/** @type {boolean} Sync skills */ this.skills
		/** @type {boolean} Sync global cascade rule */ this.rules
	}

	/**
	 * Returns canonical nan0web-knowledge MCP server declaration.
	 * @returns {Record<string, object>}
	 */
	getMcpServers() {
		const mcpPath = this.$db.location('@app/bin/mcp-server.js')
		return {
			'nan0web-knowledge': {
				command: 'node',
				args: [mcpPath],
			},
		}
	}

	/**
	 * Safely merges nan0web-knowledge MCP configuration into target editor config.
	 * @param {import('./EditorDetector.js').EditorDef} editor
	 * @param {EditorDetector} detector
	 * @returns {Promise<boolean>}
	 */
	async configureMcp(editor, detector) {
		const existing = (await this.$db.loadDocument(editor.configUri).catch(() => ({}))) || {}
		const updated = detector.mergeMcpServers(existing, editor.type, this.getMcpServers())
		await this.$db.saveDocument(editor.configUri, updated)
		return true
	}

	/**
	 * Syncs skills from @app/docs/uk/workflows into the target editor directory.
	 * @param {import('./EditorDetector.js').EditorDef} editor
	 * @returns {Promise<{ count: number, targetDir: string | null }>}
	 */
	async syncSkills(editor) {
		const targetDir = this.global ? editor.globalSkillsDir : editor.localSkillsDir
		if (!targetDir) {
			return { count: 0, targetDir: null }
		}

		const sourceDir = '@app/docs/uk/workflows'
		const entries = await this.$db.listDir(sourceDir).catch(() => [])
		let count = 0

		for (const entry of entries) {
			const name = typeof entry === 'string' ? entry : entry.name
			if (!name || !name.endsWith('.md')) continue

			const srcUri = `${sourceDir}/${name}`
			const content = await this.$db.loadDocument(srcUri).catch(() => null)
			if (content !== null && content !== undefined) {
				const destUri = this.$db.resolveSync(targetDir, name)
				await this.$db.saveDocument(destUri, content)
				count++
			}
		}

		return { count, targetDir }
	}

	/**
	 * Returns canonical global cascade AGENTS.md rule content.
	 * @returns {string}
	 */
	getGlobalRuleContent() {
		return [
			'---',
			'trigger: always_on',
			'description: Обовʼязковий каскадний протокол читання AGENTS.md та воркфлоу перед будь-якою дією',
			'---',
			'',
			'# Обовʼязковий старт сесії: Каскад AGENTS.md',
			'',
			'Перед будь-якою іншою дією агент зобовʼязаний:',
			'1. Прочитати `AGENTS.md` у поточному workspace і перевірити його `frontmatter`.',
			'2. Поки у `frontmatter` є поле `parent:` — каскадом читати `../AGENTS.md` відносно директорії поточного файлу аж до $L_0$ (де `parent` відсутній).',
			'3. Визначити за лінивим індексом релевантні воркфлоу для поточної задачі, прочитати їх і слідувати всім правилам.',
			'4. Лише після завершення кроків 1–3 переходити до виконання задачі.',
			'',
		].join('\n')
	}

	/**
	 * Syncs global cascade AGENTS.md rule into the target editor.
	 * @param {import('./EditorDetector.js').EditorDef} editor
	 * @returns {Promise<string | null>}
	 */
	async syncGlobalRule(editor) {
		if (!editor.globalRuleUri) {
			return null
		}
		await this.$db.saveDocument(editor.globalRuleUri, this.getGlobalRuleContent())
		return editor.globalRuleUri
	}

	/**
	 * Run the installer.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t } = this._
		yield progress(t(InstallApp.UI.discovering))

		const detector = new EditorDetector({}, { db: this.$db })
		const editors = await detector.discoverEditors()
		let updatedCount = 0

		for (const editor of editors) {
			if (!editor.detected) continue

			yield progress(t(InstallApp.UI.installing, { editor: editor.name }))

			if (this.mcp) {
				await this.configureMcp(editor, detector)
				yield show(
					t(InstallApp.UI.installed, { editor: editor.name, path: editor.configUri }),
					'success'
				)
			}

			if (this.skills) {
				const { count, targetDir } = await this.syncSkills(editor)
				if (count > 0 && targetDir) {
					yield show(
						t(InstallApp.UI.skills_synced, { count, editor: editor.name, dir: targetDir }),
						'info'
					)
				}
			}

			if (this.rules && editor.globalRuleUri) {
				const rulePath = await this.syncGlobalRule(editor)
				if (rulePath) {
					yield show(t(InstallApp.UI.rule_synced, { editor: editor.name, path: rulePath }), 'info')
				}
			}

			updatedCount++
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
