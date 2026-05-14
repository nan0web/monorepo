import { WebCommentAdapter } from '../src/index.js'
import '../src/ui/comment.css' // Let Vite handle and inject CSS
import demoTextUK from '../data/uk/demo.yaml?raw'
import demoTextEN from '../data/en/demo.yaml?raw'
import tTextUK from '../data/uk/_/t.yaml?raw'
import tTextEN from '../data/en/_/t.yaml?raw'

// Simple mock IndexedDB for the Sandbox Demo
class DemoDB {
	constructor() {
		this.key = 'nan0web-comment-demo-db'
	}

	async save(comment) {
		const all = await this.loadAll()
		all.push(comment)
		localStorage.setItem(this.key, JSON.stringify(all))
	}

	async loadAll() {
		return JSON.parse(localStorage.getItem(this.key) || '[]')
	}

	async remove(id) {
		const all = await this.loadAll()
		localStorage.setItem(this.key, JSON.stringify(all.filter((c, i) => i !== id)))
	}

	async clear() {
		localStorage.removeItem(this.key)
	}
}

// ─── Locale-First SPA Routing ───
const SUPPORTED_LOCALES = ['uk', 'en']
const DEFAULT_LOCALE = 'uk'

/** Detect locale from URL path: /uk/ → 'uk', /en/ → 'en' */
function detectLocale() {
	const seg = location.pathname.split('/').filter(Boolean)[0]
	return SUPPORTED_LOCALES.includes(seg) ? seg : DEFAULT_LOCALE
}

async function initSandbox() {
	const db = new DemoDB()
	const yaml = window.jsyaml

	try {
		const demos = {
			uk: yaml.load(demoTextUK),
			en: yaml.load(demoTextEN),
		}

		const dicts = {
			uk: yaml.load(tTextUK),
			en: yaml.load(tTextEN),
		}

		let currentLang = detectLocale()

		const adapter = new WebCommentAdapter({
			db,
			t: (key) => dicts[currentLang][key] || key,
		})

		const setLocale = (lang, pushState = true) => {
			currentLang = lang
			document.documentElement.lang = lang
			if (pushState) {
				history.pushState({ locale: lang }, '', `/${lang}/`)
			}
			renderPresentation(demos[currentLang], adapter, db, () => {
				const next = currentLang === 'uk' ? 'en' : 'uk'
				setLocale(next)
			}, currentLang)
		}

		// Handle browser back/forward
		window.addEventListener('popstate', (e) => {
			const lang = e.state?.locale || detectLocale()
			setLocale(lang, false)
		})

		// Initial render — replace current state so popstate works
		history.replaceState({ locale: currentLang }, '', `/${currentLang}/`)
		setLocale(currentLang, false)
	} catch (err) {
		document.getElementById('presentation').innerHTML = `<div style="color:red">Failed to load sandbox: ${err.message}</div>`
		console.error(err)
	}
}

function renderPresentation(data, adapter, db, switchLang, currentLang) {
	const root = document.getElementById('presentation')

	let html = `
		<div class="hero">
			<h1>${data.title}</h1>
			<h2>${data.subtitle}</h2>
			<p>${data.description}</p>
		</div>

		<div class="features">
	`

	for (const feature of data.features) {
		html += `
			<div class="feature-card" id="feature-${feature.id}">
				<div class="icon">${feature.icon}</div>
				<h3>${feature.title}</h3>
				<p>${feature.description}</p>
			</div>
		`
	}

	html += `
		</div>
		<div class="actions">
			<button class="demo-btn" id="btn-activate">${data.actions.toggle_demo}</button>
			<button class="demo-btn secondary" id="btn-list">${data.actions.reset_demo}</button>
		</div>
		<footer>${data.footer}</footer>
	`

	root.innerHTML = html

	// Clean up previous buttons before remounting
	document.querySelectorAll('.theme-toggle, .lang-toggle').forEach((el) => el.remove())

	// Theme toggle button (fixed top-right)
	const themeBtn = document.createElement('button')
	themeBtn.className = 'theme-toggle'
	themeBtn.textContent = document.documentElement.dataset.bsTheme === 'dark' ? '☀️' : '🌙'
	themeBtn.addEventListener('click', () => {
		const isDark = document.documentElement.dataset.bsTheme === 'dark'
		document.documentElement.dataset.bsTheme = isDark ? 'light' : 'dark'
		themeBtn.textContent = isDark ? '🌙' : '☀️'
	})
	document.body.append(themeBtn)

	// Language toggle button (fixed top-right beside Theme)
	const langBtn = document.createElement('button')
	langBtn.className = 'lang-toggle'
	langBtn.style.cssText = 'position:fixed;top:1rem;right:4rem;background:transparent;border:none;font-size:1.5rem;cursor:pointer;z-index:10000'
	langBtn.textContent = currentLang === 'uk' ? '🇬🇧' : '🇺🇦'
	langBtn.title = currentLang === 'uk' ? 'Switch to English' : 'Перемкнути на українську'
	langBtn.addEventListener('click', switchLang)
	document.body.append(langBtn)

	// Button: Activate Commentator
	let running = false
	const activate = async () => {
		if (running) return
		running = true
		try {
			const result = await adapter.start()
			console.log('Commentator result:', result)
		} finally {
			running = false
		}
	}

	document.getElementById('btn-activate').addEventListener('click', activate)

	// Button: View Comments list
	document.getElementById('btn-list').addEventListener('click', () => {
		adapter.showCommentList()
	})

	// Hotkey: Alt/Option to activate
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Alt' && !running) {
			e.preventDefault()
			activate()
		}
	})
}

// Boot
initSandbox()

