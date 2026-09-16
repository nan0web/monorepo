import { LitElement, html, css } from 'lit'

/**
 * ReleaseTaskList - Interactive task checklist with filters and priority cycling.
 *
 * @element release-task-list
 * @prop {Array<any>} tasks - Tasks array
 * @prop {string} filter - Task filter ('all'|'todo'|'done')
 * @prop {string} projectName - Project name for storage
 */
export class ReleaseTaskList extends LitElement {
	static properties = {
		tasks: { type: Array },
		filter: { type: String },
		projectName: { type: String },
	}

	constructor() {
		super()
		this.tasks = []
		this.filter = 'all'
		this.projectName = ''
	}

	static styles = css`
		:host {
			display: block;
			margin-top: 1rem;
		}
		.task-filter-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 0.6rem;
		}
		.task-filter-btns {
			display: flex;
			gap: 0.35rem;
		}
		.btn-filter {
			background: rgba(255, 255, 255, 0.05);
			border: 1px solid rgba(255, 255, 255, 0.1);
			color: inherit;
			padding: 0.2rem 0.6rem;
			border-radius: 6px;
			font-size: 0.78rem;
			cursor: pointer;
		}
		.btn-filter.active {
			background: var(--co, #818cf8);
			color: #fff;
		}
		.tasks-list {
			list-style: none;
			padding: 0;
			margin: 0;
			display: flex;
			flex-direction: column;
			gap: 0.4rem;
		}
		.task-item {
			display: flex;
			align-items: center;
			gap: 0.6rem;
			padding: 0.45rem 0.75rem;
			background: rgba(255, 255, 255, 0.02);
			border: 1px solid rgba(255, 255, 255, 0.05);
			border-radius: 6px;
			font-size: 0.85rem;
		}
		.task-done {
			opacity: 0.7;
			text-decoration: line-through;
		}
		.task-done:hover {
			opacity: 1;
			text-decoration: none;
		}
		.prio-badge {
			padding: 0.15rem 0.45rem;
			border-radius: 4px;
			font-size: 0.72rem;
			font-weight: 600;
			cursor: pointer;
		}
		.prio-0 { background: #ef4444; color: #fff; }
		.prio-1 { background: #f59e0b; color: #000; }
		.prio-2 { background: #3b82f6; color: #fff; }
		.prio-3 { background: rgba(255, 255, 255, 0.15); color: inherit; }
	`

	_cyclePriority(e, task) {
		e.stopPropagation()
		const current = parseInt(task.priority ?? '1', 10)
		const next = (current + 1) % 4
		task.priority = String(next)
		this.requestUpdate()
		this.dispatchEvent(new CustomEvent('task-priority-change', {
			detail: { task, priority: String(next), projectName: this.projectName },
			bubbles: true,
			composed: true,
		}))
	}

	render() {
		const allTasks = this.tasks || []
		const doneTasks = allTasks.filter((t) => t.status === 'Done')
		const todoTasks = allTasks.filter((t) => t.status !== 'Done')

		let visibleTasks = allTasks
		if (this.filter === 'done') visibleTasks = doneTasks
		if (this.filter === 'todo') visibleTasks = todoTasks

		return html`
			<div class="task-filter-header">
				<span style="font-weight: 600; font-size: 0.88rem;">
					Завдання (${doneTasks.length}/${allTasks.length})
				</span>
				<div class="task-filter-btns">
					<button
						type="button"
						class="btn-filter ${this.filter === 'all' ? 'active' : ''}"
						@click=${() => { this.filter = 'all' }}
					>
						Всі (${allTasks.length})
					</button>
					<button
						type="button"
						class="btn-filter ${this.filter === 'todo' ? 'active' : ''}"
						@click=${() => { this.filter = 'todo' }}
					>
						Невиконані (${todoTasks.length})
					</button>
					<button
						type="button"
						class="btn-filter ${this.filter === 'done' ? 'active' : ''}"
						@click=${() => { this.filter = 'done' }}
					>
						Виконані (${doneTasks.length})
					</button>
				</div>
			</div>
			<ul class="tasks-list">
				${visibleTasks.map(
					(t) => html`
						<li class="task-item ${t.status === 'Done' ? 'task-done' : 'task-todo'}">
							<span>${t.status === 'Done' ? '✓' : '○'}</span>
							<span
								class="prio-badge prio-${t.priority ?? '1'}"
								@click=${(e) => this._cyclePriority(e, t)}
							>
								P${t.priority ?? '1'}
							</span>
							<span>${t.content}</span>
						</li>
					`,
				)}
			</ul>
		`
	}
}

if (!customElements.get('release-task-list')) {
	customElements.define('release-task-list', ReleaseTaskList)
}

export default ReleaseTaskList
