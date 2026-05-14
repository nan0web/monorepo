/**
 * E2E Smoke Tests — In-Browser Test Runner for @nan0web/ui-lit
 *
 * ALL 25 components, grouped by phase.
 * Tests auto-run on page load, results rendered to DOM.
 *
 * Usage:
 *   pnpm test:e2e        → opens browser, tests auto-run
 *   pnpm dev             → open /e2e/playground.html manually
 */

// ═══════════════════════════════════════════════════════
// TEST RUNNER ENGINE
// ═══════════════════════════════════════════════════════
const groups = []
let currentGroup = null
let totalPassed = 0
let totalFailed = 0

function group(name) {
	currentGroup = { name, tests: [], passed: 0, failed: 0 }
	groups.push(currentGroup)
}

function assert(condition, message) {
	if (!condition) {
		currentGroup.failed++
		totalFailed++
		currentGroup.tests.push({ pass: false, message })
		console.error(`❌ FAIL: [${currentGroup.name}] ${message}`)
	} else {
		currentGroup.passed++
		totalPassed++
		currentGroup.tests.push({ pass: true, message })
	}
}

function assertVisible(el, name) {
	assert(el !== null, `${name} exists in DOM`)
	if (el) {
		const rect = el.getBoundingClientRect()
		assert(rect.width > 0 && rect.height > 0, `${name} is visible`)
	}
}

function assertShadow(el, selector, name) {
	const shadow = el?.shadowRoot
	assert(shadow !== null, `${name} has shadowRoot`)
	if (shadow) {
		const child = shadow.querySelector(selector)
		assert(child !== null, `${name} → ${selector}`)
		return child
	}
	return null
}

// ═══════════════════════════════════════════════════════
// WAIT FOR PLAYGROUND READY
// ═══════════════════════════════════════════════════════
async function waitForReady() {
	await new Promise((resolve) => {
		if (document.body.getAttribute('data-e2e-ready') === 'true') return resolve()
		const obs = new MutationObserver(() => {
			if (document.body.getAttribute('data-e2e-ready') === 'true') {
				obs.disconnect()
				resolve()
			}
		})
		obs.observe(document.body, { attributes: true })
	})
	await new Promise((r) => setTimeout(r, 800))
}

// ═══════════════════════════════════════════════════════
// COMPONENT TESTS — PHASE 1: CORE (9)
// ═══════════════════════════════════════════════════════

function testNav() {
	group('ui-nav')
	const el = document.getElementById('e2e-nav')
	assertVisible(el, 'ui-nav')
	assertShadow(el, 'nav', 'nav element')
	assertShadow(el, '.brand', 'brand')
	assertShadow(el, '.hamburger', 'hamburger')
	assertShadow(el, '.links', 'links')
}

function testSidebar() {
	group('ui-sidebar')
	const el = document.getElementById('e2e-sidebar')
	assertVisible(el, 'ui-sidebar')
	assertShadow(el, '.sidebar', 'container')
	assertShadow(el, '.sidebar-title', 'title')
	const activeLink = assertShadow(el, 'a.active', 'active link')
	if (activeLink) {
		assert(activeLink.getAttribute('aria-current') === 'page', 'aria-current="page"')
	}
}

function testAlert() {
	group('ui-alert')
	const variants = ['info', 'success', 'warning', 'error', 'tip']
	for (const v of variants) {
		const el = document.getElementById(`e2e-alert-${v}`)
		assertVisible(el, `alert[${v}]`)
		assertShadow(el, '.alert', `alert[${v}] inner`)
		assertShadow(el, '[role="alert"]', `alert[${v}] role`)
	}
}

