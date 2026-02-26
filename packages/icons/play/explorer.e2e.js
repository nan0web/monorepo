import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const DEV_SERVER_URL = 'http://127.0.0.1:39111/play/index.html'

describe('Universal Icon Explorer E2E', () => {
	let browser
	let page

	before(async () => {
		browser = await chromium.launch()
		page = await browser.newPage()
	})

	after(async () => {
		if (browser) await browser.close()
	})

	test('renders sidebar with filters initialized', async () => {
		await page.goto(DEV_SERVER_URL)

		// Sidebar should exist and contain filters
		const sidebar = page.locator('aside')
		await sidebar.waitFor({ state: 'visible' })

		const bsFilter = page.locator('label.filter-item').first()
		await bsFilter.waitFor({ state: 'visible' })

		// The checkbox should be checked by default
		const bsCheckbox = bsFilter.locator('input[type="checkbox"]')
		const isChecked = await bsCheckbox.isChecked()
		assert.equal(isChecked, true, 'Filter should be enabled by default')
	})

	test('renders icon grid', async () => {
		// Wait for grid container
		const grid = page.locator('.grid')
		await grid.waitFor({ state: 'visible' })

		// Wait for at least one icon card to render from the initial batch
		const firstCard = grid.locator('.icon-card').first()
		await firstCard.waitFor({ state: 'visible' })

		const count = await grid.locator('.icon-card').count()
		assert.ok(count > 0, 'Grid should render icon cards')
	})

	test('search filters icons by name', async () => {
		const searchInput = page.locator('#search')
		await searchInput.waitFor({ state: 'visible' })

		// Type 'BsBank'
		await searchInput.fill('BsBank2')

		// Wait for debounce and DOM update
		await page.waitForTimeout(500)

		const grid = page.locator('.grid')
		const cards = grid.locator('.icon-card')
		const count = await cards.count()

		assert.ok(count >= 1, 'Should find at least 1 icon matching BsBank2')

		// Verify name contains search terms or matches exactly
		const firstNameText = await cards.first().locator('.name').textContent()
		assert.ok(firstNameText.includes('BsBank'), 'Rendered icon should match search query')
	})

	test('search filters by tags (mobile/phone)', async () => {
		const searchInput = page.locator('#search')
		await searchInput.fill('mobile')
		await page.waitForTimeout(500)

		const grid = page.locator('.grid')
		const cards = grid.locator('.icon-card')
		const count = await cards.count()

		assert.ok(count > 0, 'Should find icons tagged with mobile')

		// Click the first one to open modal
		await cards.first().click()

		// Wait for modal to be active
		const panel = page.locator('#panel')
		await expectClass(panel, 'active', true)

		// Check that Lit snippet contains import
		const litSnippet = await page.locator('#code-lit').textContent()
		assert.ok(litSnippet.includes('import'), 'Snippet should contain import statement')

		// Close modal
		await page.locator('#close-btn').click()
		await expectClass(panel, 'active', false)
	})

	// Helper for checking class presence with retry
	async function expectClass(locator, className, shouldHave = true) {
		const result = await locator.evaluate(
			(node, args) => node.classList.contains(args.className) === args.shouldHave,
			{ className, shouldHave },
		)
		assert.ok(result, `Element class ${className} presence should be ${shouldHave}`)
	}
})
