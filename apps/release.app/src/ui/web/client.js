// Client-side interactions for PM-as-Code Release Dashboard
// Using this.$db (IndexedDB) pattern for persisting UI state & priorities

function toggleDetails(idx) {
	const details = document.getElementById('details-' + idx)
	const icon = document.getElementById('icon-' + idx)
	if (!details) return
	const isOpen = details.classList.contains('open')
	if (isOpen) {
		details.classList.remove('open')
		if (icon) icon.textContent = '▸'
	} else {
		details.classList.add('open')
		if (icon) icon.textContent = '▾'
	}
}

function filterTasks(projectIdx, status) {
	const filterGroup = document.getElementById('filter-group-' + projectIdx)
	if (filterGroup) {
		const buttons = filterGroup.querySelectorAll('.btn-task-filter')
		buttons.forEach(b => b.classList.remove('active'))
		const clickedBtn = Array.from(buttons).find(b => {
			if (status === 'all') return b.textContent.includes('Всі')
			if (status === 'todo') return b.textContent.includes('Невиконані')
			if (status === 'done') return b.textContent.includes('Виконані')
			return false
		})
		if (clickedBtn) clickedBtn.classList.add('active')
	}

	const taskList = document.getElementById('tasks-list-' + projectIdx)
	if (!taskList) return
	const tasks = taskList.querySelectorAll('.task-item')
	tasks.forEach(task => {
		const taskStatus = task.getAttribute('data-status')
		if (status === 'all' || taskStatus === status) {
			task.style.display = 'flex'
		} else {
			task.style.display = 'none'
		}
	})
}

const taskSortState = {}
function sortProjectTasks(projectIdx, field) {
	const taskList = document.getElementById('tasks-list-' + projectIdx)
	if (!taskList) return
	const tasks = Array.from(taskList.querySelectorAll('.task-item'))

	const currentDir = taskSortState[projectIdx + '_' + field] === 'asc' ? 'desc' : 'asc'
	taskSortState[projectIdx + '_' + field] = currentDir

	const priorityOrder = { high: 1, medium: 2, med: 2, low: 3, 0: 0, 1: 1, 2: 2, 3: 3 }

	tasks.sort((a, b) => {
		if (field === 'priority') {
			const pA = priorityOrder[a.getAttribute('data-priority')] ?? 2
			const pB = priorityOrder[b.getAttribute('data-priority')] ?? 2
			return currentDir === 'asc' ? pA - pB : pB - pA
		} else if (field === 'status') {
			const sA = a.getAttribute('data-status') || ''
			const sB = b.getAttribute('data-status') || ''
			return currentDir === 'asc' ? sA.localeCompare(sB) : sB.localeCompare(sA)
		} else {
			const tA = (a.getAttribute('data-title') || '').toLowerCase()
			const tB = (b.getAttribute('data-title') || '').toLowerCase()
			return currentDir === 'asc' ? tA.localeCompare(tB) : tB.localeCompare(tA)
		}
	})

	tasks.forEach(t => taskList.appendChild(t))
}

function toggleTour(projectIdx) {
	const container = document.getElementById('tour-container-' + projectIdx)
	if (!container) return
	container.style.display = container.style.display === 'none' ? 'block' : 'none'
}

function isolateProject(event, query) {
	event.stopPropagation()
	const searchInput = document.getElementById('projectSearch')
	if (!searchInput) return
	searchInput.value = query
	searchInput.dispatchEvent(new Event('input'))
}