function testMarkdown() {
	group('ui-markdown')
	const el = document.getElementById('e2e-markdown')
	assertVisible(el, 'ui-markdown')
	const prose = assertShadow(el, '.prose', 'prose')
	if (prose) {
		assert(prose.querySelector('h1') !== null, 'renders <h1>')
		assert(prose.querySelector('h2') !== null, 'renders <h2>')
		assert(prose.querySelector('p') !== null, 'renders <p>')
		assert(prose.querySelector('ul') !== null, 'renders <ul>')
		assert(prose.querySelector('li') !== null, 'renders <li>')
	}
}

function testThemeToggle() {
	group('ui-theme-toggle')
	const el = document.getElementById('e2e-theme-toggle')
	assertVisible(el, 'ui-theme-toggle')
	const btn = assertShadow(el, 'button', 'button')
	assert(btn?.getAttribute('aria-label') === 'Toggle theme', 'aria-label')
}

async function testThemeToggleInteraction() {
	const el = document.getElementById('e2e-theme-toggle')
	const btn = el?.shadowRoot?.querySelector('button')
	if (btn) {
		const initial = document.documentElement.getAttribute('data-theme')
		btn.click()
		await new Promise((r) => setTimeout(r, 100))
		const next = document.documentElement.getAttribute('data-theme')
		assert(next !== initial, `theme toggled: ${initial} → ${next}`)
		btn.click()
		await new Promise((r) => setTimeout(r, 100))
	}
}

function testLangSelect() {
	group('ui-lang-select')
	const el = document.getElementById('e2e-lang-select')
	assertVisible(el, 'ui-lang-select')
	const btn = assertShadow(el, 'button', 'trigger')
	assert(btn?.getAttribute('aria-haspopup') === 'listbox', 'aria-haspopup="listbox"')
}

async function testLangSelectInteraction() {
	const el = document.getElementById('e2e-lang-select')
	const btn = el?.shadowRoot?.querySelector('button')
	if (btn) {
		btn.click()
		await new Promise((r) => setTimeout(r, 150))
		const menu = el.shadowRoot.querySelector('.menu.open')
		assert(menu !== null, 'menu opens on click')
		const items = el.shadowRoot.querySelectorAll('.menu-item')
		assert(items.length >= 2, `has ≥2 options (${items.length})`)
		btn.click()
		await new Promise((r) => setTimeout(r, 100))
	}
}

function testBadge() {
	group('ui-badge')
	const all = document.querySelectorAll('ui-badge')
	assert(all.length >= 3, `≥3 badges (${all.length})`)
	for (const b of all) {
		assert(b.shadowRoot !== null, 'has shadowRoot')
	}
}

function testCodeBlock() {
	group('ui-code-block')
	const el = document.getElementById('e2e-code-block')
	assertVisible(el, 'ui-code-block')
	assertShadow(el, '.block', 'wrapper')
	assertShadow(el, 'pre', 'pre')
	assertShadow(el, 'code', 'code')
}

function testTable() {
	group('ui-table')
	const el = document.getElementById('e2e-table')
	assertVisible(el, 'ui-table')
	assertShadow(el, 'table', 'table')
	assertShadow(el, 'thead', 'thead')
	const rows = el?.shadowRoot?.querySelectorAll('tbody tr')
	assert(rows && rows.length === 6, `6 data rows (${rows?.length})`)
}

// ═══════════════════════════════════════════════════════
// COMPONENT TESTS — PHASE 2 WAVE 1: FORMS (5)
// ═══════════════════════════════════════════════════════

function testInput() {
	group('ui-input')
	const el = document.getElementById('e2e-input')
	assertVisible(el, 'ui-input')
	assertShadow(el, 'input', 'inner input')
	assertShadow(el, 'label', 'label')
	assertShadow(el, '.hint', 'hint')
	const all = document.querySelectorAll('ui-input')
	assert(all.length >= 4, `≥4 instances (${all.length})`)
	const err = Array.from(all).find((i) => i.getAttribute('state') === 'error')
	assert(err !== null, 'state="error" exists')
	const ok = Array.from(all).find((i) => i.getAttribute('state') === 'success')
	assert(ok !== null, 'state="success" exists')
}

