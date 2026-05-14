// @ts-check
import { test, expect } from '@playwright/test'

test.describe('Header OLMUI Component E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Go directly to the isolated Header playground example
		// This ensures we test the component without layout noise
		await page.goto('/?isolate=block-header')
	})

	test('should render multi-line navigation items cleanly and allow toggling', async ({ page }) => {
		// Wait for the block to appear
		const headerBlock = page.locator('#block-header')
		await expect(headerBlock).toBeVisible()

		// Locate the "Додаток банку" preview inside the second Example
		// We target the nav item "Приватним клієнтам" (or its English equivalent)
		const privateClientsTab = page
			.locator('.main-nav .dropdown-toggle')
			.filter({ hasText: /Приватним клієнтам|Private clients/i })
		await expect(privateClientsTab).toBeVisible()

		// Verify the element allows wrapping
		// Instead of strict CSS testing, we just see if the bounding box has a healthy height
		// (e.g. at least 85px which is our nav-height variable, meaning it didn't collapse or explode)
		const box = await privateClientsTab.boundingBox()
		expect(box.height).toBeGreaterThanOrEqual(80)

		// Test click interaction to open dropdown
		await privateClientsTab.click()

		// The active class or .show should be present
		await expect(privateClientsTab).toHaveClass(/show/)
	})

	test('should display Contacts and License items that do not have dropdowns', async ({ page }) => {
		await page.goto('/?isolate=block-header')

		const contactsTab = page
			.locator('.main-nav .nav-link')
			.filter({ hasText: /Контакти|Contacts/i })
		await expect(contactsTab).toBeVisible()

		// It shouldn't be a dropdown toggle
		await expect(contactsTab).not.toHaveClass(/dropdown-toggle/)
	})
})
