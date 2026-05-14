import '../packages/core/index.js'
import jsyaml from 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs'

async function init() {
	try {
		const response = await fetch('/data/play/index.yaml')
		if (!response.ok) throw new Error('Failed to load Sandbox Data Layer')
		const text = await response.text()
		const sandboxData = jsyaml.load(text)

		// Fill headers
		document.title = sandboxData.title + ' Playground'
		const titleEl = document.getElementById('page-title')
		const subTitleEl = document.getElementById('page-subtitle')
		if (titleEl) titleEl.textContent = sandboxData.title
		if (subTitleEl) subTitleEl.innerHTML = sandboxData.subtitle

		// Build Sidebar
		const sidebarRoot = document.getElementById('sidebar-root')
		if (sidebarRoot) {
			let sidebarHtml = `
				<div class="p-4 border-bottom position-sticky top-0 bg-body z-1">
					<h5 class="fw-bold mb-0">Каталог OLMUI</h5>
					<p class="small text-muted mb-0 mt-1">@nan0web/ui-lit</p>
				</div>
				<div class="accordion accordion-flush" id="sidebarAccordion">
			`

			sandboxData.sections.forEach((sec, idx) => {
				const isOpen = idx === 0 || sec.title.includes('Phase 3') // Open first and Phase 3 by default
				sidebarHtml += `
					<div class="accordion-item border-0">
						<h2 class="accordion-header">
							<button class="accordion-button ${isOpen ? '' : 'collapsed'} fw-bold text-muted text-uppercase small py-3" style="font-size: 0.75rem;" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${idx}">
								${sec.title}
							</button>
						</h2>
						<div id="collapse-${idx}" class="accordion-collapse collapse ${isOpen ? 'show' : ''}" data-bs-parent="#sidebarAccordion">
							<div class="accordion-body p-0 pb-3">
								<ul class="nav flex-column gap-1 px-3">
				`
				sec.items.forEach((item) => {
					sidebarHtml += `<li class="nav-item"><a class="nav-link nav-link-spy text-body fw-medium rounded p-2" style="font-size: 0.9rem;" href="#${item.id}" data-id="${item.id}">${item.title}</a></li>`
				})
				sidebarHtml += `</ul></div></div></div>`
			})
			sidebarHtml += `</div>`
			sidebarRoot.innerHTML = sidebarHtml

			// Scroll spy logic
			const handleScroll = () => {
				const links = document.querySelectorAll('.nav-link-spy')
				let currentId = null
				for (const link of links) {
					const id = link.getAttribute('data-id')
					const el = document.getElementById(id)
					if (el) {
						const rect = el.getBoundingClientRect()
						if (rect.top <= 200) {
							currentId = id
						}
					}
				}
				links.forEach((l) => {
					if (l.getAttribute('data-id') === currentId) {
						l.classList.add('bg-body-secondary', 'text-primary')
					} else {
						l.classList.remove('bg-body-secondary', 'text-primary')
					}
				})
			}
			window.addEventListener('scroll', handleScroll)
			window.addEventListener('hashchange', handleScroll)
			setTimeout(handleScroll, 100)
		}

		// Build Content Area
		const contentRoot = document.getElementById('content-root')
		if (contentRoot) {
			let contentHtml = ''
			sandboxData.sections.forEach((sec) => {
				sec.items.forEach((item) => {
					contentHtml += `
						<div id="${item.id}" class="mb-5 pb-5 border-bottom">
							<h2 class="mb-2 text-primary">📦 ${item.title}</h2>
							<p class="text-muted mb-4">${item.desc || ''}</p>
					`
					if (item.schema) {
						contentHtml += `<div class="mb-4"><olmui-inspector component-id="${item.id}" id="inspector-${item.id}"></olmui-inspector></div>`
					}
					if (item.examples) {
						item.examples.forEach((ex) => {
							contentHtml += `<e2e-example label="${escapeHtml(ex.label || '')}">`
							if (ex.previewHtml) {
								contentHtml += ex.previewHtml
							}
							if (ex.codeHtml) {
								contentHtml += `<template slot="html-code">${ex.codeHtml}</template>`
							}
							if (ex.codeYaml) {
								contentHtml += `<template slot="yaml-code">${ex.codeYaml}</template>`
							}
							contentHtml += `</e2e-example>`
						})
					}
					contentHtml += `</div>`
				})
			})
			contentRoot.innerHTML = contentHtml

			// Programmatically inject schema into inspectors (avoids HTML attribute escaping issues)
			sandboxData.sections.forEach((sec) => {
				sec.items.forEach((item) => {
					if (item.schema) {
						const inspector = document.getElementById(`inspector-${item.id}`)
						if (inspector) {
							inspector.setAttribute('schema', JSON.stringify(item.schema))
						}
					}
				})
			})
		}

		bindInteractivity()
	} catch (e) {
		console.error(e)
	} finally {
		document.body.setAttribute('data-e2e-ready', 'true')
	}
}

function escapeHtml(str) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