function testSelect() {
	group('ui-select')
	const el = document.getElementById('e2e-select')
	assertVisible(el, 'ui-select')
	assertShadow(el, '.trigger', 'trigger')
	assertShadow(el, '.dropdown', 'dropdown')
}

async function testSelectInteraction() {
	const el = document.getElementById('e2e-select')
	const trigger = el?.shadowRoot?.querySelector('.trigger')
	if (trigger) {
		trigger.click()
		await new Promise((r) => setTimeout(r, 100))
		const opts = el?.shadowRoot?.querySelectorAll('.option')
		assert(opts && opts.length >= 3, `≥3 options (${opts?.length})`)
		if (opts && opts.length > 0) {
			opts[0].click()
			await new Promise((r) => setTimeout(r, 100))
			assert(el.value !== '', 'value set after selection')
		}
	}
}

function testButton() {
	group('ui-button')
	const el = document.getElementById('e2e-btn-primary')
	assertVisible(el, 'ui-button')
	assertShadow(el, 'button', 'inner button')
	assert(el.getAttribute('variant') === 'primary', 'variant="primary"')
	const all = document.querySelectorAll('ui-button')
	assert(all.length >= 5, `≥5 instances (${all.length})`)
}

async function testButtonInteraction() {
	const el = document.getElementById('e2e-btn-primary')
	let clicked = false
	el.addEventListener(
		'btn-click',
		() => {
			clicked = true
		},
		{ once: true },
	)
	el?.shadowRoot?.querySelector('button')?.click()
	await new Promise((r) => setTimeout(r, 50))
	assert(clicked, 'dispatches btn-click')
}

function testToggle() {
	group('ui-toggle')
	const el = document.getElementById('e2e-toggle')
	assertVisible(el, 'ui-toggle')
	const track = assertShadow(el, '.track', 'track')
	assertShadow(el, '.thumb', 'thumb')
	assert(track?.getAttribute('role') === 'switch', 'role="switch"')
}

async function testToggleInteraction() {
	const el = document.getElementById('e2e-toggle')
	let changed = false
	el.addEventListener(
		'toggle-change',
		() => {
			changed = true
		},
		{ once: true },
	)
	el?.shadowRoot?.querySelector('.track')?.click()
	await new Promise((r) => setTimeout(r, 50))
	assert(changed, 'dispatches toggle-change')
	assert(el.checked === true, 'checked after click')
}

function testConfirm() {
	group('ui-confirm')
	const el = document.getElementById('e2e-confirm')
	assertVisible(el, 'ui-confirm')
	assertShadow(el, '.inline-dialog', 'inline dialog')
	assertShadow(el, '.btn-confirm', 'confirm button')
	assertShadow(el, '.btn-cancel', 'cancel button')
}

async function testConfirmInteraction() {
	const el = document.getElementById('e2e-confirm')
	let result = null
	el.addEventListener(
		'confirm-yes',
		() => {
			result = 'yes'
		},
		{ once: true },
	)
	el?.shadowRoot?.querySelector('.btn-confirm')?.click()
	await new Promise((r) => setTimeout(r, 50))
	assert(result === 'yes', 'dispatches confirm-yes')
}

// ═══════════════════════════════════════════════════════
// COMPONENT TESTS — PHASE 2 WAVE 2: STRUCTURE (5)
// ═══════════════════════════════════════════════════════

function testPage() {
	group('ui-page')
	const el = document.getElementById('e2e-page')
	assertVisible(el, 'ui-page')
	assertShadow(el, '.layout', 'layout')
	assertShadow(el, '.sidebar-area', 'sidebar area')
	assertShadow(el, '.content-area', 'content area')
}

function testCard() {
	group('ui-card')
	const el = document.getElementById('e2e-card')
	assertVisible(el, 'ui-card')
	assertShadow(el, '.card', 'wrapper')
	assertShadow(el, '.card-header', 'header')
	assertShadow(el, '.card-body', 'body')
	assert(el.getAttribute('hoverable') !== null, 'hoverable attr')
}

