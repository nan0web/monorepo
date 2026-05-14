import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const DEV_SERVER_URL = 'http://127.0.0.1:5021'

describe('Editor Lit UI E2E', () => {
	let browser
	let page

	before(async () => {
		browser = await chromium.launch()
		page = await browser.newPage()
		page.on('console', (msg) => console.log('BROWSER_CONSOLE:', msg.text()))
		page.on('pageerror', (err) => console.log('BROWSER_ERROR:', err))
	})

	after(async () => {
		if (browser) await browser.close()
	})

	test('renders playground title and editor successfully', async () => {
		await page.goto(DEV_SERVER_URL)

		const title = page.locator('editor-playground').locator('h1')
		await title.waitFor({ state: 'visible' })
		const titleText = await title.textContent()
		assert.equal(titleText, 'Editor Playground (Lit Core)', 'Playground title should be displayed')

		const editorTools = page.locator('editor-playground').locator('.editor-toolbar')
		await editorTools.waitFor({ state: 'visible' })
		const toolButtons = await editorTools.locator('button').count()
		assert.ok(toolButtons > 0, 'Editor tools view buttons should render')
	})

	test('interacts with preview and code modes', async () => {
		const playground = page.locator('editor-playground')

		// Verify code mode button works
		const codeModeBtn = playground.locator('button').filter({ hasText: 'Code View' })
		await codeModeBtn.click()

		// Verify preview mode button works
		const previewModeBtn = playground.locator('button').filter({ hasText: 'Visual Editor' })
		await previewModeBtn.click()

		// In preview mode we should see some content based on the mock data
		const previewSection = playground.locator('.editor-preview pre')
		await previewSection.waitFor({ state: 'visible' })

		const textContent = await previewSection.textContent()
		assert.ok(
			textContent.includes('Lit Web UI Playground'),
			'Preview content from the model should be rendered in the document tree',
		)
	})

	test('interacts with visual editor blocks', async () => {
		const playground = page.locator('editor-playground')

		const visualEditor = playground.locator('.visual-editor')
		await visualEditor.waitFor({ state: 'visible' })

		// Check initial blocks
		const blocks = visualEditor.locator('.editor-block')
		const initialCount = await blocks.count()
		assert.equal(initialCount, 2, 'Should start with 2 editor blocks')

		// Add new block
		const addBtn = playground.locator('.component-palette button').filter({ hasText: '+ text' })
		await addBtn.click()

		const newCount = await blocks.count()
		assert.equal(newCount, 3, 'Should have 3 blocks after adding one')

		// Modify input of first block
		const firstInput = blocks.first().locator('input[type="text"]')
		await firstInput.fill('Updated lit content')

		// Check preview
		const previewSection = playground.locator('.editor-preview pre')
		const previewText = await previewSection.textContent()
		assert.ok(
			previewText.includes('Updated lit content'),
			'Preview should reflect updated block content',
		)

		// Delete block
		const deleteBtn = blocks.first().locator('button').filter({ hasText: '×' })
		await deleteBtn.click()

		const finalCount = await blocks.count()
		assert.equal(finalCount, 2, 'Should have 2 blocks after deleting one')

		const finalPreviewText = await previewSection.textContent()
		assert.ok(
			!finalPreviewText.includes('Updated lit content'),
			'Preview should reflect deleted block content',
		)
	})
})
