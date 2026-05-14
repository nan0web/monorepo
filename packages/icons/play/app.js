import { CACHE, SETS } from './catalog.js'
import { toSvg } from '../src/index.js'

const BATCH_SIZE = 100
let filteredData = []
let displayedCount = 0
let currentQuery = ''
let activeSets = new Set(Object.keys(SETS))

const moduleCache = {} // e.g. { bs: { BsBank2: {...} } }

// DOM Elements
const grid = document.getElementById('grid')
const filtersContainer = document.getElementById('filters')
const searchInput = document.getElementById('search')
const statsEl = document.getElementById('stats')
const observerTarget = document.getElementById('observer-target')

// Modals
const overlay = document.getElementById('overlay')
const panel = document.getElementById('panel')
const closeBtn = document.getElementById('close-btn')

// Render Sidebar Filters
function renderFilters() {
	// Calculate counts per set
	const counts = {}
	for (const k of Object.keys(SETS)) counts[k] = 0
	for (const item of CACHE) {
		if (counts[item.set] !== undefined) counts[item.set]++
	}

	filtersContainer.innerHTML = Object.entries(SETS)
		.map(
			([key, meta]) => `
		<label class="filter-item">
			<input type="checkbox" value="${key}" checked>
			<span>${meta.name || key}</span>
			<span class="count-badge">${counts[key] || 0}</span>
		</label>
	`,
		)
		.join('')

	filtersContainer.querySelectorAll('input').forEach((checkbox) => {
		checkbox.addEventListener('change', () => {
			if (checkbox.checked) activeSets.add(checkbox.value)
			else activeSets.delete(checkbox.value)
			triggerSearch()
		})
	})
}

// Ensure module is loaded
async function ensureModule(setName) {
	if (!moduleCache[setName]) {
		moduleCache[setName] = await import(`../src/sets/${setName}.js`)
	}
	return moduleCache[setName]
}

// Render batch of cards
async function renderBatch() {
	if (displayedCount >= filteredData.length) return

	const batch = filteredData.slice(displayedCount, displayedCount + BATCH_SIZE)
	displayedCount += batch.length

	// Preload needed modules for this batch in parallel to avoid waterfalls
	const requiredSets = [...new Set(batch.map((i) => i.set))]
	await Promise.all(requiredSets.map(ensureModule))

	const fragment = document.createDocumentFragment()

	for (const item of batch) {
		const module = moduleCache[item.set]
		const iconData = module[item.id]

		const card = document.createElement('div')
		card.className = 'icon-card'
		card.dataset.id = item.id
		card.dataset.set = item.set

		// Generate SVG (size 28)
		const svgStr = toSvg(iconData, { size: 28 })

		card.innerHTML = `
			<span class="set-label">${item.set}</span>
			${svgStr}
			<span class="name">${item.id}</span>
		`

		card.addEventListener('click', () => openSidebar(item, iconData))
		fragment.appendChild(card)
	}

	grid.appendChild(fragment)
	updateStats()
}

// Core search logic
function triggerSearch() {
	const query = searchInput.value.toLowerCase().trim()

	filteredData = CACHE.filter((item) => {
		if (!activeSets.has(item.set)) return false
		if (!query) return true

		return (
			item.id.toLowerCase().includes(query) || item.set.includes(query) || item.tags.includes(query)
		)
	})

	// Reset grid
	grid.innerHTML = ''
	displayedCount = 0

	// Force to top
	document.getElementById('scroll-container').scrollTop = 0

	renderBatch()
}

const fmt = new Intl.NumberFormat('en-US')

function updateStats() {
	statsEl.textContent = `Showing ${fmt.format(displayedCount)} of ${fmt.format(filteredData.length)} icons`
}

// Sidebar logic
const snippets = { lit: '', react: '', cli: '' }

function openSidebar(item, iconData) {
	document.getElementById('dp-title').textContent = item.id
	document.getElementById('dp-preview').innerHTML = toSvg(iconData, { size: 64 })

	snippets.lit = `import { icon } from '@nan0web/icons/adapters/lit'\nimport { ${item.id} } from '@nan0web/icons/${item.set}'\n\nhtml\`\${icon(${item.id}, { size: 24 })}\``

	snippets.react = `import { Icon } from '@nan0web/icons/adapters/react'\nimport { ${item.id} } from '@nan0web/icons/${item.set}'\n\n<Icon icon={${item.id}} size={24} className="text-blue-500" />`

	snippets.cli = `import { iconChar } from '@nan0web/icons/adapters/cli'\nimport { ${item.id} } from '@nan0web/icons/${item.set}'\n\nconsole.log(iconChar(${item.id}) + ' ${item.id}')`

	document.getElementById('code-lit').textContent = snippets.lit
	document.getElementById('code-react').textContent = snippets.react
	document.getElementById('code-cli').textContent = snippets.cli

	overlay.classList.add('active')
	panel.classList.add('active')
}

function closeSidebar() {
	overlay.classList.remove('active')
	panel.classList.remove('active')
}

window.copySnippet = function (type) {
	navigator.clipboard.writeText(snippets[type]).then(() => {
		const toast = document.getElementById('toast')
		toast.classList.add('show')
		setTimeout(() => toast.classList.remove('show'), 2000)
	})
}

// Events
searchInput.addEventListener('input', () => {
	// Simple debounce
	clearTimeout(window.searchTimeout)
	window.searchTimeout = setTimeout(triggerSearch, 150)
})

closeBtn.addEventListener('click', closeSidebar)
overlay.addEventListener('click', closeSidebar)

// Infinite scroll
const observer = new IntersectionObserver(
	(entries) => {
		if (entries[0].isIntersecting && displayedCount > 0) {
			renderBatch()
		}
	},
	{ rootMargin: '200px' },
)
observer.observe(observerTarget)

// Init
renderFilters()
triggerSearch()