async function testModal() {
	group('ui-modal')
	const el = document.getElementById('e2e-modal')
	assert(el !== null, 'exists')
	assert(el.open === false, 'initially closed')
	el.open = true
	await new Promise((r) => setTimeout(r, 200))
	const backdrop = el?.shadowRoot?.querySelector('.backdrop')
	assert(backdrop !== null, 'backdrop when open')
	const dialog = el?.shadowRoot?.querySelector('[role="dialog"]')
	assert(dialog !== null, 'role="dialog"')
	assert(dialog?.getAttribute('aria-modal') === 'true', 'aria-modal="true"')
	let closed = false
	el.addEventListener(
		'modal-close',
		() => {
			closed = true
		},
		{ once: true },
	)
	el?.shadowRoot?.querySelector('.close-btn')?.click()
	await new Promise((r) => setTimeout(r, 100))
	assert(closed, 'dispatches modal-close')
	assert(el.open === false, 'closed after close-btn')
}

function testAccordion() {
	group('ui-accordion')
	const el = document.getElementById('e2e-accordion')
	assertVisible(el, 'ui-accordion')
	assertShadow(el, '.accordion', 'wrapper')
	const sections = el?.shadowRoot?.querySelectorAll('.section')
	assert(sections && sections.length === 3, `3 sections (${sections?.length})`)
}

async function testAccordionInteraction() {
	const el = document.getElementById('e2e-accordion')
	const header = el?.shadowRoot?.querySelector('.header')
	if (header) {
		header.click()
		await new Promise((r) => setTimeout(r, 100))
		assert(header.getAttribute('aria-expanded') === 'true', 'expands on click')
	}
}

function testToast() {
	group('ui-toast')
	const el = document.getElementById('e2e-toast-info')
	assertVisible(el, 'ui-toast')
	const inner = assertShadow(el, '.toast', 'inner')
	assert(inner?.getAttribute('role') === 'alert', 'role="alert"')
	assertShadow(el, '.icon', 'icon')
	assertShadow(el, '.body', 'body')
	const all = document.querySelectorAll('ui-toast[open]')
	assert(all.length >= 4, `≥4 open toasts (${all.length})`)
}

// ═══════════════════════════════════════════════════════
// COMPONENT TESTS — PHASE 2 WAVE 3: ADVANCED (6)
// ═══════════════════════════════════════════════════════

function testSpinner() {
	group('ui-spinner')
	const el = document.getElementById('e2e-spinner')
	assertVisible(el, 'ui-spinner')
	assertShadow(el, '.ring', 'ring')
	assertShadow(el, '[role="status"]', 'role="status"')
	assertShadow(el, '.sr-only', 'sr-only')
	const dots = document.querySelector('ui-spinner[variant="dots"]')
	assert(dots !== null, 'dots variant exists')
	assertShadow(dots, '.dots', 'dots inner')
	const pulse = document.querySelector('ui-spinner[variant="pulse"]')
	assert(pulse !== null, 'pulse variant exists')
	assertShadow(pulse, '.pulse', 'pulse inner')
}

function testProgress() {
	group('ui-progress')
	const el = document.getElementById('e2e-progress')
	assertVisible(el, 'ui-progress')
	assertShadow(el, '.track', 'track')
	assertShadow(el, '.fill', 'fill')
	assertShadow(el, '[role="progressbar"]', 'role="progressbar"')
	assertShadow(el, '.label', 'label')
	const ind = document.querySelector('ui-progress[indeterminate]')
	assert(ind !== null, 'indeterminate exists')
}

function testSlider() {
	group('ui-slider')
	const el = document.getElementById('e2e-slider')
	assertVisible(el, 'ui-slider')
	assertShadow(el, "input[type='range']", 'range input')
	assertShadow(el, 'label', 'label')
	assertShadow(el, '.value-label', 'value label')
}

