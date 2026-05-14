import { test, expect } from '@playwright/test'

test.describe('Editor Item (Details)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		// Ensure we are viewing the EditorItem component in the sandbox
		await page.click('#btn-item')
	})

	test('Should render placeholder texts matching the domain model `AppModel`', async ({ page }) => {
		const frame = page.locator('.frame').locator('nan0-editor-item')

		// The title field should have placeholder "Enter title..." (from AppModel)
		const titleInput = frame.locator('input[placeholder="Enter title..."]')
		await expect(titleInput).toBeVisible()

		// The description textarea should have placeholder "Markdown content..."
		const descTextarea = frame.locator('textarea[placeholder="Markdown content..."]')
		await expect(descTextarea).toBeVisible()

		// Tags should have "#tag1, #tag2..."
		const tagsInput = frame.locator('input[placeholder="#tag1, #tag2..."]')
		await expect(tagsInput).toBeVisible()
	})

	test('Should fetch abstract data correctly', async ({ page }) => {
		const frame = page.locator('.frame').locator('nan0-editor-item')
		// Since our DBBrowser fetches sandbox-item.yaml / json
		// the title should eventually load to "Sovereign Web"
		const titleInput = frame.locator('input[placeholder="Enter title..."]')
		await expect(titleInput).toHaveValue('Sovereign Web', { timeout: 3000 })
	})
})
