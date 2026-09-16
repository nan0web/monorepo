import { LitElement, html, css } from 'lit'
import './ReleaseTaskList.js'

/**
 * ReleaseProjectCard - Project card component for ReleaseDashboard.
 *
 * @element release-project-card
 * @prop {Object} project - Project data
 * @prop {boolean} expanded - Accordion open state
 */
export class ReleaseProjectCard extends LitElement {
	static properties = {
		project: { type: Object },
		expanded: { type: Boolean },
	}

	constructor() {
		super()
		this.project = null
		this.expanded = false
	}

	static styles = css`
		:host {
			display: block;
			margin-bottom: 0.75rem;
		}
		.card-header {
			display: grid;
			grid-template-columns: 2.5rem minmax(180px, 2fr) 1fr 1fr 1fr 1fr 1fr 1.5rem;
			align-items: center;
			padding: 0.85rem 1.25rem;
			background: var(--ui-card-bg, rgba(255, 255, 255, 0.04));
			border: 1px solid var(--ui-card-border, rgba(255, 255, 255, 0.08));
			border-radius: 8px;
			cursor: pointer;
			gap: 0.75rem;
			font-size: 0.88rem;
			transition: background 0.15s;
		}
		.card-header:hover {
			background: rgba(255, 255, 255, 0.07);
		}
		.card-body {
			padding: 1.25rem;
			background: rgba(0, 0, 0, 0.15);
			border: 1px solid var(--ui-card-border, rgba(255, 255, 255, 0.08));
			border-top: none;
			border-radius: 0 0 8px 8px;
		}
		.prio-badge {
			padding: 0.2rem 0.5rem;
			border-radius: 4px;
			font-size: 0.75rem;
			font-weight: 700;
			cursor: pointer;
		}
		.prio-0 { background: #ef4444; color: #fff; }
		.prio-1 { background: #f59e0b; color: #000; }
		.prio-2 { background: #3b82f6; color: #fff; }
		.prio-3 { background: rgba(255, 255, 255, 0.15); color: inherit; }
		.status-tag {
			padding: 0.2rem 0.5rem;
			border-radius: 4px;
			font-size: 0.75rem;
			font-weight: 700;
		}
		.status-wip { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
		.status-closed { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
		.status-unknown { background: rgba(255, 255, 255, 0.1); color: inherit; }
		.chevron {
			transition: transform 0.2s;
		}
		.chevron.open {
			transform: rotate(180deg);
		}
	`

	_toggle() {
		this.expanded = !this.expanded
	}

	_cyclePriority(e) {
		e.stopPropagation()
		if (!this.project) return
		const current = parseInt(this.project.priority ?? '1', 10)
		const next = (current + 1) % 4
		this.project.priority = String(next)
		this.requestUpdate()
		this.dispatchEvent(new CustomEvent('project-priority-change', {
			detail: { project: this.project, priority: String(next) },
			bubbles: true,
			composed: true,
		}))
	}

	render() {
		if (!this.project) return html``
		const p = this.project
		const doneTasks = (p.tasks || []).filter((t) => t.status === 'Done').length
		const totalTasks = (p.tasks || []).length

		return html`
			<div>
				<div class="card-header" @click=${this._toggle}>
					<span
						class="prio-badge prio-${p.priority ?? '1'}"
						@click=${this._cyclePriority}
					>
						P${p.priority ?? '1'}
					</span>
					<strong>${p.name}</strong>
					<span>v${p.version}</span>
					<span class="status-tag status-${p.status || 'unknown'}">
						${(p.status || 'unknown').toUpperCase()}
					</span>
					<span>${p.hours ?? 0}h / ${p.iterations ?? 0} iters</span>
					<span>RRS: ${p.rrs ?? 0}</span>
					<span>${doneTasks}/${totalTasks}</span>
					<span class="chevron ${this.expanded ? 'open' : ''}">▼</span>
				</div>
				${this.expanded
					? html`
							<div class="card-body">
								<div>
									<small style="color: rgba(255,255,255,0.6)">Шлях: ${p.path} | Гілка: ${p.branch || 'main'}</small>
								</div>
								<release-task-list
									.tasks=${p.tasks || []}
									.projectName=${p.name}
								></release-task-list>
							</div>
						`
					: html``}
			</div>
		`
	}
}

if (!customElements.get('release-project-card')) {
	customElements.define('release-project-card', ReleaseProjectCard)
}

export default ReleaseProjectCard
