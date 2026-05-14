
import { test, expect } from '@playwright/test';

test.describe('Demo App', () => {

    test('should load the demo app shell', async ({ page }) => {
        // Capture logs
        page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
        page.on('pageerror', err => console.error(`[BROWSER ERROR] ${err.message}`));

        await page.goto('/play/demo-app.html');
        // Check header
        await expect(page.locator('h1')).toHaveText('Demo App');
    });

    test('should render SimpleApp content with debug', async ({ page }) => {

        const logs = [];
        page.on('console', msg => {
            const text = msg.text();
            console.log(`[BROWSER] ${text}`);
            logs.push(text);
        });
        page.on('pageerror', err => {
            console.error(`[BROWSER ERROR] ${err.message}`);
            logs.push(`ERROR: ${err.message}`);
        });

        await page.goto('/play/demo-app.html');

        try {
            await expect(page.getByText('SimpleApp: Simple')).toBeVisible({ timeout: 5000 });
        } catch (e) {
            console.log('--- TEST FAILED ---');
            console.log('Logs captured:', logs);

            // Check for Alerts explicitly
            const alerts = await page.locator('.alert').allInnerTexts();
            if (alerts.length > 0) {
                console.log('ALERTS FOUND ON PAGE:', alerts);
            } else {
                console.log('NO ALERTS FOUND.');
            }

            // Dump HTML content
            const content = await page.content();
            console.log('PAGE CONTENT DUMP:', content);
            throw e;
        }
    });

    test('should rotate theme', async ({ page }) => {
        await page.goto('/play/demo-app.html');
        await page.getByRole('link', { name: 'Theme' }).click();
        await expect(page.getByRole('heading', { name: 'Theme Switcher' })).toBeVisible();
        await page.getByRole('button', { name: 'Toggle Theme' }).click();
        // Check computed style
        await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(26, 26, 26)'); // #1a1a1a
    });

});
