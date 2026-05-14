import React, { useState, useEffect } from 'react'
import { Element as Renderer, Blocks } from '../src/index.jsx'
import Header from '../src/components/organisms/Header/Header.jsx'
import { HeaderStyles } from '../src/components/organisms/Header/HeaderStyles.js'
import Autocomplete from '../src/components/atoms/Autocomplete.jsx'
import TreeView from '../src/components/atoms/TreeView.jsx'
import Button from '../src/components/atoms/Button.jsx'
import Typography from '../src/components/atoms/Typography.jsx'
import { OlmuiInspector } from './components/OlmuiInspector.jsx'
import yaml from 'js-yaml'

function Example({ label, children, jsxCode, yamlCode }) {
	const formattedYaml = yamlCode
		? yaml.dump(yamlCode, { indent: 2, noRefs: true, flowLevel: -1 })
		: null

	return (
		<div className="mb-4">
			{label && <h6 className="text-muted text-uppercase small fw-semibold mb-2">{label}</h6>}
			<div className="card border-0 shadow-sm mb-3">
				<div className="card-body example-preview py-4">{children}</div>
			</div>

			<div className="row g-2">
				{jsxCode && (
					<div className="col-12 col-xl-6">
						<div className="card border-0 shadow-sm h-100">
							<div
								className="card-header bg-primary text-white py-2 px-3 fw-bold"
								style={{ fontSize: '0.8rem' }}
							>
								JSX
							</div>
							<div
								className="card-body bg-dark p-3"
								style={{ borderBottomLeftRadius: '0.375rem', borderBottomRightRadius: '0.375rem' }}
							>
								<pre
									className="mb-0 text-white"
									style={{ fontSize: '0.8rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}
								>
									{jsxCode}
								</pre>
							</div>
						</div>
					</div>
				)}
				{yamlCode && (
					<div className="col-12 col-xl-6">
						<div className="card border-0 shadow-sm h-100">
							<div
								className="card-header bg-success text-white py-2 px-3 fw-bold"
								style={{ fontSize: '0.8rem' }}
							>
								Meta Data (YAML)
							</div>
							<div
								className="card-body bg-dark p-3"
								style={{ borderBottomLeftRadius: '0.375rem', borderBottomRightRadius: '0.375rem' }}
							>
								<pre
									className="mb-0 text-white"
									style={{ fontSize: '0.8rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}
								>
									{formattedYaml}
								</pre>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

function BlockSection({ id, title, description, children }) {
	const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
	const isolate = params?.get('isolate')

	if (isolate && isolate !== id) return null

	return (
		<div id={id} className="mb-5 pb-5 border-bottom">
			<div className="d-flex align-items-center mb-2 gap-3">
				<h2 className="mb-0 text-primary">📦 {title}</h2>
				<a
					href={'?isolate=' + id}
					target="_blank"
					className="btn btn-sm btn-outline-secondary"
					title="Відкрити ізольовано в новому вікні"
				>
					🔗
				</a>
			</div>
			{description && <p className="text-muted mb-4">{description}</p>}
			{children}
		</div>
	)
}

export default function Playground({ db }) {
	const [locale, setLocale] = useState('uk')
	const [showSidebar, setShowSidebar] = useState(false)
	const [sidebarVisible, setSidebarVisible] = useState(() => {
		if (typeof window !== 'undefined') {
			return !new URLSearchParams(window.location.search).get('isolate')
		}
		return true
	})
	const [activeBlock, setActiveBlock] = useState('')

	useEffect(() => {
		const handleHashChange = () => setActiveBlock(window.location.hash)
		window.addEventListener('hashchange', handleHashChange)
		handleHashChange() // Initial check

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveBlock('#' + entry.target.id)
						if (window.history.replaceState) {
							window.history.replaceState(null, null, '#' + entry.target.id)
						}
					}
				}
			},
			{ rootMargin: '-10% 0px -80% 0px', threshold: 0 },
		)

		const blockEls = document.querySelectorAll('[id^="block-"]')
		blockEls.forEach((el) => observer.observe(el))

		return () => {
			window.removeEventListener('hashchange', handleHashChange)
			observer.disconnect()
		}
	}, [])
	const [theme, setTheme] = useState(
		typeof document !== 'undefined'
			? document.documentElement.getAttribute('data-bs-theme') || 'light'
			: 'light',
	)

	const toggleLocale = () => setLocale((prev) => (prev === 'uk' ? 'en' : 'uk'))

	const handleThemeToggle = (newTheme) => {
		setTheme(newTheme)
		if (typeof document !== 'undefined') {
			if (newTheme === 'dark') document.documentElement.setAttribute('data-bs-theme', 'dark')
			else document.documentElement.removeAttribute('data-bs-theme')
		}
	}

	const sharedProps = { db, locale }

	const blocks = [
		'Nav',
		'Header',
		'Sidebar',
		'Callout',
		'Markdown',
		'ThemeToggle',
		'LangSelect',
		'Description',
		'Excerpt',
		'Features',
		'Content',
		'Accordion',
		'Files',
		'Price',
		'Contract',
		'Search',
		'Autocomplete',
		'TreeView',
		'Button',
	]

	return (
		<div
			className="playground d-flex flex-column flex-md-row bg-body-tertiary"
			style={{ minHeight: '100vh', paddingBottom: '70px' }}
		>
			{/* Sidebar Navigation - Desktop only */}
			{sidebarVisible && (
				<nav
					className="col-md-3 col-lg-2 bg-body shadow-sm sidebar sticky-top d-none d-md-block"
					style={{ top: 0, height: '100vh', overflowY: 'auto' }}
				>
					<div className="p-4 border-bottom">
						<h5 className="fw-bold mb-0">Каталог OLMUI</h5>
						<p className="small text-muted mb-0 mt-1">@nan0web/ui-react</p>
						<div className="mt-3">
							<Blocks.ThemeToggle theme={theme} onToggle={handleThemeToggle} />
						</div>
					</div>
					<div className="p-3">
						<ul className="nav flex-column gap-1">
							{blocks.map((b) => (
								<li className="nav-item" key={b}>
									<a
										className={`nav-link fw-medium rounded p-2 ${activeBlock === '#block-' + b.toLowerCase() ? 'bg-primary text-white' : 'text-body'}`}
										href={'#block-' + b.toLowerCase()}
									>
										{b}
									</a>
								</li>
							))}
						</ul>
					</div>
				</nav>
			)}

			{/* Mobile Sidebar (Offcanvas) */}
			{showSidebar && (
				<div className="offcanvas-backdrop fade show" onClick={() => setShowSidebar(false)}></div>
			)}
			<div
				className={`offcanvas offcanvas-start bg-body-tertiary ${showSidebar ? 'show' : ''}`}
				tabIndex="-1"
				style={{ visibility: showSidebar ? 'visible' : 'hidden' }}
			>
				<div className="offcanvas-header border-bottom">
					<h5 className="offcanvas-title">Каталог OLMUI</h5>
					<button
						type="button"
						className="btn-close"
						onClick={() => setShowSidebar(false)}
						aria-label="Close"
					></button>
				</div>
				<div className="offcanvas-body p-0">
					<div className="p-4 border-bottom">
						<Blocks.ThemeToggle theme={theme} onToggle={handleThemeToggle} />
					</div>
					<div className="p-3">
						<ul className="nav flex-column gap-1">
							{blocks.map((b) => (
								<li className="nav-item" key={b}>
									<a
										className={`nav-link fw-medium rounded p-2 ${activeBlock === '#block-' + b.toLowerCase() ? 'bg-primary text-white' : 'text-body'}`}
										href={'#block-' + b.toLowerCase()}
										onClick={() => setShowSidebar(false)}
									>
										{b}
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className={sidebarVisible ? 'col-md-9 col-lg-10' : 'col-12'}>
				{/* Top Header */}
				<div className="bg-body shadow-sm border-bottom py-3 px-3 px-md-4 mb-5 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
					<div className="d-flex align-items-center gap-3">
						<button className="btn btn-light border d-md-none" onClick={() => setShowSidebar(true)}>
							☰ Меню
						</button>
						<button
							className="btn btn-light border d-none d-md-block"
							onClick={() => setSidebarVisible((v) => !v)}
						>
							{sidebarVisible ? 'Сховати меню' : 'Показати меню'}
						</button>
						<div>
							<h1 className="fw-bold mb-0 h3">Каталог Блоків OLMUI</h1>
							<p className="text-muted small mb-0 mt-1">
								Інтерактивна Пісочниця: <code>Renderer</code>, та <code>Blocks.*</code>.
							</p>
						</div>
					</div>
					<button className="btn btn-outline-primary fw-bold px-4 shadow-sm" onClick={toggleLocale}>
						{locale === 'uk' ? '🇺🇦 UK → EN' : '🇬🇧 EN → UK'}
					</button>
				</div>

				<div className="container-fluid px-3 px-md-4 pb-5">
					{/* ═══════════════════════════════════════════════════ */}
					{/*  NEW BLOCKS                                       */}
					{/* ═══════════════════════════════════════════════════ */}

					<BlockSection
						id="block-nav"
						title="Blocks.Nav"
						description="Верхня навігація (Navbar) з OLMUI Inspector."
					>
						<Example
							label="Проста навігація (3 пункти)"
							jsxCode={`<OlmuiInspector>\n  <Blocks.Nav doc={...} />\n</OlmuiInspector>`}
							yamlCode={{
								$content: ['Nav'],
								$nav: { brand: { title: 'Bank Shell', url: '#' } },
								nav: [
									{ title: 'Головна', url: '#' },
									{ title: 'Про нас', url: '#' },
									{
										title: 'Послуги',
										children: [{ title: 'Депозити' }, { title: 'Кредити' }],
									},
								],
							}}
						>
							<OlmuiInspector>
								<Blocks.Nav
									doc={{
										$nav: { brand: { title: 'Bank Shell', url: '#' } },
										nav: [
											{ title: locale === 'uk' ? 'Головна' : 'Home', url: '#' },
											{ title: locale === 'uk' ? 'Про нас' : 'About', url: '#' },
											{
												title: locale === 'uk' ? 'Послуги' : 'Services',
												children: [{ title: 'Депозити' }, { title: 'Кредити' }],
											},
										],
									}}
								/>
							</OlmuiInspector>
						</Example>
						<Example
							label="Тільки Логотип (Без меню)"
							jsxCode={`<Blocks.Nav doc={{ $nav: { brand: { title: 'Simple Logo', url: '#' } } }} />`}
							yamlCode={{
								$content: ['Nav'],
								$nav: { brand: { title: 'Simple Logo', url: '#' } },
							}}
						>
							<Blocks.Nav doc={{ $nav: { brand: { title: 'Simple Logo', url: '#' } } }} />
						</Example>
					</BlockSection>

					{/* ═══════════════════════════════════════════════════ */}
					{/*  HEADER (Full Component — Bank-like Structure)     */}
					{/* ═══════════════════════════════════════════════════ */}
					<BlockSection
						id="block-header"
						title="Header (Organism)"
						description="Повноцінний Header з багаторівневою навігацією, пошуком, мовою та кнопкою входу. Тестування CSS Custom Properties та всіх станів: hover, active, overlap, arrow ▼."
					>
						{(() => {
							const bankNav = [
								{
									title: locale === 'uk' ? 'Приватним клієнтам' : 'Personal',
									href: '/private/',
									children: [
										{
											title: locale === 'uk' ? 'Картки' : 'Cards',
											href: '/private/cards/',
											children: [
												{
													title: locale === 'uk' ? 'Зарплатні' : 'Payroll',
													href: '/private/cards/payroll',
												},
												{
													title: locale === 'uk' ? 'Кредитні' : 'Credit',
													href: '/private/cards/credit',
												},
												{ title: 'Premium', href: '/private/cards/premium' },
											],
										},
										{
											title: locale === 'uk' ? 'Депозити' : 'Deposits',
											href: '/private/deposits/',
										},
										{ title: locale === 'uk' ? 'Кредити' : 'Credits', href: '/private/credits/' },
										{
											title: locale === 'uk' ? 'Перекази' : 'Transfers',
											href: '/private/transfers/',
											children: [
												{
													title: locale === 'uk' ? 'З картки на картку' : 'Card to Card',
													href: '/private/transfers/c2c',
												},
												{ title: 'Western Union', href: '/private/transfers/western-union' },
											],
										},
										{ title: locale === 'uk' ? 'Метали' : 'Metals', href: '/private/metals/' },
									],
								},
								{
									title: locale === 'uk' ? 'Малому бізнесу' : 'Small Business',
									href: '/business/small/',
									children: [
										{
											title: locale === 'uk' ? 'Розрахунки (РКО)' : 'Payments (RKO)',
											href: '/business/small/rko/',
										},
										{
											title: locale === 'uk' ? 'Депозити' : 'Deposits',
											href: '/business/small/deposits/',
										},
										{
											title: locale === 'uk' ? 'Фінансування' : 'Financing',
											href: '/business/small/financing/',
										},
										{
											title: locale === 'uk' ? 'Зарплатний проєкт' : 'Payroll Project',
											href: '/business/small/payroll/',
										},
									],
								},
								{
									title: locale === 'uk' ? 'Корпоративним клієнтам' : 'Corporate',
									href: '/business/corporate/',
									children: [
										{
											title: locale === 'uk' ? 'Розрахунки' : 'Payments',
											href: '/business/corporate/payments/',
										},
										{
											title: locale === 'uk' ? 'Депозити' : 'Deposits',
											href: '/business/corporate/deposits/',
										},
										{
											title: locale === 'uk' ? 'Кредити' : 'Credits',
											href: '/business/corporate/credits/',
										},
										{
											title: locale === 'uk' ? 'Інші послуги' : 'Other Services',
											href: '/business/corporate/other/',
											children: [
												{
													title: locale === 'uk' ? 'Еквайрінг' : 'Acquiring',
													href: '/business/corporate/other/acquiring',
												},
												{
													title: locale === 'uk' ? 'Інкасація' : 'Collection',
													href: '/business/corporate/other/collection',
												},
											],
										},
									],
								},
								{
									title: locale === 'uk' ? 'Фінансовим установам' : 'Institutions',
									href: '/business/institute/',
									children: [
										{
											title: locale === 'uk' ? 'Операції на міжбанку' : 'Interbank Ops',
											href: '/business/institute/interbank',
										},
										{
											title: locale === 'uk' ? 'Послуги' : 'Services',
											href: '/business/institute/services',
										},
									],
								},
								{
									title: locale === 'uk' ? 'Банк' : 'About',
									href: '/about/',
									children: [
										{ title: locale === 'uk' ? 'Про банк' : 'About Us', href: '/about/info' },
										{ title: locale === 'uk' ? 'Новини' : 'News', href: '/about/news' },
										{ title: locale === 'uk' ? 'Звітність' : 'Reports', href: '/about/reports' },
										{
											title: locale === 'uk' ? 'Відділення та банкомати' : 'Branches & ATMs',
											href: '/about/branches',
										},
										{ title: locale === 'uk' ? 'Вакансії' : 'Careers', href: '/about/careers' },
									],
								},
								{
									title: locale === 'uk' ? 'Контакти' : 'Contacts',
									href: '/contacts/',
								},
								{
									title: locale === 'uk' ? 'Ліцензія' : 'License',
									href: '/license/',
								},
							]
							return (
								<>
									<Example
										label="Банківська навігація (3 рівні + OLMUI Inspector)"
										jsxCode={`import Header from './components/organisms/Header/Header'
import { OlmuiInspector } from './components/OlmuiInspector'

<OlmuiInspector model={Header.cssModel}>
	<Header nav={{ items: bankNav }} title="ІНДУСТРІАЛБАНК" />
</OlmuiInspector>`}
										yamlCode={{
											$note: 'Повна 3-рівнева структура навігації банку',
											nav: bankNav,
										}}
									>
										<OlmuiInspector StylesClass={HeaderStyles}>
											<Header nav={{ items: bankNav }} title="Додаток банку" $logo={false} />
										</OlmuiInspector>
									</Example>
								</>
							)
						})()}
					</BlockSection>

					<BlockSection
						id="block-sidebar"
						title="Blocks.Sidebar"
						description="Бокове меню (Sidebar) для налаштувань або документації."
					>
						<Example
							label="Ієрархічне меню з заголовком"
							jsxCode={`<Blocks.Sidebar doc={{ $sidebar: { title: "Settings" }, sidebar: [...] }} />`}
							yamlCode={{
								$content: ['Sidebar'],
								$sidebar: { title: 'Settings' },
								sidebar: [
									{ title: 'Profile', url: '#profile', active: true },
									{ title: 'Security', url: '#security' },
									{ title: 'Notifications', url: '#alerts' },
								],
							}}
						>
							<div style={{ maxWidth: '300px' }}>
								<Blocks.Sidebar
									doc={{
										$sidebar: { title: locale === 'uk' ? 'Налаштування' : 'Settings' },
										sidebar: [
											{
												title: locale === 'uk' ? 'Профіль' : 'Profile',
												url: '#profile',
												active: true,
											},
											{ title: locale === 'uk' ? 'Безпека' : 'Security', url: '#security' },
											{ title: locale === 'uk' ? 'Сповіщення' : 'Notifications', url: '#alerts' },
										],
									}}
								/>
							</div>
						</Example>
						<Example
							label="Просте меню без заголовка"
							jsxCode={`<Blocks.Sidebar doc={{ sidebar: [{ title: "Option 1" }, { title: "Option 2" }] }} />`}
							yamlCode={{
								$content: ['Sidebar'],
								sidebar: [{ title: 'Option 1' }, { title: 'Option 2' }],
							}}
						>
							<div style={{ maxWidth: '300px' }}>
								<Blocks.Sidebar
									doc={{
										sidebar: [
											{ title: locale === 'uk' ? 'Опція 1' : 'Option 1', url: '#' },
											{ title: locale === 'uk' ? 'Опція 2' : 'Option 2', url: '#' },
										],
									}}
								/>
							</div>
						</Example>
					</BlockSection>
					<BlockSection
						id="block-alert"
						title="Blocks.Alert"
						description="Блоки уваги (Alerts). Можуть приймати content або children."
					>
						<Example
							label="Всі типи (Info, Warning, Danger, Success)"
							jsxCode={`<Blocks.Alert type="info">This is an informational message.</Blocks.Alert>\n<Blocks.Alert type="warning">This is a warning message.</Blocks.Alert>\n<Blocks.Alert type="danger">This is a critical error message.</Blocks.Alert>\n<Blocks.Alert type="success">Operation completed successfully.</Blocks.Alert>`}
							yamlCode={{
								$content: ['Content'],
								content: [
									{ Alert: 'This is an informational message.' },
									{ 'Alert.warning': 'This is a warning message.' },
									{ 'Alert.danger': 'This is a critical error message.' },
									{ 'Alert.success': 'Operation completed successfully.' },
								],
							}}
						>
							<Blocks.Alert type="info" className="mb-3">
								This is an informational message.
							</Blocks.Alert>
							<Blocks.Alert type="warning" className="mb-3">
								This is a warning message.
							</Blocks.Alert>
							<Blocks.Alert type="danger" className="mb-3">
								This is a critical error message.
							</Blocks.Alert>
							<Blocks.Alert type="success">Operation completed successfully.</Blocks.Alert>
						</Example>
					</BlockSection>

					<BlockSection
						id="block-markdown"
						title="Blocks.Markdown"
						description="Рендер готового HTML або Markdown."
					>
						{(() => {
							const markdownText = locale === 'uk'
								? '# Справжній Markdown\\n\\nЦе приклад рендеру **markdown** за допомогою `marked`.\\n\\n- Підтримує списки\\n- [Посилання](https://ivan.ua)\\n- HTML теги: <br/> `code`'
								: '# Real Markdown\\n\\nThis is an example of rendering **markdown** using `marked`.\\n\\n- Supports lists\\n- [Links](https://ivan.ua)\\n- HTML tags: <br/> `code`'
							return (
								<Example
									label="Рендер справжнього Markdown"
									jsxCode={`<Blocks.Markdown doc={{ Markdown: "${markdownText}" }} />`}
									yamlCode={{
										$content: [{ Markdown: markdownText.replace(/\\n/g, '\n') }],
									}}
								>
									<Blocks.Markdown doc={{ Markdown: markdownText.replace(/\\n/g, '\n') }} />
								</Example>
							)
						})()}
					</BlockSection>

					<BlockSection
						id="block-themetoggle"
						title="Blocks.ThemeToggle"
						description="Перемикач теми (світла/темна)."
					>
						<Example
							label="Компонент в дії"
							jsxCode={`<Blocks.ThemeToggle theme={theme} onToggle={setTheme} />`}
							yamlCode={{
								$content: ['ThemeToggle'],
							}}
						>
							<div
								className="d-flex align-items-center gap-3 p-3 border rounded shadow-sm"
								style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}
							>
								<span className="text-muted small">
									Поточна тема: <strong>{theme}</strong>
								</span>
								<Blocks.ThemeToggle theme={theme} onToggle={handleThemeToggle} />
							</div>
						</Example>
					</BlockSection>

					<BlockSection
						id="block-langselect"
						title="Blocks.LangSelect"
						description="Перемикач мови (локалі)."
					>
						<Example
							label="Віджет вибору мови"
							jsxCode={`<Blocks.LangSelect locale={locale} onChange={setLocale} />`}
							yamlCode={{
								$content: ['LangSelect'],
							}}
						>
							<div
								className="d-flex align-items-center gap-3 p-3 border rounded shadow-sm"
								style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}
							>
								<span className="text-muted small">
									Поточна мова: <strong>{locale}</strong>
								</span>
								<Blocks.LangSelect locale={locale} onChange={setLocale} />
							</div>
						</Example>
					</BlockSection>

					{/* ═══════════════════════════════════════════════════ */}
					{/*  DESCRIPTION                                       */}
					{/* ═══════════════════════════════════════════════════ */}
					<BlockSection
						id="block-description"
						title="Blocks.Description"
						description="Підзаголовок або короткий опис сторінки. Рядкове значення. Рендериться як <h2>."
					>
						<Example
							label="Простий текст"
							jsxCode={`<Blocks.Description doc={{ description: locale === 'uk' ? "Короткий опис сторінки" : "Short page description" }} />`}
							yamlCode={{
								$content: ['Description'],
								description: locale === 'uk' ? 'Короткий опис сторінки' : 'Short page description',
							}}
						>
							<Blocks.Description
								doc={{
									description:
										locale === 'uk' ? 'Короткий опис сторінки' : 'Short page description',
								}}
							/>
						</Example>

						<Example
							label="Довгий підзаголовок (HTML & entities)"
							jsxCode={`<Blocks.Description doc={{ description: locale === 'uk' ? "Цей блок відображає опис або <br/> підзаголовок &amp; сторінки." : "This block displays the description or <br/> subtitle &amp; of the page." }} />`}
							yamlCode={{
								$content: ['Description'],
								description:
									locale === 'uk'
										? 'Цей блок відображає опис або <br/> підзаголовок &amp; сторінки.'
										: 'This block displays the description or <br/> subtitle &amp; of the page.',
							}}
						>
							<Blocks.Description
								doc={{
									description:
										locale === 'uk'
											? 'Цей блок відображає опис або <br/> підзаголовок &amp; сторінки.'
											: 'This block displays the description or <br/> subtitle &amp; of the page.',
								}}
							/>
						</Example>
					</BlockSection>

					{/* ═══════════════════════════════════════════════════ */}
					{/*  EXCERPT                                           */}
					{/* ═══════════════════════════════════════════════════ */}
					<BlockSection
						id="block-excerpt"
						title="Blocks.Excerpt"
						description="Вступний текст (excerpt). Масив nano-вузлів. Форматування через nano2html підтримує теги a, span, b, i, тощо."
					>
						<Example
							label="Один абзац"
							jsxCode={`<Blocks.Excerpt doc={{\n  excerpt: [{ p: locale === 'uk' ? "Простий вступний абзац без форматування." : "Simple intro paragraph without formatting." }]\n}} />`}
							yamlCode={{
								$content: ['Excerpt'],
								excerpt: [
									{
										p:
											locale === 'uk'
												? 'Простий вступний абзац без форматування.'
												: 'Simple intro paragraph without formatting.',
									},
								],
							}}
						>
							<Blocks.Excerpt
								doc={{
									excerpt: [
										{
											p:
												locale === 'uk'
													? 'Простий вступний абзац без форматування.'
													: 'Simple intro paragraph without formatting.',
										},
									],
								}}
								{...sharedProps}
							/>
						</Example>

						<Example
							label="Форматований текст (Bold, Italic, Спрощені Посилання)"
							jsxCode={`<Blocks.Excerpt doc={{\n  excerpt: [\n    { p: [\n      locale === 'uk' ? "Цей текст містить " : "This text contains ",\n      { b: locale === 'uk' ? "жирний" : "bold" },\n      ", ",\n      { i: locale === 'uk' ? "курсив" : "italic" },\n      locale === 'uk' ? " та " : " and ",\n      /* ЗВЕРНИ УВАГУ: атрибути передаються плоским ключем $ */\n      { a: locale === 'uk' ? "посилання" : "link", $href: "#" },\n      "."\n    ] }\n  ]\n}} />`}
							yamlCode={{
								$content: ['Excerpt'],
								excerpt: [
									{
										p: [
											locale === 'uk' ? 'Цей текст містить ' : 'This text contains ',
											{ b: locale === 'uk' ? 'жирний' : 'bold' },
											', ',
											{ i: locale === 'uk' ? 'курсив' : 'italic' },
											locale === 'uk' ? ' та ' : ' and ',
											{ a: locale === 'uk' ? 'посилання' : 'link', $href: '#' },
											'.',
										],
									},
								],
							}}
						>
							<Blocks.Excerpt
								doc={{
									excerpt: [
										{
											p: [
												locale === 'uk' ? 'Цей текст містить ' : 'This text contains ',
												{ b: locale === 'uk' ? 'жирний' : 'bold' },
												', ',
												{ i: locale === 'uk' ? 'курсив' : 'italic' },
												locale === 'uk' ? ' та ' : ' and ',
												{ a: locale === 'uk' ? 'посилання' : 'link', $href: '#' },
												'.',
											],
										},
									],
								}}
								{...sharedProps}
							/>
						</Example>
					</BlockSection>

					{/* ═══════════════════════════════════════════════════ */}
					{/*  FEATURES                                          */}
					{/* ═══════════════════════════════════════════════════ */}
					<BlockSection
						id="block-features"
						title="Blocks.Features"
						description="Список переваг/фіч з іконками-галочками. Елементи: рядки або масиви форматованого тексту."
					>
						<Example
							label="Прості рядки"
							jsxCode={`<Blocks.Features doc={{\n  features: [\n    locale === 'uk' ? "Безкоштовне обслуговування" : "Free maintenance",\n    locale === 'uk' ? "Онлайн-підтримка 24/7" : "24/7 online support"\n  ]\n}} />`}
							yamlCode={{
								$content: ['Features'],
								features: [
									locale === 'uk' ? 'Безкоштовне обслуговування' : 'Free maintenance',
									locale === 'uk' ? 'Онлайн-підтримка 24/7' : '24/7 online support',
								],
							}}
						>
							<Blocks.Features
								doc={{
									features: [
										locale === 'uk' ? 'Безкоштовне обслуговування' : 'Free maintenance',
										locale === 'uk' ? 'Онлайн-підтримка 24/7' : '24/7 online support',
									],
								}}
								{...sharedProps}
							/>
						</Example>

						<Example
							label="З HTML-форматуванням"
							jsxCode={`<Blocks.Features doc={{\n  features: [\n    { b: locale === 'uk' ? "Гарантована безпека" : "Guaranteed security" },\n    { span: [locale === 'uk' ? "Підтримка " : "Support for ", { b: locale === 'uk' ? "двох мов" : "two languages" }, " (UK/EN)"] }\n  ]\n}} />`}
							yamlCode={{
								$content: ['Features'],
								features: [
									{ b: locale === 'uk' ? 'Гарантована безпека' : 'Guaranteed security' },
									{
										span: [
											locale === 'uk' ? 'Підтримка ' : 'Support for ',
											{ b: locale === 'uk' ? 'двох мов' : 'two languages' },
											' (UK/EN)',
										],
									},
								],
							}}
						>
							<Blocks.Features
								doc={{
									features: [
										{ b: locale === 'uk' ? 'Гарантована безпека' : 'Guaranteed security' },
										{
											span: [
												locale === 'uk' ? 'Підтримка ' : 'Support for ',
												{ b: locale === 'uk' ? 'двох мов' : 'two languages' },
												' (UK/EN)',
											],
										},
									],
								}}
								{...sharedProps}
							/>
						</Example>
					</BlockSection>

					{/* ═══════════════════════════════════════════════════ */}
					{/*  CONTENT                                           */}
					{/* ═══════════════════════════════════════════════════ */}
					<BlockSection
						id="block-content"
						title="Blocks.Content"
						description="Основний контент. Підтримує всі HTML-теги через nano2html: заголовки, параграфи, таблиці, списки."
					>
						<Example
							label="Списки з автоформатом (ul/ol автоматично обгортають рядки у li)"
							jsxCode={`<Blocks.Content doc={{\n  content: [\n    { h5: locale === 'uk' ? "Вимоги до позичальника:" : "Requirements:" },\n    { ul: [\n      locale === 'uk' ? "Вік від 21 до 65 років" : "Age 21 to 65",\n      locale === 'uk' ? "Стаж роботи від 6 місяців" : "Work experience 6+ months"\n    ]}\n  ]\n}} />`}
							yamlCode={{
								$content: ['Content'],
								content: [
									{ h5: locale === 'uk' ? 'Вимоги до позичальника:' : 'Requirements:' },
									{
										ul: [
											locale === 'uk' ? 'Вік від 21 до 65 років' : 'Age 21 to 65',
											locale === 'uk' ? 'Стаж роботи від 6 місяців' : 'Work experience 6+ months',
										],
									},
									{ h5: locale === 'uk' ? 'Порядок оформлення:' : 'Procedure:' },
									{
										ol: [
											locale === 'uk' ? 'Подати заявку онлайн' : 'Apply online',
											locale === 'uk' ? 'Отримати рішення' : 'Get decision',
										],
									},
								],
							}}
						>
							<Blocks.Content
								doc={{
									content: [
										{ h5: locale === 'uk' ? 'Вимоги до позичальника:' : 'Requirements:' },
										{
											ul: [
												locale === 'uk' ? 'Вік від 21 до 65 років' : 'Age 21 to 65',
												locale === 'uk' ? 'Стаж роботи від 6 місяців' : 'Work experience 6+ months',
											],
										},
										{ h5: locale === 'uk' ? 'Порядок оформлення:' : 'Procedure:' },
										{
											ol: [
												locale === 'uk' ? 'Подати заявку онлайн' : 'Apply online',
												locale === 'uk' ? 'Отримати рішення' : 'Get decision',
											],
										},
									],
								}}
								{...sharedProps}
							/>
						</Example>

						<Example
							label="Таблиця за замовчуванням (клас таблиці автоматично table-striped table-hover)"
							jsxCode={`<Blocks.Content doc={{\n  content: [\n    { \n      table: {\n        thead: [{ tr: [locale === 'uk' ? "Назва" : "Name", locale === 'uk' ? "Тариф" : "Rate"] }],\n        tbody: [\n          { tr: [locale === 'uk' ? "Стандарт" : "Standard", "10%"] }\n        ]\n      }\n    }\n  ]\n}} />`}
							yamlCode={{
								$content: ['Content'],
								content: [
									{
										table: {
											thead: [
												{
													tr: [
														locale === 'uk' ? 'Назва' : 'Name',
														locale === 'uk' ? 'Тариф' : 'Rate',
													],
												},
											],
											tbody: [{ tr: [locale === 'uk' ? 'Стандарт' : 'Standard', '10%'] }],
										},
									},
								],
							}}
						>
							<Blocks.Content
								doc={{
									content: [
										{
											table: {
												thead: [
													{
														tr: [
															{ th: locale === 'uk' ? 'Назва' : 'Name' },
															{ th: locale === 'uk' ? 'Тариф' : 'Rate' },
														],
													},
												],
												tbody: [{ tr: [locale === 'uk' ? 'Стандарт' : 'Standard', '10%'] }],
											},
										},
									],
								}}
								{...sharedProps}
							/>
						</Example>

						<Example
							label="Складна таблиця з кастомним класом"
							jsxCode={`<Blocks.Content doc={{\n  content: [\n    { h5: locale === 'uk' ? "Таблиця з кастомним класом" : "Table with custom class" },\n    { \n      table: {\n        thead: [{ tr: [locale === 'uk' ? "Назва" : "Name", locale === 'uk' ? "Тариф" : "Rate"] }],\n        tbody: [\n          { tr: [locale === 'uk' ? "Ощадний" : "Savings", "12%"] },\n          { tr: [locale === 'uk' ? "Накопичувальний" : "Accumulative", "14%"] }\n        ]\n      },\n      $class: "table table-dark table-striped mt-3"\n    }\n  ]\n}} />`}
							yamlCode={{
								$content: ['Content'],
								content: [
									{
										h5: locale === 'uk' ? 'Таблиця з кастомним класом' : 'Table with custom class',
									},
									{
										table: {
											thead: [
												{
													tr: [
														locale === 'uk' ? 'Назва' : 'Name',
														locale === 'uk' ? 'Тариф' : 'Rate',
													],
												},
											],
											tbody: [
												{ tr: [locale === 'uk' ? 'Ощадний' : 'Savings', '12%'] },
												{ tr: [locale === 'uk' ? 'Накопичувальний' : 'Accumulative', '14%'] },
											],
										},
										$class: 'table table-dark table-striped mt-3',
									},
								],
							}}
						>
							<Blocks.Content
								doc={{
									content: [
										{
											h5:
												locale === 'uk' ? 'Таблиця з кастомним класом' : 'Table with custom class',
										},
										{
											table: {
												thead: [
													{
														tr: [
															{ th: locale === 'uk' ? 'Назва' : 'Name' },
															{ th: locale === 'uk' ? 'Тариф' : 'Rate' },
														],
													},
												],
												tbody: [
													// We can either pass objects {td: ...} or simply strings because we implemented auto wrapper!
													{ tr: [locale === 'uk' ? 'Ощадний' : 'Savings', '12%'] },
													{ tr: [locale === 'uk' ? 'Накопичувальний' : 'Accumulative', '14%'] },
												],
											},
											$class: 'table table-dark table-striped mt-3',
										},
									],
								}}
								{...sharedProps}
							/>
						</Example>
					</BlockSection>

					{/* ═══════════════════════════════════════════════════ */}
					{/*  ACCORDION                                         */}
					{/* ═══════════════════════════════════════════════════ */}
					<BlockSection
						id="block-accordion"
						title="Blocks.Accordion"
						description="Інтерактивний акордеон (Bootstrap JS collapse). Два формати: { q, a } або { title, content }."
					>
						<Example
							label="Акордеон Q&A"
							jsxCode={`<Blocks.Accordion doc={{\n  accordion: [\n    { q: locale === 'uk' ? "Як відкрити рахунок?" : "How to open an account?", a: locale === 'uk' ? "Звертайтесь у відділення." : "Please visit a branch." },\n    { q: locale === 'uk' ? "Чи є додаток?" : "Is there an app?", a: locale === 'uk' ? "Так, для iOS." : "Yes, for iOS." }\n  ]\n}} />`}
							yamlCode={{
								$content: ['Accordion'],
								accordion: [
									{
										q: locale === 'uk' ? 'Як відкрити рахунок?' : 'How to open an account?',
										a: locale === 'uk' ? 'Звертайтесь у відділення.' : 'Please visit a branch.',
									},
									{
										q: locale === 'uk' ? 'Чи є додаток?' : 'Is there an app?',
										a: locale === 'uk' ? 'Так, для iOS.' : 'Yes, for iOS.',
									},
								],
							}}
						>
							<Blocks.Accordion
								doc={{
									accordion: [
										{
											q: locale === 'uk' ? 'Як відкрити рахунок?' : 'How to open an account?',
											a: locale === 'uk' ? 'Звертайтесь у відділення.' : 'Please visit a branch.',
										},
										{
											q: locale === 'uk' ? 'Чи є додаток?' : 'Is there an app?',
											a: locale === 'uk' ? 'Так, для iOS.' : 'Yes, for iOS.',
										},
									],
								}}
							/>
						</Example>

						<Example
							label="Акордеон з HTML"
							jsxCode={`<Blocks.Accordion doc={{\n  accordion: [\n    { \n      title: locale === 'uk' ? "Комісії та тарифи" : "Fees and limits", \n      content: locale === 'uk' ? "Комісія становить <strong class='text-danger'>5%</strong> без ліміту." : "Fee is <strong class='text-danger'>5%</strong> no limits." \n    }\n  ]\n}} />`}
							yamlCode={{
								$content: ['Accordion'],
								accordion: [
									{
										title: locale === 'uk' ? 'Комісії та тарифи' : 'Fees and limits',
										content:
											locale === 'uk'
												? "Комісія становить <strong class='text-danger'>5%</strong> без ліміту."
												: "Fee is <strong class='text-danger'>5%</strong> no limits.",
									},
								],
							}}
						>
							<Blocks.Accordion
								doc={{
									accordion: [
										{
											title: locale === 'uk' ? 'Комісії та тарифи' : 'Fees and limits',
											content:
												locale === 'uk'
													? "Комісія становить <strong class='text-danger'>5%</strong> без ліміту."
													: "Fee is <strong class='text-danger'>5%</strong> no limits.",
										},
									],
								}}
							/>
						</Example>
					</BlockSection>

					{/* ═══════════════════════════════════════════════════ */}
					{/*  FILES                                             */}
					{/* ═══════════════════════════════════════════════════ */}
					<BlockSection
						id="block-files"
						title="Blocks.Files"
						description={`Блок завантаження контенту (Files). Беремо baseName для голих URL.`}
					>
						<Example
							label="Markdown посилання та голі URL (BaseName)"
							jsxCode={`<Blocks.Files \n  locale={locale}\n  doc={{\n    files: [\n      locale === 'uk' ? "[Тарифи банку (PDF)](/tariffs.pdf)" : "[Bank Tariffs (PDF)](/tariffs.pdf)",\n      "https://example.com/legal_document_v2.pdf"\n    ]\n  }}\n/>`}
							yamlCode={{
								$content: ['Files'],
								files: [
									locale === 'uk'
										? '[Тарифи банку (PDF)](/tariffs.pdf)'
										: '[Bank Tariffs (PDF)](/tariffs.pdf)',
									'https://example.com/legal_document_v2.pdf',
								],
							}}
						>
							<Blocks.Files
								locale={locale}
								doc={{
									files: [
										locale === 'uk'
											? '[Тарифи банку (PDF)](/tariffs.pdf)'
											: '[Bank Tariffs (PDF)](/tariffs.pdf)',
										'https://example.com/legal_document_v2.pdf',
									],
								}}
							/>
						</Example>

						<Example
							label="Як об'єкт (перевизначення назви блоку через $files: { title: ... })"
							jsxCode={`<Blocks.Files \n  locale={locale}\n  doc={{\n    $files: { title: locale === 'uk' ? "Договори" : "Contracts" },\n    files: [\n      { href: "/contract.pdf", name: locale === 'uk' ? "Типовий договір" : "Standard contract" }\n    ]\n  }}\n/>`}
							yamlCode={{
								$content: ['Files'],
								$files: { title: locale === 'uk' ? 'Договори' : 'Contracts' },
								files: [
									{
										href: '/contract.pdf',
										name: locale === 'uk' ? 'Типовий договір' : 'Standard contract',
									},
								],
							}}
						>
							<Blocks.Files
								locale={locale}
								doc={{
									$files: { title: locale === 'uk' ? 'Договори' : 'Contracts' },
									files: [
										{
											href: '/contract.pdf',
											name: locale === 'uk' ? 'Типовий договір' : 'Standard contract',
										},
									],
								}}
							/>
						</Example>
					</BlockSection>

					{/* ═══════════════════════════════════════════════════ */}
					{/*  PRICE                                             */}
					{/* ═══════════════════════════════════════════════════ */}
					<BlockSection
						id="block-price"
						title="Blocks.Price"
						description={`Блок ціни. Рендерить текстові значення або об'єкти (з value/currency).`}
					>
						<Example
							label="Текстовий формат (Безкоштовно)"
							jsxCode={`<Blocks.Price locale={locale} doc={{ price: locale === 'uk' ? 'Безкоштовно' : 'Free of charge' }} />`}
							yamlCode={{
								$content: ['Price'],
								price: locale === 'uk' ? 'Безкоштовно' : 'Free of charge',
							}}
						>
							<Blocks.Price
								locale={locale}
								doc={{ price: locale === 'uk' ? 'Безкоштовно' : 'Free of charge' }}
							/>
						</Example>

						<Example
							label="В об'єкті з літерним кодом (USD, EUR...)"
							jsxCode={`<Blocks.Price \n  locale={locale} \n  doc={{\n    price: { value: "1 500", currency: "USD" }\n  }} \n/>`}
							yamlCode={{ $content: ['Price'], price: { value: '1 500', currency: 'USD' } }}
						>
							<Blocks.Price locale={locale} doc={{ price: { value: '1 500', currency: 'USD' } }} />
						</Example>

						<Example
							label="Як об'єкт з налаштуванням view: symbol ($price: { view: 'symbol' })"
							jsxCode={`<Blocks.Price \n  locale={locale} \n  doc={{\n    price: { value: "1 500", currency: "USD" },\n    $price: { view: 'symbol' }\n  }} \n/>`}
							yamlCode={{
								$content: ['Price'],
								price: { value: '1 500', currency: 'USD' },
								$price: { view: 'symbol' },
							}}
						>
							<Blocks.Price
								locale={locale}
								doc={{ price: { value: '1 500', currency: 'USD' }, $price: { view: 'symbol' } }}
							/>
						</Example>
					</BlockSection>

					{/* ═══════════════════════════════════════════════════ */}
					{/*  CONTRACT                                          */}
					{/* ═══════════════════════════════════════════════════ */}
					<BlockSection
						id="block-contract"
						title="Blocks.Contract"
						description={`Документ-регламент з навігацією (якщо передано $docNavigator) або без навігації.`}
					>
						<Example
							label="Повний регламент (з навігатором)"
							jsxCode={`<Blocks.Contract \n  locale={locale}\n  doc={{\n    $docNavigator: { text: locale === 'uk' ? "Перейти до розділу" : "Jump to section" },\n    contract: [\n      { id: "general", title: locale === 'uk' ? "1. Загальні положення" : "1. General terms", content: [{ p: locale === 'uk' ? "Текст положення 1." : "Term text 1." }] },\n      { id: "rights", title: locale === 'uk' ? "2. Права та обов'язки" : "2. Rights & Duties", content: [{ p: locale === 'uk' ? "Текст обов'язків." : "Duties text." }] },\n    ]\n  }}\n/>`}
							yamlCode={{
								$content: ['Contract'],
								$docNavigator: { text: locale === 'uk' ? 'Перейти до розділу' : 'Jump to section' },
								contract: [
									{
										id: 'general',
										title: locale === 'uk' ? '1. Загальні положення' : '1. General terms',
										content: [{ p: locale === 'uk' ? 'Текст положення 1.' : 'Term text 1.' }],
									},
									{
										id: 'rights',
										title: locale === 'uk' ? "2. Права та обов'язки" : '2. Rights & Duties',
										content: [{ p: locale === 'uk' ? "Текст обов'язків." : 'Duties text.' }],
									},
								],
							}}
						>
							<Blocks.Contract
								locale={locale}
								doc={{
									$docNavigator: {
										text: locale === 'uk' ? 'Перейти до розділу' : 'Jump to section',
									},
									contract: [
										{
											id: 'general',
											title: locale === 'uk' ? '1. Загальні положення' : '1. General terms',
											content: [{ p: locale === 'uk' ? 'Текст положення 1.' : 'Term text 1.' }],
										},
										{
											id: 'rights',
											title: locale === 'uk' ? "2. Права та обов'язки" : '2. Rights & Duties',
											content: [{ p: locale === 'uk' ? "Текст обов'язків." : 'Duties text.' }],
										},
									],
								}}
								{...sharedProps}
							/>
						</Example>

						<Example
							label="Без навігатора (Загальні положення)"
							jsxCode={`<Blocks.Contract \n  locale={locale}\n  doc={{\n    contract: [\n      { id: "simple", title: locale === 'uk' ? "Цей договір не має меню навігації" : "This contract has no navigation menu", content: [{ p: "..." }] }\n    ]\n  }}\n/>`}
							yamlCode={{
								$content: ['Contract'],
								contract: [
									{
										id: 'simple',
										title:
											locale === 'uk'
												? 'Цей договір не має меню навігації'
												: 'This contract has no navigation menu',
										content: [{ p: '...' }],
									},
								],
							}}
						>
							<Blocks.Contract
								locale={locale}
								doc={{
									contract: [
										{
											id: 'simple',
											title:
												locale === 'uk'
													? 'Цей договір не має меню навігації'
													: 'This contract has no navigation menu',
											content: [{ p: '...' }],
										},
									],
								}}
								{...sharedProps}
							/>
						</Example>
					</BlockSection>

					{/* ═══════════════════════════════════════════════════ */}
					{/*  SEARCH                                            */}
					{/* ═══════════════════════════════════════════════════ */}
					<BlockSection
						id="block-search"
						title="Blocks.Search"
						description="Універсальний рядок пошуку та результати. Завантажує індекс та фільтрує миттєво."
					>
						<Example
							label="Миттєвий локальний пошук (наприклад: 'депозит', 'авто', 'кредит')"
							jsxCode={`<Blocks.Search \n  inline={true} \n  index={searchIndexData} \n/>`}
							yamlCode={{
								$content: ['Search'],
								$search: {
									index: '/api/search.jsonl',
									inline: true,
								},
							}}
						>
							<Blocks.Search
								inline={true}
								t={(k) => {
									const uk = {
										searchPlaceholder: 'Почніть вводити для пошуку...',
										searchBtn: 'Знайти',
										resultsFound: 'результатів',
										noResults: 'Нічого не знайдено',
										searchReadMore: 'Детальніше',
									}
									const en = {
										searchPlaceholder: 'Start typing to search...',
										searchBtn: 'Search',
										resultsFound: 'results found',
										noResults: 'No results found',
										searchReadMore: 'Read more',
									}
									return locale === 'uk' ? uk[k] : en[k]
								}}
								index={[
									{
										title: locale === 'uk' ? 'Депозит "Прибутковий"' : 'Deposit "Profitable"',
										desc:
											locale === 'uk'
												? 'Високі відсотки, надійне збереження.'
												: 'High interest, reliable storage.',
										url: '#1',
									},
									{
										title: locale === 'uk' ? 'Депозит "Перспектива"' : 'Deposit "Perspective"',
										desc:
											locale === 'uk'
												? 'Можливість поповнення протягом строку.'
												: 'Refill allowed during term.',
										url: '#2',
									},
									{
										title: locale === 'uk' ? 'Депозит "Ощадний"' : 'Deposit "Savings"',
										desc:
											locale === 'uk'
												? 'Вільний доступ до коштів без втрати відсотків.'
												: 'Free access to funds without losing interest.',
										url: '#3',
									},
									{
										title: locale === 'uk' ? 'Кредит готівкою' : 'Cash Loan',
										desc:
											locale === 'uk'
												? 'Гроші на будь-які цілі під низький відсоток.'
												: 'Money for any purpose at low interest.',
										url: '#4',
									},
									{
										title:
											locale === 'uk'
												? 'Кредитна картка "Універсальна"'
												: 'Credit Card "Universal"',
										desc:
											locale === 'uk'
												? 'Пільговий період до 55 днів на всі покупки.'
												: 'Grace period up to 55 days on all purchases.',
										url: '#5',
									},
									{
										title: locale === 'uk' ? 'Автокредитування' : 'Auto Loan',
										desc:
											locale === 'uk'
												? 'Нове авто з салону в кредит.'
												: 'New car from salon on credit.',
										url: '#6',
									},
									{
										title: locale === 'uk' ? 'Іпотека "Власний дім"' : 'Mortgage "Own Home"',
										desc:
											locale === 'uk'
												? 'Доступне житловий кредит на 20 років.'
												: 'Affordable housing loan for 20 years.',
										url: '#7',
									},
									{
										title: locale === 'uk' ? 'Рахунок ФОП' : 'Entrepreneur Account',
										desc:
											locale === 'uk'
												? 'Зручне ведення бізнесу та онлайн-бухгалтерія.'
												: 'Convenient business management and online accounting.',
										url: '#8',
									},
									{
										title: locale === 'uk' ? 'Зарплатний проект' : 'Payroll Project',
										desc:
											locale === 'uk'
												? 'Безкоштовний випуск карток для співробітників.'
												: 'Free card issuance for employees.',
										url: '#9',
									},
									{
										title: locale === 'uk' ? 'Корпоративна картка' : 'Corporate Card',
										desc:
											locale === 'uk'
												? 'Оплата витрат компанії однією карткою.'
												: 'Payment of company expenses with one card.',
										url: '#10',
									},
									{
										title: locale === 'uk' ? 'Страхування життя' : 'Life Insurance',
										desc:
											locale === 'uk'
												? 'Захист вашої родини від непередбачуваних витрат.'
												: 'Protection of your family from unforeseen expenses.',
										url: '#11',
									},
									{
										title: locale === 'uk' ? 'Страхування авто (КАСКО)' : 'Auto Insurance (CASCO)',
										desc:
											locale === 'uk'
												? 'Повний захист вашого автомобіля.'
												: 'Full protection of your car.',
										url: '#12',
									},
								]}
							/>
						</Example>
					</BlockSection>

					{/* Additional Sandbox-Migrated Elements */}
					<BlockSection
						id="block-autocomplete"
						title="Autocomplete"
						description="Мультиселект поле з пошуком"
					>
						<Example
							label="Стандартний"
							jsxCode={`import { Autocomplete } from '@nan0web/ui-react-bootstrap/src/index.jsx'\n\n<Autocomplete \n  options={['Apple', 'Banana', 'Cherry']} \n  placeholder="Шукати фрукти..."\n/>`}
							yamlCode={{
								autocomplete: { options: ['Apple', 'Banana', 'Cherry'], placeholder: 'Search...' },
							}}
						>
							<div style={{ maxWidth: 400 }}>
								<Autocomplete
									options={['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']}
									placeholder={locale === 'uk' ? 'Шукати фрукти...' : 'Search fruits...'}
								/>
							</div>
						</Example>
					</BlockSection>

					<BlockSection
						id="block-treeview"
						title="TreeView"
						description="Деревовидна структура файлів або директорій"
					>
						<Example
							label="Файлове дерево"
							jsxCode={`import { TreeView } from '@nan0web/ui-react-bootstrap/src/index.jsx'\n\n<TreeView data={[\n  { name: 'src', type: 'dir', children: [\n    { name: 'App.js', type: 'file' }\n  ]}\n]}/>`}
							yamlCode={{
								tree: [{ name: 'src', type: 'dir', children: [{ name: 'App.js', type: 'file' }] }],
							}}
						>
							<div className="bg-body p-3 rounded border" style={{ maxWidth: 400 }}>
								<TreeView
									data={[
										{
											name: 'src',
											type: 'dir',
											children: [
												{ name: 'App.js', type: 'file' },
												{ name: 'index.jsx', type: 'file' },
											],
										},
										{ name: 'package.json', type: 'file' },
									]}
									mode="file"
								/>
							</div>
						</Example>
					</BlockSection>

					<BlockSection id="block-button" title="Button" description="Базові елементи взаємодії">
						<Example
							label="Кнопки"
							jsxCode={`<Button variant="primary">Кнопка</Button>`}
							yamlCode={{ Button: 'Кнопка', $variant: 'primary' }}
						>
							<div className="d-flex gap-2 mb-3">
								<Button variant="primary">Primary</Button>
								<Button variant="secondary">Secondary</Button>
								<Button variant="success">Success</Button>
								<Button variant="danger">Danger</Button>
							</div>
						</Example>
					</BlockSection>
				</div>
			</div>
		</div>
	)
}
