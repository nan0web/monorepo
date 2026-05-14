import { test, expect } from '@playwright/test'

test.describe('NaN0 Editor: Advanced UX v0.4.6', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		// Wait for initial load UI
		await page.waitForSelector('nan0-editor-item', { state: 'visible' })
		// Wait for loading overlay to hide
		const overlay = page.locator('.loading-overlay').first()
		await expect(overlay).toBeHidden()
	})

	test('should autofocus on title correctly', async ({ page }) => {
		// Verify focus via Playwright's :focus pseudo-class
		const titleFocused = page.locator('nan0-editor-item textarea:focus')
		await expect(titleFocused).toBeVisible()
	})

	test('should parse tags into badges on blur', async ({ page }) => {
		const tagsInput = page.locator('input[placeholder="Tag 1, Tag 2, ..."]').first()
		await tagsInput.fill('red, green blue')

		// Blur by clicking header
		await page.click('header', { position: { x: 5, y: 5 } })

		const badges = page.locator('.badge')
		await expect(badges).toHaveCount(3)
		await expect(badges.first()).toContainText('#red')
	})

	test('should navigate to nested and back with Esc', async ({ page }) => {
		// Click Jump (🔗)
		await page.click('button.link')

		// Wait for Level 2 load
		const nestedHeader = page.locator('header').last()
		await expect(nestedHeader).toContainText('authors/yaro.json')

		// Global Escape to return
		await page.keyboard.press('Escape')

		// Check that we are back at Level 1 (sample.json)
		const mainHeader = page.locator('header').first()
		await expect(mainHeader).toContainText('sample.json')
	})
})