function selectProjectRelease(event, projectIdx, releaseIdx) {
	event.stopPropagation()
	const row = document.getElementById('row-' + projectIdx)
	if (!row) return

	let allReleases = []
	try {
		allReleases = JSON.parse(row.getAttribute('data-all-releases') || '[]')
	} catch {}

	const rel = allReleases[releaseIdx]
	if (!rel) return

	const historyList = document.getElementById('history-list-' + projectIdx)
	if (historyList) {
		historyList.querySelectorAll('.history-badge').forEach(b => b.classList.remove('active-release'))
	}
	const clickedBadge = document.getElementById('rel-badge-' + projectIdx + '-' + releaseIdx)
	if (clickedBadge) {
		clickedBadge.classList.add('active-release')
	}

	const versionBadge = document.getElementById('version-badge-' + projectIdx)
	if (versionBadge) versionBadge.textContent = 'v' + rel.version

	const statusBadge = document.getElementById('status-badge-' + projectIdx)
	if (statusBadge) {
		const statusClass = rel.status === 'wip' ? 'status-wip' : rel.status === 'closed' ? 'status-closed' : 'status-unknown'
		statusBadge.className = 'badge ' + statusClass
		statusBadge.textContent = (rel.status || 'unknown').toUpperCase()
	}

	const sourceDocElem = document.getElementById('source-doc-' + projectIdx)
	if (sourceDocElem) {
		sourceDocElem.textContent = rel.sourceDoc || (rel.path + '/release.md')
	}

	const tourVersion = document.getElementById('tour-version-' + projectIdx)
	if (tourVersion) tourVersion.textContent = 'v' + rel.version
	const tourLinks = document.getElementById('tour-links-' + projectIdx)
	if (tourLinks) {
		tourLinks.innerHTML = '<a class="tour-link" href="file:///' + rel.path + '/release.md" target="_blank">📄 Паспорт релізу (' + (rel.sourceDoc || 'release.md') + ')</a>' +
			'<a class="tour-link" href="file:///' + rel.path + '/task.spec.js" target="_blank">🧪 Контрактні тести (task.spec.js)</a>' +
			'<a class="tour-link" href="file:///' + rel.path + '/user.md" target="_blank">📊 Журнал метрик (user.md)</a>'
	}

	const taskList = document.getElementById('tasks-list-' + projectIdx)
	const tasksTitle = document.getElementById('tasks-title-' + projectIdx)
	const filterGroup = document.getElementById('filter-group-' + projectIdx)
	const tasks = rel.tasks || []
	const doneCount = tasks.filter(t => t.status === 'Done').length
	const totalCount = tasks.length
	const todoCount = totalCount - doneCount
	const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

	const progressPercentElem = document.getElementById('progress-percent-' + projectIdx)
	const progressBarFill = document.getElementById('progress-bar-' + projectIdx)
	if (progressPercentElem) progressPercentElem.textContent = progressPercent + '%'
	if (progressBarFill) progressBarFill.style.width = progressPercent + '%'

	if (tasksTitle) {
		tasksTitle.textContent = 'Завдання спринту (' + doneCount + '/' + totalCount + ') [v' + rel.version + ']'
	}

	if (filterGroup) {
		filterGroup.innerHTML = '<button type="button" class="btn-task-filter active" onclick="filterTasks(' + projectIdx + ', &quot;all&quot;)">Всі (' + totalCount + ')</button>' +
			'<button type="button" class="btn-task-filter" onclick="filterTasks(' + projectIdx + ', &quot;todo&quot;)">Невиконані (' + todoCount + ')</button>' +
			'<button type="button" class="btn-task-filter" onclick="filterTasks(' + projectIdx + ', &quot;done&quot;)">Виконані (' + doneCount + ')</button>'
	}

	if (taskList) {
		if (tasks.length === 0) {
			taskList.innerHTML = '<p class="no-tasks-hint">Немає виокремлених завдань у релізі v' + rel.version + '</p>'
		} else {
			taskList.innerHTML = tasks.map((t, tIdx) => {
				const isDone = t.status === 'Done'
				const priority = String(t.priority ?? 'medium').toLowerCase()
				const slug = t.slug || ('task-' + tIdx)
				return '<li class="task-item ' + (isDone ? 'task-done' : 'task-todo') + '" data-status="' + (isDone ? 'done' : 'todo') + '" data-priority="' + priority + '" data-title="' + t.content.replace(/"/g, '&quot;') + '" data-slug="' + slug + '" id="task-' + projectIdx + '-' + tIdx + '">' +
					'<span class="task-icon">' + (isDone ? '✓' : '○') + '</span>' +
					'<span class="task-priority-badge priority-' + priority + '" title="Клікніть для зміни пріоритету завдання" onclick="cycleTaskPriority(event, ' + JSON.stringify(row.getAttribute('data-project') || '') + ', ' + JSON.stringify(slug) + ', &quot;task-' + projectIdx + '-' + tIdx + '&quot;)">' +
						priority.toUpperCase() +
					'</span>' +
					'<span class="task-text">' + t.content.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>' +
				'</li>'
			}).join('')
		}
	}
}

// Local Database / IndexedDB Storage Layer
const DB_STORE_NAME = 'nan0_settings'
let idbPromise = null

function getDb() {
	if (idbPromise) return idbPromise
	idbPromise = new Promise((resolve) => {
		try {
			const req = indexedDB.open('nan0web_release_db', 1)
			req.onupgradeneeded = (e) => {
				const db = e.target.result
				if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
					db.createObjectStore(DB_STORE_NAME)
				}
			}
			req.onsuccess = (e) => resolve(e.target.result)
			req.onerror = () => resolve(null)
		} catch {
			resolve(null)
		}
	})
	return idbPromise
}

