// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Sandbox E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Go directly to sandbox page
        await page.goto('/play/sandbox.html');
    });

    test('should render sandbox title', async ({ page }) => {
        // Try English first, then Ukrainian if it fails (default might vary)
        const titleEn = page.getByRole('heading', { name: 'Component Sandbox' });
        const titleUk = page.getByRole('heading', { name: 'Пісочниця Компонентів' });

        await expect(titleEn.or(titleUk)).toBeVisible();
    });

    test('should handle TreeView expansion', async ({ page }) => {
        // Find 'src' folder
        const srcFolder = page.getByText('src');
        await expect(srcFolder).toBeVisible();

        // Click to expand
        await srcFolder.click();

        // Check if child is visible
        await expect(page.getByText('App.js')).toBeVisible();

        // Click to collapse
        await srcFolder.click();
        await expect(page.getByText('App.js')).not.toBeVisible();
    });

    test('should handle Autocomplete search', async ({ page }) => {
        // Detect current language to use correct placeholder
        const isUk = await page.getByText('Пісочниця Компонентів').isVisible();
        const placeholder = isUk ? 'Шукати фрукти...' : 'Search fruits...';

        const input = page.getByPlaceholder(placeholder);
        await expect(input).toBeVisible();

        // Type 'App'
        await input.fill('App');

        // Check if Apple is visible
        const appleOption = page.getByText('Apple');
        await expect(appleOption).toBeVisible();

        // Check if Banana is NOT visible
        await expect(page.getByText('Banana')).not.toBeVisible();

        // Select Apple
        await appleOption.click();

        // Input should now contain 'Apple'
        await expect(input).toHaveValue('Apple');
    });

    test('should support language switching', async ({ page }) => {
        // Switch to UK
        await page.getByRole('button', { name: 'UK' }).click();
        await expect(page.getByRole('heading', { name: 'Пісочниця Компонентів' })).toBeVisible();

        // Switch back to EN
        await page.getByRole('button', { name: 'EN' }).click();
        await expect(page.getByRole('heading', { name: 'Component Sandbox' })).toBeVisible();
    });
});
