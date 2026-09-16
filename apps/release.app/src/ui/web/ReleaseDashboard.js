import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * ReleaseDashboard - OLMUI Web UI Adapter & HTML Renderer for PM-as-Code releases.
 * Modular structure: CSS in style.css, client JS in client.js, clean component rendering.
 */
export class ReleaseDashboard {
	/**
	 * @param {Object} data
	 * @param {import('@nan0web/release/src/domain/Dashboard/DashboardModel.js').DashboardSummary} data.summary
	 * @param {import('@nan0web/release/src/domain/Dashboard/DashboardModel.js').ProjectDashboardEntry[]} data.projects
	 */
	constructor(
		data = {
			summary: { totalProjects: 0, totalReleases: 0, totalHours: 0, totalIterations: 0, wipCount: 0, closedCount: 0 },
			projects: [],
		},
	) {
		this.summary = data.summary || { totalProjects: 0, totalReleases: 0, totalHours: 0, totalIterations: 0, wipCount: 0, closedCount: 0 }
		this.projects = data.projects || []
	}

	/**
	 * Escape HTML entities to prevent injection
	 * @param {string} str
	 * @returns {string}
	 */
	static escapeHtml(str = '') {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;')
	}

	/**
	 * Render full dashboard HTML string
	 * @returns {string}
	 */
	render() {
		const { summary, projects } = this
		const escape = ReleaseDashboard.escapeHtml

		const cssContent = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8')
		const clientJsContent = fs.readFileSync(path.join(__dirname, 'client.js'), 'utf8')

		const projectRows = projects
			.map((proj, idx) => {
				const statusClass =
					proj.status === 'wip' ? 'status-wip' : proj.status === 'closed' ? 'status-closed' : 'status-unknown'
				const statusLabel = proj.status === 'wip' ? 'WIP' : proj.status === 'closed' ? 'CLOSED' : 'UNKNOWN'
				const rrsPassed = proj.rrs >= 324

				const doneTasksCount = (proj.tasks || []).filter((t) => t.status === 'Done').length
				const totalTasksCount = (proj.tasks || []).length
				const todoTasksCount = totalTasksCount - doneTasksCount
				const progressPercent = totalTasksCount > 0 ? Math.round((doneTasksCount / totalTasksCount) * 100) : 0

				const releasesCount = proj.releasesCount || (proj.allReleases && proj.allReleases.length) || 1
				const totalHours = proj.totalHours !== undefined ? proj.totalHours : proj.hours
				const totalIterations = proj.totalIterations !== undefined ? proj.totalIterations : proj.iterations
				
				// Standardized numeric priority (0, 1, 2, 3)
				let projectPriority = '1'
				const rawP = String(proj.priority || '1').toUpperCase()
				if (rawP === '0' || rawP === 'P0') projectPriority = '0'
				else if (rawP === '1' || rawP === 'P1') projectPriority = '1'
				else if (rawP === '2' || rawP === 'P2') projectPriority = '2'
				else if (rawP === '3' || rawP === 'P3') projectPriority = '3'

				const tasksHtml = (proj.tasks || [])
					.map((t, tIdx) => {
						const isDone = t.status === 'Done'
						const priority = String(t.priority || 'medium').toLowerCase()
						return `<li class="task-item ${isDone ? 'task-done' : 'task-todo'}" data-status="${isDone ? 'done' : 'todo'}" data-priority="${priority}" data-title="${escape(t.content)}" data-slug="${escape(t.slug || 'task-' + tIdx)}" id="task-${idx}-${tIdx}">
							<span class="task-icon">${isDone ? '✓' : '○'}</span>
							<span class="task-priority-badge priority-${priority}" title="Клікніть для зміни пріоритету завдання" onclick="cycleTaskPriority(event, '${escape(proj.name)}', '${escape(t.slug || 'task-' + tIdx)}', 'task-${idx}-${tIdx}')">
								${priority.toUpperCase()}
							</span>
							<span class="task-text">${escape(t.content)}</span>
						</li>`
					})
					.join('\n')

				const allReleasesDataJson = JSON.stringify(proj.allReleases || []).replace(/"/g, '&quot;')
				const allReleasesHtml = (proj.allReleases && proj.allReleases.length > 0)
					? `<div class="history-section">
						<h5 class="section-title">📦 Історія релізів проєкту (${proj.allReleases.length}) <span class="history-hint">(клікніть на реліз для перегляду завдань)</span></h5>
						<div class="history-list" id="history-list-${idx}">
							${proj.allReleases
								.map(
									(r, rIdx) => `<div class="history-badge ${r.version === proj.version ? 'active-release' : ''}" id="rel-badge-${idx}-${rIdx}" onclick="selectProjectRelease(event, ${idx}, ${rIdx})">
										<strong>v${escape(r.version)}</strong>
										<span>${r.hours} год</span>
										<span class="history-rrs ${r.rrs >= 324 ? 'rrs-pass' : 'rrs-warn'}">RRS: ${r.rrs}</span>
										<span class="badge ${r.status === 'wip' ? 'status-wip' : r.status === 'closed' ? 'status-closed' : 'status-unknown'} history-status-pill">${escape(r.status || 'unknown').toUpperCase()}</span>
									</div>`
								)
								.join('')}
						</div>
					</div>`
					: ''

				const deadlineHtml = proj.deadline
					? `<div class="deadline-badge ${proj.daysRemaining !== null && proj.daysRemaining <= 3 ? 'deadline-urgent' : 'deadline-normal'}">
						<span>📅 Дедлайн: <strong>${escape(proj.deadline)}</strong></span>
						${
							proj.daysRemaining !== null
								? `<span class="days-pill">${proj.daysRemaining < 0 ? `-${Math.abs(proj.daysRemaining)} дн.` : proj.daysRemaining === 0 ? 'сьогодні' : `${proj.daysRemaining} дн.`}</span>`
								: ''
						}
					</div>`
					: ''

				return `
				<div class="project-row project-card ${statusClass}" data-project="${escape(proj.name)}" data-status="${proj.status}" data-priority="${projectPriority}" data-hours="${totalHours}" data-iters="${totalIterations}" data-rrs="${proj.rrs}" data-path="${escape(proj.path)}" data-releases="${releasesCount}" data-progress="${progressPercent}" data-all-releases="${allReleasesDataJson}" id="row-${idx}">
					<div class="row-summary" onclick="toggleDetails(${idx})">
						<div class="col col-priority">
							<span class="proj-priority-badge priority-${projectPriority}" id="prio-badge-${idx}" title="Клікніть для зміни пріоритету проєкту" onclick="cycleProjectPriority(event, '${escape(proj.name)}', ${idx})">
								P${projectPriority}
							</span>
						</div>

						<div class="col col-project">
							<div class="project-name-wrapper">
								<span class="expand-icon" id="icon-${idx}">▸</span>
								<strong class="project-name" title="Клікніть щоб ізолювати фільтр для цього проєкту" onclick="isolateProject(event, '${escape(proj.name)}')">${escape(proj.name)}</strong>
							</div>
							<span class="project-path-sub" title="Клікніть щоб фільтрувати за цим шляхом" onclick="isolateProject(event, '${escape(proj.path)}')">${escape(proj.path)}</span>
						</div>

						<div class="col col-version">
							<span class="version-badge" id="version-badge-${idx}">v${escape(proj.version)}</span>
							<span class="releases-pill">${releasesCount} ${releasesCount === 1 ? 'реліз' : releasesCount < 5 ? 'релізи' : 'релізів'}</span>
						</div>

						<div class="col col-status">
							<span class="badge ${statusClass}" id="status-badge-${idx}">${statusLabel}</span>
						</div>

						<div class="col col-hours">
							<span class="val-primary">${totalHours} год</span>
							${proj.allReleases && proj.allReleases.length > 1 ? `<span class="val-sub">ост: ${proj.hours} год</span>` : ''}
						</div>

						<div class="col col-iters">
							<span class="val-primary">${totalIterations}</span>
						</div>

						<div class="col col-rrs">
							<span class="rrs-tag ${rrsPassed ? 'rrs-pass' : 'rrs-warn'}">${proj.rrs} / 324</span>
						</div>

						<div class="col col-progress">
							<div class="progress-container">
								<span class="progress-percent" id="progress-percent-${idx}">${progressPercent}%</span>
								<div class="progress-bar-bg">
									<div class="progress-bar-fill" id="progress-bar-${idx}" style="width: ${progressPercent}%"></div>
								</div>
							</div>
						</div>
					</div>

					<div class="row-details" id="details-${idx}">
						<div class="details-content">
							<div class="details-meta-bar">
								<div class="meta-item">
									<span class="meta-title">Реліз-документ:</span>
									<code class="meta-path" id="source-doc-${idx}">${escape(proj.sourceDoc || `${proj.path}/release.md`)}</code>
								</div>
								<div class="meta-item">
									<span class="meta-title">Git:</span>
									<span class="git-badge ${proj.gitStatus === 'dirty' ? 'git-dirty' : 'git-clean'}">
										⎇ ${escape(proj.branch || 'main')} (${escape(proj.gitStatus || 'clean')})
									</span>
								</div>
								${deadlineHtml ? `<div class="meta-item">${deadlineHtml}</div>` : ''}
								<div class="meta-item" style="margin-left: auto;">
									<button type="button" class="btn-tour" onclick="toggleTour(${idx})">✨ Data-Driven Тур змін</button>
								</div>
							</div>

							<div class="tour-container" id="tour-container-${idx}" style="display:none;">
								<div class="tour-card">
									<div class="tour-header">
										<strong>🎯 Data-Driven Showcase & Story Tour</strong>
										<span class="tour-badge">TDD / ProvenDoc</span>
									</div>
									<p class="tour-desc">Огляд реалізованих контрактів, моделей та прикладів змін для <code id="tour-version-${idx}">v${escape(proj.version)}</code>:</p>
									<div class="tour-links" id="tour-links-${idx}">
										<a class="tour-link" href="${proj.path}/release.md" target="_blank">📄 Паспорт релізу (release.md)</a>
										<a class="tour-link" href="${proj.path}/task.spec.js" target="_blank">🧪 Контрактні тести (task.spec.js)</a>
										<a class="tour-link" href="${proj.path}/user.md" target="_blank">📊 Журнал метрик (user.md)</a>
									</div>
								</div>
							</div>

							${allReleasesHtml}

							<div class="tasks-section" id="tasks-section-${idx}">
								<div class="tasks-header-wrapper">
									<h5 class="section-title" id="tasks-title-${idx}">Завдання спринту (${doneTasksCount}/${totalTasksCount})</h5>
									
									<div class="tasks-controls">
										<div class="task-filter-group" id="filter-group-${idx}">
											<button type="button" class="btn-task-filter active" onclick="filterTasks(${idx}, 'all')">Всі (${totalTasksCount})</button>
											<button type="button" class="btn-task-filter" onclick="filterTasks(${idx}, 'todo')">Невиконані (${todoTasksCount})</button>
											<button type="button" class="btn-task-filter" onclick="filterTasks(${idx}, 'done')">Виконані (${doneTasksCount})</button>
										</div>

										<div class="task-sort-group">
											<span class="sort-label">Сортувати:</span>
											<button type="button" class="btn-task-sort" onclick="sortProjectTasks(${idx}, 'priority')">Пріоритет ⇅</button>
											<button type="button" class="btn-task-sort" onclick="sortProjectTasks(${idx}, 'status')">Статус ⇅</button>
											<button type="button" class="btn-task-sort" onclick="sortProjectTasks(${idx}, 'title')">Назва ⇅</button>
										</div>
									</div>
								</div>

								<ul class="tasks-list" id="tasks-list-${idx}">
									${tasksHtml || '<p class="no-tasks-hint">Немає виокремлених завдань у цьому релізі</p>'}
								</ul>
							</div>
						</div>
					</div>
				</div>`
			})
			.join('\n')

		return `
<!DOCTYPE html>
<html lang="uk">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>PM-as-Code Release Dashboard</title>
	<style>
${cssContent}
	</style>
</head>
<body>
	<main class="dashboard-container">
		<header class="dashboard-header">
			<div>
				<h1 class="dashboard-title">🛰️ PM-as-Code Release Monitor</h1>
				<p class="dashboard-subtitle">Project Management as Code (PM-as-Code) • Release Monitor</p>
			</div>
			<div class="search-container">
				<input type="search" id="projectSearch" class="search-input" placeholder="🔍 Пошук за назвою, шляхом чи тегом..." />
				<button type="button" class="btn-save-bookmark" id="btnSaveBookmark" style="display:none" onclick="saveCurrentSearchBookmark()">+ Закладка</button>
			</div>
		</header>

		<section class="bookmarks-bar">
			<span class="bookmarks-label">📌 Закладки:</span>
			<div class="bookmarks-chips" id="bookmarksChips" style="display:flex; flex-wrap:wrap; gap:0.4rem;">
				<!-- Dynamic bookmarks rendered by JS -->
			</div>
		</section>

		<section class="summary-bar">
			<div class="summary-stat active-filter" data-action="filter" data-filter="all">
				<span class="num">${summary.totalProjects}</span>
				<span class="lbl">Проєктів</span>
			</div>
			<div class="summary-stat" data-action="filter" data-filter="wip">
				<span class="num" style="color: var(--accent-wip)">${summary.wipCount}</span>
				<span class="lbl">Активні (WIP)</span>
			</div>
			<div class="summary-stat" data-action="filter" data-filter="closed">
				<span class="num" style="color: var(--accent-closed)">${summary.closedCount}</span>
				<span class="lbl">Завершені</span>
			</div>
			<div class="summary-stat" data-action="sort" data-sort="releases">
				<span class="num" style="color: var(--accent-primary)">${summary.totalReleases || summary.totalProjects}</span>
				<span class="lbl">Всього Релізів</span>
			</div>
			<div class="summary-stat" data-action="sort" data-sort="hours">
				<span class="num">${summary.totalHours}</span>
				<span class="lbl">Сумарно Годин</span>
			</div>
			<div class="summary-stat" data-action="sort" data-sort="iters">
				<span class="num">${summary.totalIterations}</span>
				<span class="lbl">Ітерацій</span>
			</div>
		</section>

		<div class="table-header">
			<div class="th-sortable" data-sort="priority">Пріоритет <span class="sort-arrow">⇅</span></div>
			<div class="th-sortable" data-sort="project">Проєкт <span class="sort-arrow">⇅</span></div>
			<div class="th-sortable" data-sort="releases">Версія / Релізи <span class="sort-arrow">⇅</span></div>
			<div class="th-sortable" data-sort="status">Статус <span class="sort-arrow">⇅</span></div>
			<div class="th-sortable" data-sort="hours">Час (Год) <span class="sort-arrow">⇅</span></div>
			<div class="th-sortable" data-sort="iters">Ітерації <span class="sort-arrow">⇅</span></div>
			<div class="th-sortable" data-sort="rrs">RRS <span class="sort-arrow">⇅</span></div>
			<div class="th-sortable" data-sort="progress">Спринт <span class="sort-arrow">⇅</span></div>
		</div>

		<section class="projects-list" id="projectsList">
			${projectRows}
		</section>
	</main>

	<script>
${clientJsContent}
	</script>
</body>
</html>
		`.trim()
	}
}

export default ReleaseDashboard
