import { ModelAsApp } from '@nan0web/ui-cli'
import { progress, result, show } from '@nan0web/ui'

export class WorkflowIndexApp extends ModelAsApp {
	static alias = 'workflow-index'

	static UI = {
		title: 'Workflow Index Generator',
		starting: 'Scanning workflows directory...',
		done: 'Generated README.md with {count} workflows.',
		errorNoDb: 'Database instance (db) is missing.',
	}

	static dir = {
		help: 'Target workflows directory',
		default: 'docs/uk/workflows',
		positional: true,
	}

	/**
	 * @param {Partial<WorkflowIndexApp>} [data]
	 * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Target directory */
		this.dir
	}

	async *run() {
		if (this.help) return yield* super.run()

		const { t, db } = this._
		if (!db) {
			throw new Error(t(WorkflowIndexApp.UI.errorNoDb))
		}

		yield progress(t(WorkflowIndexApp.UI.starting))

		const items = []
		try {
			const entries = await db.listDir(this.dir)
			for (const entry of entries) {
				if (entry.isDirectory || !entry.name.endsWith('.md') || entry.name === 'README.md') {
					continue
				}

				const content = await db.loadDocumentAs('.txt', entry.path).catch(() => '')
				let description = '*No description found*'
                
				// Parse frontmatter and headers
				const lines = content.split('\n')
				let isYaml = false
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i].trim()
					if (i === 0 && line === '---') { isYaml = true; continue; }
					if (isYaml) {
						if (line === '---') { isYaml = false; continue; }
						if (line.startsWith('description:')) {
							description = line.slice(12).trim().replace(/^['"]|['"]$/g, '')
							break
						}
					}
					if (!isYaml && line.startsWith('# ')) {
						description = line.slice(2).trim()
						break
					}
				}
				items.push({ name: entry.name, description })
			}
		} catch (e) {
			yield show(`Failed to read ${this.dir}: ${e.message}`, 'error')
			return
		}

		if (items.length === 0) {
			yield show('No workflows found.', 'warn')
			return
		}

		items.sort((a, b) => a.name.localeCompare(b.name))

		let md = `# 🗂 Index: Workflows\n\n`
		md += `> Automatically generated on ${new Date().toLocaleDateString()}\n\n`
		md += `| Workflow | Description |\n`
		md += `|----------|-------------|\n`
		for (const item of items) {
			md += `| **[${item.name}](./${item.name})** | ${item.description.replace(/\|/g, '\\|')} |\n`
		}

		await db.saveDocument(`${this.dir}/README.md`, md)
		yield show(t(WorkflowIndexApp.UI.done, { count: items.length }), 'success')

		return result({ ok: true, count: items.length })
	}
}
