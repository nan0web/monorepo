import { LitElement, html, css } from 'lit'
import './ReleaseFilterBar.js'
import './ReleaseProjectCard.js'

/**
 * ReleaseDashboardLit - Main Lit Web Component for ReleaseDashboard.
 * Uses this.$db (IndexedDB) for persistent state management.
 *
 * @element release-dashboard-lit
 * @prop {Object} summary - Aggregated summary stats
 * @prop {Array<any>} projects - Projects list
 */
export class ReleaseDashboardLit extends LitElement {
	static properties = {
		summary: { type: Object },
		projects: { type: Array },
		filter: { type: String },
		priority: { type: String },
		search: { type: String },
	}

	constructor() {
		super()
		this.summary = { totalProjects: 0, wipCount: 0, closedCount: 0, totalHours: 0, totalIterations: 0 }
		this.projects = []
		this.filter = 'all'
		this.priority = 'all'
		this.search = ''
		this._db = null
	}

	/**
	 * Getter for this.$db (Client database access protocol)
	 */
	get $db() {
		return this._db
	}

	set $db(val) {
		this._db = val
	}

	async connectedCallback() {
		super.connectedCallback()
		await this._initDb()
		await this._loadSavedState()
	}

	async _initDb() {
		if (this._db) return
		if (typeof window !== 'undefined' && window.indexedDB) {
			this._db = await new Promise((resolve) => {
				try {
					const req = window.indexedDB.open('nano_release_dashboard', 1)
					req.onupgradeneeded = (e) => {
						const db = e.target.result
						if (!db.objectStoreNames.contains('settings')) {
							db.createObjectStore('settings')
						}
					}
					req.onsuccess = (e) => resolve(e.target.result)
					req.onerror = () => resolve(null)
				} catch {
					resolve(null)
				}
			})
		}
	}

	async _loadSavedState() {
		if (!this._db) return
		try {
			const savedFilter = await this._getStoreValue('filter')
			if (savedFilter) this.filter = savedFilter
			const savedPrio = await this._getStoreValue('priority')
			if (savedPrio) this.priority = savedPrio
			this.requestUpdate()
		} catch {}
	}

	async _getStoreValue(key) {
		if (!this._db) return null
		return new Promise((resolve) => {
			try {
				const tx = this._db.transaction('settings', 'readonly')
				const store = tx.objectStore('settings')
				const req = store.get(key)
				req.onsuccess = () => resolve(req.result)
				req.onerror = () => resolve(null)
			} catch {
				resolve(null)
			}
		})
	}

	async _saveStoreValue(key, value) {
		if (!this._db) return
		return new Promise((resolve) => {
			try {
				const tx = this._db.transaction('settings', 'readwrite')
				const store = tx.objectStore('settings')
				const req = store.put(value, key)
				req.onsuccess = () => resolve(true)
				req.onerror = () => resolve(false)
			} catch {
				resolve(false)
			}
		})
	}

	_handleFilterChange(e) {
		const { filter, priority, search } = e.detail
		this.filter = filter
		this.priority = priority
		this.search = search
		this._saveStoreValue('filter', filter)
		this._saveStoreValue('priority', priority)
	}

	_handlePriorityChange(e) {
		const { project, priority } = e.detail
		this._saveStoreValue(`prio_${project.name}`, priority)
	}

	static styles = css`
		:host {
			display: block;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			color: #e2e8f0;
			background: #0f172a;
			min-height: 100vh;
			padding: 2rem;
		}
		.dashboard-header {
			margin-bottom: 2rem;
		}
		.stats-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
			gap: 1rem;
			margin-bottom: 2rem;
		}
		.stat-box {
			background: rgba(255, 255, 255, 0.04);
			border: 1px solid rgba(255, 255, 255, 0.08);
			border-radius: 8px;
			padding: 1rem;
			text-align: center;
		}
		.stat-val {
			font-size: 1.8rem;
			font-weight: 700;
			color: var(--co, #818cf8);
		}
		.stat-lbl {
			font-size: 0.8rem;
			color: rgba(255, 255, 255, 0.6);
		}
	`

	render() {
		const s = this.summary || {}
		const allProjects = this.projects || []

		const filtered = allProjects.filter((p) => {
			if (this.filter === 'wip' && p.status !== 'wip') return false
			if (this.filter === 'closed' && p.status !== 'closed') return false
			if (this.priority !== 'all' && String(p.priority) !== this.priority) return false
			if (this.search) {
				const q = this.search.toLowerCase()
				const matchName = (p.name || '').toLowerCase().includes(q)
				const matchPath = (p.path || '').toLowerCase().includes(q)
				const matchTask = (p.tasks || []).some((t) => (t.content || '').toLowerCase().includes(q))
				if (!matchName && !matchPath && !matchTask) return false
			}
			return true
		})

		return html`
			<div class="dashboard-header">
				<h1>📊 PM-as-Code Release Hub (Lit)</h1>
				<div class="stats-grid">
					<div class="stat-box">
						<div class="stat-val">${s.totalProjects ?? allProjects.length}</div>
						<div class="stat-lbl">Проєктів</div>
					</div>
					<div class="stat-box">
						<div class="stat-val">${s.wipCount ?? 0}</div>
						<div class="stat-lbl">Active WIP</div>
					</div>
					<div class="stat-box">
						<div class="stat-val">${s.closedCount ?? 0}</div>
						<div class="stat-lbl">Closed</div>
					</div>
					<div class="stat-box">
						<div class="stat-val">${s.totalHours ?? 0}h</div>
						<div class="stat-lbl">Загальний час</div>
					</div>
				</div>
			</div>

			<release-filter-bar
				.filter=${this.filter}
				.priority=${this.priority}
				.search=${this.search}
				@filter-change=${this._handleFilterChange}
			></release-filter-bar>

			<div class="projects-container">
				${filtered.map(
					(proj) => html`
						<release-project-card
							.project=${proj}
							@project-priority-change=${this._handlePriorityChange}
						></release-project-card>
					`,
				)}
			</div>
		`
	}
}

if (!customElements.get('release-dashboard-lit')) {
	customElements.define('release-dashboard-lit', ReleaseDashboardLit)
}

export default ReleaseDashboardLit
