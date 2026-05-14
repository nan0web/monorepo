// @ts-check
import { test, expect } from '@playwright/test'

test.describe('SortableList Hook E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/play/sortable.html')
	})

	test('should render all model items', async ({ page }) => {
		await expect(page.getByText('Llama 4 Scout 17B')).toBeVisible()
		await expect(page.getByText('Qwen 2.5 Coder 32B')).toBeVisible()
		await expect(page.getByText('DeepSeek R1 Distill 70B')).toBeVisible()
		await expect(page.getByText('Llama 3.3 70B')).toBeVisible()
	})

	test('should move item up', async ({ page }) => {
		// Qwen starts at #2 — move it up to #1
		const upBtn = page.getByLabel('Move Qwen 2.5 Coder 32B up')
		await upBtn.click()

		// Verify Qwen is now first (rank #1)
		const items = page.locator('[style*="border-radius"]').filter({ hasText: /tok\/s/ })
		const first = items.first()
		await expect(first).toContainText('Qwen 2.5 Coder 32B')
	})

	test('should move item down', async ({ page }) => {
		// Llama Scout starts at #1 — move it down to #2
		const downBtn = page.getByLabel('Move Llama 4 Scout 17B down')
		await downBtn.click()

		const items = page.locator('[style*="border-radius"]').filter({ hasText: /tok\/s/ })
		const first = items.first()
		await expect(first).toContainText('Qwen 2.5 Coder 32B')
	})

	test('should reset to original order', async ({ page }) => {
		// Reorder then reset
		await page.getByLabel('Move Qwen 2.5 Coder 32B up').click()
		await page.getByRole('button', { name: 'Reset order' }).click()

		const items = page.locator('[style*="border-radius"]').filter({ hasText: /tok\/s/ })
		const first = items.first()
		await expect(first).toContainText('Llama 4 Scout 17B')
	})

	test('should disable up button for first item', async ({ page }) => {
		const upBtn = page.getByLabel('Move Llama 4 Scout 17B up')
		await expect(upBtn).toBeDisabled()
	})

	test('should disable down button for last item', async ({ page }) => {
		const downBtn = page.getByLabel('Move Llama 3.3 70B down')
		await expect(downBtn).toBeDisabled()
	})
})
