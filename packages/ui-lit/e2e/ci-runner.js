#!/usr/bin/env node
/**
 * CI Headless E2E Runner for @nan0web/ui-lit
 *
 * Opens playground.html in a real browser, waits for in-browser tests,
 * reads data-passed / data-failed from DOM, exits with code 0 or 1.
 *
 * Usage: node e2e/ci-runner.js [--port 4260]
 */
const { chromium } = require('playwright')

const port = process.argv.includes('--port')
	? process.argv[process.argv.indexOf('--port') + 1]
	: '4260'

;(async () => {
	const browser = await chromium.launch()
	const page = await browser.newPage()

	page.on('console', (msg) => {
		if (msg.type() === 'error') console.error(msg.text())
	})
	page.on('pageerror', (err) => console.error('PAGE ERROR:', err.message))

	try {
		await page.goto(`http://localhost:${port}/e2e/playground.html`, {
			waitUntil: 'load',
		})

		await page.waitForSelector('#e2e-results', { timeout: 15000 })

		const passed = await page.$eval('#e2e-results', (el) => el.getAttribute('data-passed'))
		const failed = await page.$eval('#e2e-results', (el) => el.getAttribute('data-failed'))

		console.log(`\n🧪 E2E CI: ${passed} passed, ${failed} failed\n`)

		if (failed !== '0') {
			const details = await page.$$eval('#e2e-detail div[style*="ff6b6b"]', (els) =>
				els.map((el) => el.textContent.trim()),
			)
			details.forEach((d) => console.error(`  ${d}`))
			process.exitCode = 1
		}
	} catch (e) {
		console.error('CI RUNNER ERROR:', e.message)
		process.exitCode = 1
	}

	await browser.close()
})()