async function testSliderInteraction() {
	const el = document.getElementById('e2e-slider')
	let changed = false
	el.addEventListener(
		'slider-change',
		() => {
			changed = true
		},
		{ once: true },
	)
	const input = el?.shadowRoot?.querySelector("input[type='range']")
	if (input) {
		input.value = '75000'
		input.dispatchEvent(new Event('input', { bubbles: true }))
		await new Promise((r) => setTimeout(r, 50))
		assert(changed, 'dispatches slider-change')
	}
}

function testAutocomplete() {
	group('ui-autocomplete')
	const el = document.getElementById('e2e-autocomplete')
	assertVisible(el, 'ui-autocomplete')
	assertShadow(el, 'input', 'input')
	assertShadow(el, '.dropdown', 'dropdown')
	assert(
		el?.shadowRoot?.querySelector('input')?.getAttribute('role') === 'combobox',
		'role="combobox"',
	)
}

async function testAutocompleteInteraction() {
	const el = document.getElementById('e2e-autocomplete')
	const input = el?.shadowRoot?.querySelector('input')
	if (input) {
		input.value = 'Ки'
		input.dispatchEvent(new Event('input', { bubbles: true }))
		await new Promise((r) => setTimeout(r, 200))
		el._open = true
		await new Promise((r) => setTimeout(r, 100))
		const opts = el?.shadowRoot?.querySelectorAll('.option')
		assert(opts && opts.length >= 1, `filtered ≥1 (${opts?.length})`)
	}
}

function testSortable() {
	group('ui-sortable')
	const el = document.getElementById('e2e-sortable')
	assertVisible(el, 'ui-sortable')
	assertShadow(el, '.list', 'list')
	const items = el?.shadowRoot?.querySelectorAll('.item')
	assert(items && items.length === 5, `5 items (${items?.length})`)
	assertShadow(el, '.handle', 'handle')
	const first = el?.shadowRoot?.querySelector('.item')
	assert(first?.getAttribute('draggable') === 'true', 'draggable="true"')
}

function testTree() {
	group('ui-tree')
	const el = document.getElementById('e2e-tree')
	assertVisible(el, 'ui-tree')
	assertShadow(el, '[role="tree"]', 'role="tree"')
	assertShadow(el, '.node', 'node')
	assertShadow(el, '.toggle-icon', 'toggle icon')
	assertShadow(el, '.node-label', 'node label')
	const expanded = el?.shadowRoot?.querySelectorAll('.children.open')
	assert(expanded && expanded.length >= 1, 'has expanded children')
	const active = el?.shadowRoot?.querySelector('.node.active')
	assert(active !== null, 'has active node')
}

async function testTreeInteraction() {
	const el = document.getElementById('e2e-tree')
	let selected = false
	el.addEventListener(
		'tree-select',
		() => {
			selected = true
		},
		{ once: true },
	)
	el?.shadowRoot?.querySelector('.node')?.click()
	await new Promise((r) => setTimeout(r, 50))
	assert(selected, 'dispatches tree-select')
}

// ═══════════════════════════════════════════════════════
// COMPONENT TESTS — PHASE 3
// ═══════════════════════════════════════════════════════

function testForm() {
	group('ui-form')
	const el = document.getElementById('e2e-form-settings')
	assertVisible(el, 'ui-form')
	assertShadow(el, '.form', 'form wrapper')
}

