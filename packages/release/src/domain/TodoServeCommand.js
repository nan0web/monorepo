import { ModelAsApp, result, show } from '@nan0web/ui'
import { Markdown } from '@nan0web/markdown'
import { TodoCommand } from './TodoCommand.js'
import { ProjectsMap } from './Task/ProjectsMap.js'
import { SystemAdapter } from '../adapters/SystemAdapter.js'

const renderHtmlPage = () => `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>todo.test</title></head>
<body>
<h1>Матриця задач</h1>
<div id="app">Завантаження...</div>
<script>
async function load() {
  const res = await fetch('/api/tasks');
  const data = await res.json();
  document.getElementById('app').textContent = JSON.stringify(data, null, 2);
}
load();
</script>
</body>
</html>`

/**
 * TodoServeCommand (ModelAsApp)
 * Minimal HTTP server for interactive task matrix (https://todo.test).
 */
export class TodoServeCommand extends ModelAsApp {
	static alias = 'todo-serve'

	static UI = {
		title: 'Interactive Task Matrix Web Server',
	}

	static port = { type: 'number', default: 4010, alias: 'p', help: 'HTTP port' }
	static file = { type: 'string', default: 'todo.md', help: 'Primary todo markdown file' }

	/**
	 * @param {Partial<TodoServeCommand>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { system?: SystemAdapter }} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {number} */ this.port = Number(data.port ?? 4010)
		/** @type {string} */ this.file = data.file ?? 'todo.md'
		/** @type {SystemAdapter} */ this.$system = options.system || new SystemAdapter()
	}

	/**
	 * @param {string} filePath
	 * @returns {Promise<import('./Task/TaskModel.js').TaskModel[]>}
	 */
	async loadTasks(filePath) {
		const doc = await this.$db.loadDocument(filePath, null).catch(() => null)
		if (!doc) return []
		return TodoCommand.extractTasks(new Markdown(String(doc)), filePath)
	}

	/**
	 * Build JSON state for GET /api/tasks.
	 * @returns {Promise<object>}
	 */
	async getState() {
		const [today, pool, future, projectsMap] = await Promise.all([
			this.loadTasks(this.file),
			this.loadTasks('pool.md'),
			this.loadTasks('future.md'),
			ProjectsMap.load(this.$db),
		])
		return { today, pool, future, pendingOld: [], projects: projectsMap.entries }
	}

	/**
	 * Update status for POST /api/status.
	 * @param {{ file?: string, target: string, status: string }} payload
	 * @returns {Promise<object>}
	 */
	async updateStatus(payload) {
		const targetFile = payload.file || this.file
		const doc = await this.$db.loadDocument(targetFile, null).catch(() => null)
		if (!doc) return { ok: false, reason: 'file_not_found' }
		const ast = new Markdown(String(doc))
		const mutated = TodoCommand.mutateTask(ast, payload.target, /** @type {any} */ (payload.status))
		if (!mutated) return { ok: false, reason: 'task_not_found' }
		await this.$db.saveDocument(targetFile, String(ast))
		return { ok: true, state: await this.getState() }
	}

	/**
	 * Handle HTTP request (testable without opening real socket).
	 * @param {{ method?: string, url?: string, body?: string }} req
	 * @returns {Promise<{ status: number, contentType: string, body: string }>}
	 */
	async handleRequest(req) {
		const url = req.url || '/'
		if (req.method === 'GET' && url === '/api/tasks') {
			return { status: 200, contentType: 'application/json', body: JSON.stringify(await this.getState()) }
		}
		if (req.method === 'POST' && url === '/api/status') {
			const payload = JSON.parse(req.body || '{}')
			const res = await this.updateStatus(payload)
			return { status: res.ok ? 200 : 404, contentType: 'application/json', body: JSON.stringify(res) }
		}
		return { status: 200, contentType: 'text/html; charset=utf-8', body: renderHtmlPage() }
	}

	async *run() {
		await this.$system.startHttpServer(this.port, async (req, res) => {
			let body = ''
			for await (const chunk of req) body += chunk
			const out = await this.handleRequest({ method: req.method, url: req.url, body })
			res.writeHead(out.status, { 'Content-Type': out.contentType })
			res.end(out.body)
		})
		yield show(`Todo matrix server listening on http://localhost:${this.port}`, 'success')
		return result({ ok: true, port: this.port })
	}
}

export default TodoServeCommand
