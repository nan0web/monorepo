import { test, expect } from '@playwright/test'

test.describe('Playground Components', () => {
    test('Modal should open and close', async ({ page }) => {
        await page.goto('/play/modals.html')

        // Button to open modal
        const openButton = page.getByRole('button', { name: 'Open Modal Window' })
        await expect(openButton).toBeVisible()
        await openButton.click()

        // Modal content should be visible
        const modalContent = page.getByTestId('modal-content')
        await expect(modalContent).toBeVisible()
        await expect(modalContent).toContainText('This is the modal content')

        // Close button inside modal
        const closeButton = modalContent.getByRole('button', { name: 'Close' })
        await closeButton.click()

        // Modal should be closed
        await expect(modalContent).not.toBeVisible()
    })

    test('Cards should render content', async ({ page }) => {
        await page.goto('/play/cards.html')

        // Verify page loaded
        await expect(page.getByRole('heading', { name: 'Card Component' })).toBeVisible()

        // Check for specific card content
        await expect(page.getByText('Card title')).toBeVisible()
        await expect(page.getByText('Card content goes here.')).toBeVisible()

        // Check for image card
        await expect(page.getByText('Card with an image.')).toBeVisible()
        const img = page.locator('img[alt="Sample image"]')
        await expect(img).toBeVisible()
    })

    test('Checkboxes should toggle state', async ({ page }) => {
        await page.goto('/play/checkboxes.html')

        // First checkbox (Unchecked) - it is the first one
        // Since we have multiple checkboxes, let's find them by containment or order.
        // The page has h2 headers.

        // Find checkbox under "Unchecked Checkbox"
        // We can look for input[type=checkbox]
        const checkboxes = page.locator('input[type="checkbox"]')

        // 1st checkbox: starts unchecked
        const cb1 = checkboxes.nth(0)
        await expect(cb1).not.toBeChecked()
        await cb1.click()
        await expect(cb1).toBeChecked()

        // 2nd checkbox: starts checked
        const cb2 = checkboxes.nth(1)
        await expect(cb2).toBeChecked()
        await cb2.click()
        await expect(cb2).not.toBeChecked()
    })

    test('Radios should toggle state and sync in groups', async ({ page }) => {
        await page.goto('/play/radios.html')

        // Verify page loaded
        await expect(page.getByRole('heading', { name: 'Radio Component' })).toBeVisible()

        const radios = page.locator('input[type="radio"]')

        // 1st radio: name=demo1 (Single)
        const r1 = radios.nth(0)
        await expect(r1).toHaveAttribute('name', 'demo1')
        await expect(r1).not.toBeChecked()
        await r1.click()
        await expect(r1).toBeChecked()

        // Single radio TOGGLE: click again to uncheck
        await r1.click()
        await expect(r1).not.toBeChecked()

        // Group group1 (Option A, B, C)
        const optA = radios.nth(1) // group1, Option A, starts checked
        const optB = radios.nth(2) // group1, Option B

        await expect(optA).toBeChecked()
        await expect(optB).not.toBeChecked()

        // Click Option B
        await optB.click()

        // Now B should be checked, and A should be UNCHECKED
        await expect(optB).toBeChecked()
        await expect(optA).not.toBeChecked()

        // Click Option A back
        await optA.click()
        await expect(optA).toBeChecked()
        await expect(optB).not.toBeChecked()

        // 5th radio: name=demo2 (Disabled but checked)
        const r5 = radios.nth(4)
        await expect(r5).toHaveAttribute('name', 'demo2')
        await expect(r5).toBeChecked()
        await expect(r5).toBeDisabled()
    })
    test('Selects should render and work', async ({ page }) => {
        await page.goto('/play/selects.html')
        await expect(page.getByRole('heading', { name: 'Select Component' })).toBeVisible()

        const select = page.locator('select').first()
        await expect(select).toBeVisible()

        // Select 'Option 2'
        await select.selectOption({ label: 'Option 2' })
        await expect(select).toHaveValue('option2')

        // Check dynamic select
        // Wait for dynamic options to load (they have "Ruby ❤️")
        const dynamicSelect = page.locator('select').nth(1)
        await expect(dynamicSelect.getByRole('option', { name: 'Ruby ❤️' })).toBeVisible({ timeout: 5000 })
    })

    test('TextAreas should render and accept input', async ({ page }) => {
        await page.goto('/play/textareas.html')
        await expect(page.getByRole('heading', { name: 'TextArea Component' })).toBeVisible()

        const textarea = page.locator('textarea').first()
        await expect(textarea).toBeVisible()
        // Check placeholder
        await expect(textarea).toHaveAttribute('placeholder', 'Enter your message here...')
        // Type text
        await textarea.fill('Hello World')
        await expect(textarea).toHaveValue('Hello World')
    })

    test('Index page should render code blocks', async ({ page }) => {
        await page.goto('/play/index.html')
        // Check for "Document" code block
        await expect(page.getByText('Document', { exact: true }).locator('xpath=..')).toContainText('Document')
        // Since we split it into spans/code, we can check visibility of text
        await expect(page.getByText('This playground uses the standard')).toBeVisible()
        // Code tag presence check (using css selector 'code')
        const codes = page.locator('code')
        await expect(codes.filter({ hasText: 'Document' })).toBeVisible()
        await expect(codes.filter({ hasText: 'Components' })).toBeVisible()
        await expect(codes.filter({ hasText: '_.json' })).toBeVisible()
    })

    test('Tooltips and groups', async ({ page }) => {
        // Button tooltip
        await page.goto('/play/buttons.html')
        const btn = page.getByRole('button', { name: 'Primary Action' })
        await expect(btn).toHaveAttribute('title', 'This is a primary action tooltip')

        // Checkbox tooltip
        await page.goto('/play/checkboxes.html')
        const cb = page.locator('input[type="checkbox"]').first()
        await expect(cb).toHaveAttribute('title', 'Click to enable feature X')

        // Radio group behavior
        await page.goto('/play/radios.html')
        const group = page.locator('input[name="group1"]')
        const rA = group.nth(0)
        const rB = group.nth(1)

        await expect(rA).toBeChecked()
        await expect(rB).not.toBeChecked()

        await rB.click()
        await expect(rB).toBeChecked()
        await expect(rA).not.toBeChecked()

        await expect(rB).toHaveAttribute('title', 'Option B')
    })

    test('ActionLogger should show interaction feedback', async ({ page }) => {
        await page.goto('/play/buttons.html')

        const loggerHeader = page.getByText('Interaction Logs')
        await expect(loggerHeader).not.toBeVisible()

        await page.getByRole('button', { name: 'Primary Action' }).click()

        await expect(loggerHeader).toBeVisible()
        await expect(page.getByText('Button Click')).toBeVisible()
    })
})
