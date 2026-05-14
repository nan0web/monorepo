import { ModelAsApp } from '../ModelAsApp.js'
import { show, result, render } from '../../core/Intent.js'

export default class ConfigApp extends ModelAsApp {
	static name = 'config'
	static alias = 'cfg'

	static resource = {
		type: 'string',
		help: 'Resource to configure (e.g. agents)',
		positional: true,
		default: 'agents',
	}

	static action = {
		type: 'string',
		help: 'Action to perform (e.g. list)',
		positional: true,
		default: 'list',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		this.resource = data.resource || 'agents'
		this.action = data.action || 'list'
	}

	async *run() {
		if (this.resource === 'agents') {
			if (this.action === 'list') {
				const DBFS = (await import('@nan0web/db-fs')).default
				const db = new DBFS({ root: process.cwd() })
				const config = await db.loadDocument('nan0web.nan0', {}).catch(() => ({}))

				if (!config || !config.agents || !Array.isArray(config.agents)) {
					yield show('No agents configured in nan0web.nan0')
					return result({ success: true })
				}

				const tableData = config.agents.map((a) => ({
					ID: a.id,
					Description: a.description,
					Workflows: a.workflows ? a.workflows.length : 0,
					Inspectors: a.inspectors ? a.inspectors.length : 0,
				}))

				yield render('Table', { 
					data: tableData, 
					columns: ['ID', 'Description', 'Workflows', 'Inspectors'],
					interactive: false 
				})
				return result({ success: true })
			}
			yield show(`Unknown action for agents: ${this.action}`, 'error')
			return result({ success: false })
		}

		yield show(`Unknown config resource: ${this.resource}`, 'error')
		return result({ success: false })
	}
}