async function loadSetting(key, fallback = null) {
	const db = await getDb()
	if (!db) {
		try {
			const item = localStorage.getItem(key)
			return item ? JSON.parse(item) : fallback
		} catch {
			return fallback
		}
	}
	return new Promise((resolve) => {
		try {
			const tx = db.transaction(DB_STORE_NAME, 'readonly')
			const store = tx.objectStore(DB_STORE_NAME)
			const req = store.get(key)
			req.onsuccess = () => resolve(req.result !== undefined ? req.result : fallback)
			req.onerror = () => resolve(fallback)
		} catch {
			resolve(fallback)
		}
	})
}

async function saveSetting(key, value) {
	const db = await getDb()
	if (!db) {
		try {
			localStorage.setItem(key, JSON.stringify(value))
		} catch {}
		return
	}
	return new Promise((resolve) => {
		try {
			const tx = db.transaction(DB_STORE_NAME, 'readwrite')
			const store = tx.objectStore(DB_STORE_NAME)
			const req = store.put(value, key)
			req.onsuccess = () => resolve(true)
			req.onerror = () => resolve(false)
		} catch {
			resolve(false)
		}
	})
}

async function cycleProjectPriority(event, projectName, projectIdx) {
	event.stopPropagation()
	const row = document.getElementById('row-' + projectIdx)
	const badge = document.getElementById('prio-badge-' + projectIdx)
	if (!row || !badge) return

	const currentRaw = String(row.getAttribute('data-priority') || '1').toUpperCase()
	// Cycle: 0 (P0) -> 1 (P1) -> 2 (P2) -> 3 (P3) -> 0
	let nextNum = 0
	if (currentRaw === '0' || currentRaw === 'P0') nextNum = 1
	else if (currentRaw === '1' || currentRaw === 'P1') nextNum = 2
	else if (currentRaw === '2' || currentRaw === 'P2') nextNum = 3
	else nextNum = 0

	const nextLabel = 'P' + nextNum
	row.setAttribute('data-priority', String(nextNum))
	badge.textContent = nextLabel
	badge.className = 'proj-priority-badge priority-' + nextNum

	const allPrios = (await loadSetting('~/settings/project_priorities', {})) || {}
	allPrios[projectName] = nextNum
	await saveSetting('~/settings/project_priorities', allPrios)
}

async function cycleTaskPriority(event, projectName, taskSlug, taskId) {
	event.stopPropagation()
	const taskElem = document.getElementById(taskId)
	if (!taskElem) return

	const badge = taskElem.querySelector('.task-priority-badge')
	const currentPrio = (taskElem.getAttribute('data-priority') || 'medium').toLowerCase()
	let nextPrio = 'high'
	if (currentPrio === 'high') nextPrio = 'medium'
	else if (currentPrio === 'medium' || currentPrio === 'med') nextPrio = 'low'
	else if (currentPrio === 'low') nextPrio = 'high'

	taskElem.setAttribute('data-priority', nextPrio)
	if (badge) {
		badge.textContent = nextPrio.toUpperCase()
		badge.className = 'task-priority-badge priority-' + nextPrio
	}

	const allTaskPrios = (await loadSetting('~/settings/task_priorities', {})) || {}
	allTaskPrios[projectName + '::' + taskSlug] = nextPrio
	await saveSetting('~/settings/task_priorities', allTaskPrios)
}

