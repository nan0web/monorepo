import { test, expect } from '@playwright/test'

test.describe('Geodesic Dome Calculator E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		page.on('console', msg => {
			console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`)
		})
		page.on('pageerror', err => {
			console.error(`[BROWSER ERROR] ${err.message}`)
		})
		// Navigate to the Ukrainian dome calculator page
		await page.goto('/uk/dome')
	})

	test('should render calculator header and default results', async ({ page }) => {
		// Check that the calculator element exists
		const calcHeader = page.locator('h3.title-accent')
		await expect(calcHeader).toContainText('Геодезичний Купольний Калькулятор')

		// Default values: radius 4.5, floors 2, basement true
		// Verify height
		await expect(page.locator('.result-item:has-text("Висота купола")').locator('.result-val')).toContainText('4.5 м')

		// Verify volume: (2/3) * pi * 4.5^3 = 190.9 m3
		await expect(page.locator('.result-item:has-text("Об\'єм купола (півсфера)")').locator('.result-val')).toContainText('190.9 м³')

		// Verify surface area: 2 * pi * 4.5^2 = 127.2 m2
		await expect(page.locator('.result-item:has-text("Площа поверхні купола")').locator('.result-val')).toContainText('127.2 м²')

		// Verify basement area: pi * 4.5^2 = 63.6 m2
		await expect(page.locator('.result-item:has-text("Площа підвалу")').locator('.result-val')).toContainText('63.6 м²')
	})

	test('should dynamically update results when inputs change', async ({ page }) => {
		// Change radius to 6
		const radiusSlider = page.locator('input[type="range"]').first()
		await radiusSlider.fill('6')

		// Change floors to 3
		const floorsSlider = page.locator('input[type="range"]').nth(1)
		await floorsSlider.fill('3')

		// Uncheck basement
		const basementCheckbox = page.locator('input[type="checkbox"]')
		await basementCheckbox.uncheck()

		// Verify new height: 6.0 m
		await expect(page.locator('.result-item:has-text("Висота купола")').locator('.result-val')).toContainText('6.0 м')

		// Verify new volume: (2/3) * pi * 6^3 = 452.4 m3
		await expect(page.locator('.result-item:has-text("Об\'єм купола (півсфера)")').locator('.result-val')).toContainText('452.4 м³')

		// Verify total floor area (without basement): 113.1 + 84.8 = 197.9 m2
		await expect(page.locator('.result-item:has-text("Загальна площа поверхів")').locator('.result-val')).toContainText('197.9 м²')

		// Verify that basement area result item is no longer visible
		await expect(page.locator('.result-item >> text=Площа підвалу')).toHaveCount(0)
	})
})