// ═══════════════════════════════════════════════════════
// RENDER RESULTS
// ═══════════════════════════════════════════════════════
function renderResults() {
	// Sticky bar
	const bar = document.createElement('div')
	bar.id = 'e2e-results'
	bar.setAttribute('data-passed', String(totalPassed))
	bar.setAttribute('data-failed', String(totalFailed))
	const allOk = totalFailed === 0
	bar.style.cssText = `
		position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
		background: ${allOk ? '#198754' : '#dc3545'}; color: #fff;
		padding: 6px 16px; font-family: system-ui, sans-serif;
		display: flex; justify-content: space-between; align-items: center;
		font-weight: 600; font-size: 13px; height: 40px;
		box-shadow: 0 -4px 16px rgba(0,0,0,0.1);
	`
	bar.innerHTML = `
		<span>🧪 E2E: ${totalPassed} passed, ${totalFailed} failed — ${groups.length} components</span>
		<button onclick="document.getElementById('e2e-detail').style.display=document.getElementById('e2e-detail').style.display==='none'?'block':'none'"
			style="background:rgba(255,255,255,0.2);border:none;color:#fff;padding:4px 12px;border-radius:4px;cursor:pointer;font-weight:600;font-size:12px;">
			${allOk ? '✅ Details' : '❌ Show Failures'}
		</button>
	`
	document.body.appendChild(bar)

	// Detail panel
	const detail = document.createElement('div')
	detail.id = 'e2e-detail'
	detail.style.cssText = `
		display: none; position: fixed; bottom: 50px; left: 0; right: 0;
		max-height: 60vh; overflow-y: auto; z-index: 9998;
		background: #1a1a2e; color: #e0e0e0; padding: 20px 24px;
		font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px;
		box-shadow: 0 -8px 32px rgba(0,0,0,0.4);
	`

	let html = ''
	for (const g of groups) {
		const icon = g.failed > 0 ? '❌' : '✅'
		const color = g.failed > 0 ? '#ff6b6b' : '#51cf66'
		html += `<div style="margin-bottom:12px">
			<div style="color:${color};font-weight:700;margin-bottom:4px">
				${icon} ${g.name} — ${g.passed}/${g.passed + g.failed}
			</div>`
		for (const t of g.tests) {
			if (!t.pass) {
				html += `<div style="color:#ff6b6b;padding-left:20px">❌ ${t.message}</div>`
			}
		}
		html += '</div>'
	}
	detail.innerHTML = html
	document.body.appendChild(detail)

	// Console summary
	console.log('\n' + '═'.repeat(50))
	console.log(`🧪 E2E: ${totalPassed} passed, ${totalFailed} failed (${groups.length} components)`)
	console.log('═'.repeat(50))
	for (const g of groups) {
		const icon = g.failed > 0 ? '❌' : '✅'
		console.log(`${icon} ${g.name}: ${g.passed}/${g.passed + g.failed}`)
	}
	if (totalFailed > 0) {
		console.error('\nFailed:')
		for (const g of groups) {
			for (const t of g.tests) {
				if (!t.pass) console.error(`  ❌ [${g.name}] ${t.message}`)
			}
		}
	}
}

// ═══════════════════════════════════════════════════════
// RUN ALL
// ═══════════════════════════════════════════════════════
async function runAllTests() {
	await waitForReady()

	console.log('🧪 Running E2E Smoke Tests (26 components)...\n')

	// Phase 1 — Core (9)
	testNav()
	testSidebar()
	testAlert()
	testMarkdown()
	testThemeToggle()
	await testThemeToggleInteraction()
	testLangSelect()
	await testLangSelectInteraction()
	testBadge()
	testCodeBlock()
	testTable()

	// Phase 2 — Forms (5)
	testInput()
	testSelect()
	await testSelectInteraction()
	testButton()
	await testButtonInteraction()
	testToggle()
	await testToggleInteraction()
	testConfirm()
	await testConfirmInteraction()

	// Phase 2 — Structure (5)
	testPage()
	testCard()
	await testModal()
	testAccordion()
	await testAccordionInteraction()
	testToast()

	// Phase 2 — Advanced (6)
	testSpinner()
	testProgress()
	testSlider()
	await testSliderInteraction()
	testAutocomplete()
	await testAutocompleteInteraction()
	testSortable()
	testTree()
	await testTreeInteraction()

	// Phase 3
	testForm()

	renderResults()
}

runAllTests()