// Bookmarks Registry
const defaultBookmarks = [
	{ label: '⭐ Всі', query: '' },
	{ label: '🔥 P0 Фокус', query: 'p0' },
	{ label: '🏦 Industrialbank', query: 'industrialbank' },
	{ label: '📦 Пакети', query: 'packages/' },
	{ label: '🚀 Внутрішні Apps', query: 'apps/' },
	{ label: '🌐 3rdparty', query: '3rdparty' },
	{ label: '📂 Зовнішні (~/apps)', query: '../apps' },
]

let customBookmarksCache = null

async function getCustomBookmarks() {
	if (customBookmarksCache !== null) return customBookmarksCache
	customBookmarksCache = await loadSetting('~/settings/bookmarks', [])
	return customBookmarksCache || []
}

async function setCustomBookmarks(list) {
	customBookmarksCache = list
	await saveSetting('~/settings/bookmarks', list)
}

async function renderBookmarks(activeQuery = '') {
	const container = document.getElementById('bookmarksChips')
	if (!container) return
	container.innerHTML = ''

	const customs = await getCustomBookmarks()
	const all = [...defaultBookmarks, ...customs]

	all.forEach((b, bIdx) => {
		const isCustom = bIdx >= defaultBookmarks.length
		const chip = document.createElement('span')
		chip.className = 'bookmark-chip' + (activeQuery.toLowerCase() === b.query.toLowerCase() ? ' active' : '')
		
		const labelSpan = document.createElement('span')
		labelSpan.className = 'bookmark-label'
		labelSpan.textContent = b.label
		chip.appendChild(labelSpan)

		if (isCustom) {
			const removeBtn = document.createElement('span')
			removeBtn.className = 'bookmark-remove'
			removeBtn.innerHTML = '&times;'
			removeBtn.title = 'Видалити закладку'
			removeBtn.onclick = async (e) => {
				e.stopPropagation()
				const updated = customs.filter(c => c.query !== b.query)
				await setCustomBookmarks(updated)
				renderBookmarks(activeQuery)
			}
			chip.appendChild(removeBtn)
		}

		chip.onclick = () => {
			const searchInput = document.getElementById('projectSearch')
			if (!searchInput) return
			if (activeQuery.toLowerCase() === b.query.toLowerCase() && b.query !== '') {
				searchInput.value = ''
			} else {
				searchInput.value = b.query
			}
			searchInput.dispatchEvent(new Event('input'))
		}

		container.appendChild(chip)
	})
}

async function saveCurrentSearchBookmark() {
	const searchInput = document.getElementById('projectSearch')
	if (!searchInput) return
	const query = (searchInput.value || '').trim()
	if (!query) return

	const customs = await getCustomBookmarks()
	if (customs.some(c => c.query.toLowerCase() === query.toLowerCase())) return

	customs.push({ label: '🔖 ' + query, query })
	await setCustomBookmarks(customs)
	renderBookmarks(query)
	searchInput.focus()
}

