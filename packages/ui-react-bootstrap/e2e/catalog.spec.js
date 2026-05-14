// @ts-check
import { test, expect } from '@playwright/test'

test.describe('Catalog Playground E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Go directly to the playground index
		await page.goto('/')
	})

	test('should render the catalog title', async ({ page }) => {
		// Ensure catalog header is visible
		const header = page.getByRole('heading', { name: 'Каталог Блоків OLMUI' })
		await expect(header).toBeVisible()
	})

	test('should display dual code blocks with JSX and JSON', async ({ page }) => {
		// Description block is present
		const descBlock = page.locator('#block-description')
		await expect(descBlock).toBeVisible()

		// Check for JSX and JSON cards within the block
		await expect(descBlock.getByText('JSX').first()).toBeVisible()
		await expect(descBlock.getByText('Meta Data (JSON)').first()).toBeVisible()

		// Ensure "doc" property is used instead of "page" in JSX code
		await expect(descBlock.filter({ hasText: 'doc={{ description:' }).first()).toBeVisible()
	})

	test('should auto-wrap ul/ol strings into li elements', async ({ page }) => {
		const contentBlock = page.locator('#block-content')
		await expect(contentBlock).toBeVisible()

		// In the lists example, we expect "Вік від 21 до 65 років" to be wrapped in an <li> inside <ul>
		const listsExample = contentBlock.locator('.example-preview').first()
		const listItem = listsExample.locator('ul > li').filter({ hasText: 'Вік від 21 до 65 років' })
		await expect(listItem).toBeVisible()

		// ol list item check
		const olListItem = listsExample.locator('ol > li').filter({ hasText: 'Подати заявку онлайн' })
		await expect(olListItem).toBeVisible()
	})

	test('should render tables with thead and tbody', async ({ page }) => {
		const contentBlock = page.locator('#block-content')
		await expect(contentBlock).toBeVisible()

		// Test simple default table (second example now)
		const simpleTableExample = contentBlock.locator('.example-preview').nth(1)
		const simpleTable = simpleTableExample.locator('table.table-striped')
		await expect(simpleTable).toBeVisible()
		await expect(simpleTable.locator('tbody td').filter({ hasText: 'Стандарт' })).toBeVisible()

		// Test complex table with custom class (third example now)
		const complexTableExample = contentBlock.locator('.example-preview').nth(2)
		const complexTable = complexTableExample.locator('table.table-dark')
		await expect(complexTable).toBeVisible()
		await expect(complexTable.locator('thead th').filter({ hasText: 'Назва' })).toBeVisible()
		await expect(complexTable.locator('tbody td').filter({ hasText: 'Ощадний' })).toBeVisible()
	})

	test('should parse markdown links in Files block and display customized title', async ({
		page,
	}) => {
		const filesBlock = page.locator('#block-files')
		await expect(filesBlock).toBeVisible()

		const firstExample = filesBlock.locator('.example-preview').first()

		// "[Тарифи банку (PDF)](/tariffs.pdf)" should become <a href="/tariffs.pdf">Тарифи банку (PDF)</a>
		const mdLink = firstExample.locator('a[href="/tariffs.pdf"]')
		await expect(mdLink).toBeVisible()
		await expect(mdLink).toHaveText('Тарифи банку (PDF)')

		// Second example - checks customized title from doc.filesTitle
		const secondExample = filesBlock.locator('.example-preview').nth(1)
		await expect(secondExample.locator('h5')).toHaveText('📎 Договори')
	})

	test('should render format highlights (e.g., spans and bold) in Features', async ({ page }) => {
		const featuresBlock = page.locator('#block-features')
		await expect(featuresBlock).toBeVisible()

		const formatExample = featuresBlock.locator('.example-preview').nth(1)

		// Ensure bold text is wrapped in <b>
		const boldText = formatExample.locator('b').filter({ hasText: 'Гарантована безпека' })
		await expect(boldText).toBeVisible()

		// Ensure nested spans working
		const spanText = formatExample.locator('span').filter({ hasText: 'Підтримка двох мов (UK/EN)' })
		await expect(spanText).toBeVisible()
	})

	test('should toggle locale and update text', async ({ page }) => {
		const priceBlock = page.locator('#block-price')
		await expect(priceBlock).toBeVisible()

		// By default uk
		await expect(priceBlock.getByText('Ціна:', { exact: true }).first()).toBeVisible()

		// Third example: check if price renders with symbol
		const thirdExample = priceBlock.locator('.example-preview').nth(2)
		await expect(thirdExample.locator('span.fw-bold').first()).toContainText('1 500 $')

		// Click toggle
		await page.getByRole('button', { name: '🇺🇦 UK → EN' }).click()

		// Verify string changes
		await expect(priceBlock.getByText('Price:', { exact: true }).first()).toBeVisible()

		// Verify third example changed translation but kept symbol
		await expect(thirdExample.locator('span.fw-bold').first()).toContainText('1 500 $')

		// Check toggle button changed
		await expect(page.getByRole('button', { name: '🇬🇧 EN → UK' })).toBeVisible()
	})

	test('should render new phase 2 components', async ({ page }) => {
		// Callout
		const calloutBlock = page.locator('#block-callout')
		await expect(calloutBlock).toBeVisible()
		await expect(calloutBlock.getByText('This is a critical error message.').first()).toBeVisible()

		// Markdown
		const mdBlock = page.locator('#block-markdown')
		await expect(mdBlock).toBeVisible()
		const boldElement = mdBlock.locator('strong').filter({ hasText: /bold/i }).first()
		await expect(boldElement).toBeVisible()

		// ThemeToggle
		const themeBlock = page.locator('#block-themetoggle')
		await expect(themeBlock).toBeVisible()
		const toggleBtns = themeBlock.locator('button[aria-label="Toggle theme"]')
		await expect(toggleBtns).toHaveCount(1)

		// LangSelect
		const langBlock = page.locator('#block-langselect')
		await expect(langBlock).toBeVisible()
		await expect(
			langBlock.locator('button.dropdown-toggle').filter({ hasText: 'UK' }),
		).toBeVisible()

		// SearchWidget
		const searchBlock = page.locator('#block-search')
		await expect(searchBlock).toBeVisible()
		const searchInput = searchBlock.locator('input[type="search"]').first()
		await expect(searchInput).toHaveValue('')
		await searchInput.fill('депозит')
		await expect(searchBlock.getByText('Депозит "Прибутковий"').first()).toBeVisible()
	})
})