function bindInteractivity() {
	let localeState = 'uk'
	const localeBtn = document.getElementById('locale-btn')
	if (localeBtn) {
		localeBtn.addEventListener('click', () => {
			localeState = localeState === 'uk' ? 'en' : 'uk'
			localeBtn.textContent = localeState === 'uk' ? '🇺🇦 UK → EN' : '🇬🇧 EN → UK'
		})
	}

	// === Nav ===
	const nav = document.getElementById('e2e-nav')
	if (nav) {
		nav.brand = { title: 'Bank Shell', url: '#' }
		nav.items = [
			{ label: 'Головна', url: '#' },
			{ label: 'Про нас', url: '#' },
			{ label: 'Послуги', children: [{ label: 'Депозити' }, { label: 'Кредити' }] },
		]
	}
	const navMin = document.getElementById('e2e-nav-min')
	if (navMin) {
		navMin.brand = { title: 'My App' }
		navMin.items = [{ label: 'Головна', url: '#' }]
	}

	// === Sidebar ===
	const sidebar = document.getElementById('e2e-sidebar')
	if (sidebar) {
		sidebar.title = 'Налаштування'
		sidebar.items = [
			{ label: 'Профіль', url: '#profile', active: true },
			{ label: 'Безпека', url: '#security' },
			{ label: 'Сповіщення', children: [{ label: 'Email' }] },
		]
	}
	const sidebarSimple = document.getElementById('e2e-sidebar-simple')
	if (sidebarSimple) {
		sidebarSimple.title = 'Меню'
		sidebarSimple.items = [{ label: 'Головна', active: true }, { label: 'Контакти' }]
	}

	// === Markdown ===
	const md = document.getElementById('e2e-markdown')
	if (md) {
		md.content = `
			<h1>Title</h1>
			<h2>Subtitle</h2>
			<p>Here is a list of</p>
			<ul><li>apple</li><li>banana</li></ul>
		`
	}
	const mdCode = document.getElementById('e2e-markdown-code')
	if (mdCode) {
		mdCode.content = `
                  <p><strong>Bold text</strong> and <a href="#">link</a></p>
                  <pre><code>const hello = 'world'</code></pre>
                  <blockquote><p>This is a quote</p></blockquote>
		`
	}

	// === Code Block ===
	const cb = document.getElementById('e2e-code-block')
	if (cb) {
		cb.code = `import { UIAlert } from '@nan0web/ui-lit/core'\n\nconst alert = document.createElement('ui-alert')\nalert.variant = 'success'\nalert.title = 'Done!'`
	}
	const cbYaml = document.getElementById('e2e-code-block-yaml')
	if (cbYaml) {
		cbYaml.code = 'title: My App\nversion: 1.0.0\nmodules:\n  - auth\n  - test'
	}

	// === Table ===
	const tb = document.getElementById('e2e-table')
	if (tb) {
		tb.data = [
			{ component: 'Alert', status: '✅', variants: 'info, success, warning, error' },
			{ component: 'Badge', status: '✅', variants: 'neutral, info, success, warning, error' },
			{ component: 'Input', status: '✅', variants: 'text, email, password' },
			{
				component: 'Button',
				status: '✅',
				variants: 'primary, secondary, danger, ghost, outline',
			},
			{ component: 'Modal', status: '✅', variants: '-' },
			{ component: 'Tree', status: '✅', variants: '-' },
		]
	}
	const tbSimple = document.getElementById('e2e-table-simple')
	if (tbSimple) {
		tbSimple.data = [
			{ name: 'Київ', population: '2.9M' },
			{ name: 'Харків', population: '1.4M' },
			{ name: 'Одеса', population: '1.0M' },
		]
	}

	// === Theme Toggle ===
	const themeToggles = document.querySelectorAll('ui-theme-toggle')
	const themeValue = document.getElementById('e2e-theme-value')
	const updateThemeStatus = () => {
		const th = document.documentElement.getAttribute('data-theme') || 'light'
		if (themeValue) themeValue.textContent = th
		document.documentElement.setAttribute('data-bs-theme', th)
	}
	updateThemeStatus()
	themeToggles.forEach((t) => t.addEventListener('theme-change', updateThemeStatus))

	// === Lang Select ===
	const langSelects = document.querySelectorAll('ui-lang-select')
	const localeValue = document.getElementById('e2e-locale-value')
	const updateLocaleStatus = (e) => {
		const loc = e?.target?.locale || 'uk'
		if (localeValue) localeValue.textContent = loc
		langSelects.forEach((t) => {
			if (t !== e?.target) t.locale = loc
		}) // Sync others
	}
	updateLocaleStatus()
	langSelects.forEach((t) => t.addEventListener('locale-change', updateLocaleStatus))

	// === Select ===
	const sel = document.getElementById('e2e-select')
	if (sel) {
		sel.options = [
			{ value: 'dep', label: 'Депозити' },
			{ value: 'crd', label: 'Кредити' },
			{ value: 'ins', label: 'Страхування' },
			{ value: 'pay', label: 'Платежі' },
		]
	}
	const selPresel = document.getElementById('e2e-select-presel')
	if (selPresel) {
		selPresel.options = [
			{ value: 'uah', label: 'UAH — Гривня' },
			{ value: 'usd', label: 'USD — Долар' },
			{ value: 'eur', label: 'EUR — Євро' },
		]
	}

	// === Confirm Modal trigger ===
	const confirmModal = document.getElementById('e2e-confirm-modal')
	const coBtn = document.getElementById('e2e-confirm-open')
	if (confirmModal && coBtn) {
		coBtn.addEventListener('btn-click', () => {
			confirmModal.open = true
		})
	}

	// === Modal trigger ===
	const modal = document.getElementById('e2e-modal')
	const modalBtn = document.getElementById('e2e-modal-open')
	if (modal && modalBtn) {
		modalBtn.addEventListener('btn-click', () => {
			modal.open = true
		})
	}

	// === Accordion ===
	const acc = document.getElementById('e2e-accordion')
	if (acc) {
		acc.items = [
			{
				title: 'Як відкрити рахунок?',
				content:
					'Ви можете відкрити рахунок онлайн за 5 хвилин через мобільний додаток або на сайті банку.',
			},
			{
				title: 'Які документи потрібні?',
				content: 'Для відкриття рахунку вам знадобиться паспорт та ідентифікаційний код (ІПН).',
			},
			{
				title: 'Скільки коштує обслуговування?',
				content: 'Базове обслуговування — безкоштовно. Преміум пакет — 99 грн/міс.',
				open: true,
			},
		]
	}
	const accClosed = document.getElementById('e2e-accordion-closed')
	if (accClosed) {
		accClosed.items = [
			{ title: 'Перший розділ', content: 'Зміст першого.' },
			{ title: 'Другий розділ', content: 'Зміст другого.' },
		]
	}

	// === Autocomplete ===
	const ac = document.getElementById('e2e-autocomplete')
	if (ac) {
		ac.options = [
			'Київ',
			'Харків',
			'Одеса',
			'Дніпро',
			'Львів',
			'Запоріжжя',
			'Кривий Ріг',
			'Миколаїв',
			'Маріуполь',
			'Вінниця',
			'Херсон',
			'Полтава',
			'Чернігів',
			'Черкаси',
			'Суми',
			'Житомир',
		]
	}
	const acHint = document.getElementById('e2e-autocomplete-hint')
	if (acHint) {
		acHint.options = ['Україна', 'Польща', 'Німеччина', 'Ісландія', 'Норвегія']
	}

	// === Sortable ===
	const sort = document.getElementById('e2e-sortable')
	if (sort) {
		sort.items = [
			'Написати unit тести',
			'Зробити code review',
			'Оновити документацію',
			'Deploy на staging',
			'Протестувати на prod',
		]
	}
	const sortNum = document.getElementById('e2e-sortable-num')
	if (sortNum) {
		sortNum.items = ['Перший крок', 'Другий крок', 'Третій крок']
	}

	// === Tree ===
	const tree = document.getElementById('e2e-tree')
	if (tree) {
		tree.items = [
			{
				label: '📁 src/',
				expanded: true,
				children: [
					{ label: '📄 index.js', active: true },
					{
						label: '📁 components/',
						children: [
							{ label: '📄 Alert.js' },
							{ label: '📄 Badge.js' },
							{ label: '📄 Button.js' },
							{ label: '📄 Modal.js' },
						],
					},
					{
						label: '📁 test/',
						children: [{ label: '📄 alert.test.js' }, { label: '📄 badge.test.js' }],
					},
				],
			},
			{ label: '📄 package.json' },
			{ label: '📄 README.md' },
		]
	}
	const treeSimple = document.getElementById('e2e-tree-simple')
	if (treeSimple) {
		treeSimple.items = [
			{ label: '📁 docs/', children: [{ label: '📄 README.md' }, { label: '📄 CHANGELOG.md' }] },
			{ label: '📄 LICENSE' },
		]
	}

	// === Form ===
	const formRegister = document.getElementById('e2e-form-register')
	if (formRegister) {
		formRegister.fields = [
			{
				name: 'email',
				type: 'input',
				label: 'Email',
				inputType: 'email',
				required: true,
				placeholder: 'your@email.com',
			},
			{ name: 'password', type: 'input', label: 'Пароль', inputType: 'password', required: true },
			{
				name: 'city',
				type: 'select',
				label: 'Місто',
				options: [
					{ value: 'kyiv', label: 'Київ' },
					{ value: 'lviv', label: 'Львів' },
					{ value: 'odesa', label: 'Одеса' },
				],
			},
			{ name: 'agree', type: 'toggle', label: 'Погоджуюсь з умовами' },
		]
	}
	const formSettings = document.getElementById('e2e-form-settings')
	if (formSettings) {
		formSettings.fields = [
			{ name: 'name', type: 'input', label: "Ім'я", required: true },
			{ name: 'volume', type: 'slider', label: 'Гучність', value: 75, min: 0, max: 100 },
			{
				name: 'lang',
				type: 'autocomplete',
				label: 'Мова',
				options: ['Українська', 'English', 'Deutsch'],
			},
			{ name: 'notifications', type: 'toggle', label: 'Сповіщення', value: true },
		]
	}
}

init()