async function initDashboard() {
	const searchInput = document.getElementById('projectSearch')
	const btnSaveBookmark = document.getElementById('btnSaveBookmark')
	const list = document.getElementById('projectsList')
	const rows = Array.from(list ? list.querySelectorAll('.project-row') : [])
	const stats = Array.from(document.querySelectorAll('.summary-stat'))
	const tableHeaders = Array.from(document.querySelectorAll('.th-sortable'))

	// Restore project & task priorities from this.$db / IndexedDB
	try {
		const savedProjectPrios = await loadSetting('~/settings/project_priorities', {})
		const savedTaskPrios = await loadSetting('~/settings/task_priorities', {})

		rows.forEach((row, idx) => {
			const projectName = row.getAttribute('data-project')
			const savedPrio = savedProjectPrios[projectName]
			if (savedPrio !== undefined && savedPrio !== null) {
				const numPrio = String(savedPrio)
				row.setAttribute('data-priority', numPrio)
				const badge = document.getElementById('prio-badge-' + idx)
				if (badge) {
					badge.textContent = 'P' + numPrio
					badge.className = 'proj-priority-badge priority-' + numPrio
				}
			}

			// Restore task priorities
			const tasks = row.querySelectorAll('.task-item')
			tasks.forEach(task => {
				const slug = task.getAttribute('data-slug')
				const saved = savedTaskPrios[projectName + '::' + slug]
				if (saved && (saved === 'high' || saved === 'medium' || saved === 'low')) {
					task.setAttribute('data-priority', saved)
					const badge = task.querySelector('.task-priority-badge')
					if (badge) {
						badge.textContent = saved.toUpperCase()
						badge.className = 'task-priority-badge priority-' + saved
					}
				}
			})
		})
	} catch {}

	let currentFilter = 'all'
	let sortDirection = {}

	function applyFilters() {
		const query = (searchInput ? searchInput.value : '').trim().toLowerCase()

		if (btnSaveBookmark) {
			btnSaveBookmark.style.display = query.length >= 2 ? 'inline-block' : 'none'
		}

		renderBookmarks(query)

		rows.forEach(row => {
			const name = (row.getAttribute('data-project') || '').toLowerCase()
			const path = (row.getAttribute('data-path') || '').toLowerCase()
			const status = (row.getAttribute('data-status') || '').toLowerCase()
			const priorityNum = String(row.getAttribute('data-priority') || '').toLowerCase()
			const priorityLabel = 'p' + priorityNum

			const matchesSearch = !query ||
				name.includes(query) ||
				path.includes(query) ||
				priorityNum.includes(query) ||
				priorityLabel.includes(query)
			const matchesFilter = currentFilter === 'all' || status === currentFilter

			if (matchesSearch && matchesFilter) {
				row.style.display = 'block'
			} else {
				row.style.display = 'none'
			}
		})
	}

	function sortBy(field) {
		const isAsc = sortDirection[field] === 'asc'
		sortDirection[field] = isAsc ? 'desc' : 'asc'

		tableHeaders.forEach(th => {
			th.classList.remove('th-active')
			const arrow = th.querySelector('.sort-arrow')
			if (arrow) arrow.textContent = '⇅'
		})

		const activeTh = tableHeaders.find(th => th.getAttribute('data-sort') === field)
		if (activeTh) {
			activeTh.classList.add('th-active')
			const arrow = activeTh.querySelector('.sort-arrow')
			if (arrow) arrow.textContent = isAsc ? '▲' : '▼'
		}

		const priorityRank = { '0': 0, 'p0': 0, '1': 1, 'p1': 1, '2': 2, 'p2': 2, '3': 3, 'p3': 3 }

		rows.sort((a, b) => {
			let valA, valB
			if (field === 'priority') {
				const pA = priorityRank[String(a.getAttribute('data-priority') || '1').toLowerCase()] ?? 2
				const pB = priorityRank[String(b.getAttribute('data-priority') || '1').toLowerCase()] ?? 2
				return isAsc ? pA - pB : pB - pA
			} else if (field === 'project') {
				valA = (a.getAttribute('data-project') || '').toLowerCase()
				valB = (b.getAttribute('data-project') || '').toLowerCase()
				return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
			} else if (field === 'status') {
				valA = (a.getAttribute('data-status') || '').toLowerCase()
				valB = (b.getAttribute('data-status') || '').toLowerCase()
				return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
			} else if (field === 'progress') {
				valA = parseFloat(a.getAttribute('data-progress') || '0')
				valB = parseFloat(b.getAttribute('data-progress') || '0')
				return isAsc ? valA - valB : valB - valA
			} else {
				valA = parseFloat(a.getAttribute('data-' + field) || '0')
				valB = parseFloat(b.getAttribute('data-' + field) || '0')
				return isAsc ? valA - valB : valB - valA
			}
		})

		if (list) {
			rows.forEach(r => list.appendChild(r))
		}
	}

	if (searchInput) {
		searchInput.addEventListener('input', applyFilters)
	}

	tableHeaders.forEach(th => {
		th.addEventListener('click', () => {
			const sortField = th.getAttribute('data-sort')
			if (sortField) sortBy(sortField)
		})
	})

	stats.forEach(stat => {
		stat.addEventListener('click', () => {
			const action = stat.getAttribute('data-action')
			if (action === 'filter') {
				stats.forEach(s => s.classList.remove('active-filter'))
				stat.classList.add('active-filter')
				currentFilter = stat.getAttribute('data-filter') || 'all'
				applyFilters()
			} else if (action === 'sort') {
				const sortField = stat.getAttribute('data-sort')
				if (sortField) sortBy(sortField)
			}
		})
	})

	renderBookmarks('')
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initDashboard)
} else {
	initDashboard()
}
