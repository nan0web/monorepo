import { test, describe } from 'node:test'
import { chromium } from 'playwright'
import { verifyScreenshot } from '@nan0web/play'
import { Engine } from '../src/index.js'
import childProcess from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'

describe('Web Sandbox E2E', async () => {
	let browser, page, serverProcess
	const cwd = process.cwd()
	const PORT = 3010
	const url = `http://127.0.0.1:${PORT}`

	const startServer = () => {
		return new Promise((resolve, reject) => {
			serverProcess = childProcess.spawn('node', ['play/web.js'], {
				cwd,
				env: { ...process.env, PORT: String(PORT) },
			})
			serverProcess.stdout.on('data', (d) => {
				const str = d.toString()
				if (str.includes('Advanced Web SSR running')) {
					resolve()
				}
			})
			serverProcess.stderr.on('data', (d) => reject(new Error(d.toString())))
			setTimeout(() => resolve(), 4000)
		})
	}

	test('renders HTML and takes snapshot of all navigation links across viewports', async () => {
		await startServer()
		browser = await chromium.launch()
		page = await browser.newPage()

		await page.goto(url)
		await page.waitForSelector('nav a')

		const links = await page.evaluate(() => {
			return Array.from(document.querySelectorAll('nav a')).map((a) => ({
				href: a.href,
				// use clean relative path for naming
				label:
					a.href
						.split('/')
						.slice(3)
						.join('_')
						.replace(/[^a-zA-Z0-9_\-]/g, '_') || 'home',
			}))
		})

		const results = []

		const takeScreenshots = async (width, prefix) => {
			await page.setViewportSize({ width, height: 800 })
			console.log(`📸 Taking screenshots for ${width}px (${prefix})...`)

			for (const link of links) {
				await page.goto(link.href)
				await page.waitForLoadState('networkidle')
				// Basic wait for transitions like mobile menu closing
				await new Promise((r) => setTimeout(r, 200))

				const name = `web-${width}-${link.label}`
				const subDir = path.join(cwd, 'snapshots', 'play', 'web', prefix)

				await verifyScreenshot({
					page,
					name,
					fullPage: true,
					snapshotDir: subDir,
				})

				results.push({ name, width, prefix, relPath: `snapshots/play/web/${prefix}/${name}.png` })
			}
		}

		await takeScreenshots(370, 'mobile')
		await takeScreenshots(768, 'mobile')
		await takeScreenshots(1024, 'desktop')
		await takeScreenshots(1200, 'desktop')
		await takeScreenshots(1920, 'desktop')

		await browser.close()
		serverProcess.kill()

		// Generate Visual Gallery markdown
		console.log('Generating snapshot-play.md gallery...')
		let md = '# App Sandbox Visual Gallery\n\n'

		const grouped = results.reduce((acc, curr) => {
			if (!acc[curr.label]) acc[curr.label] = []
			acc[curr.label].push(curr)
			return acc
		}, {})

		for (const [label, shots] of Object.entries(grouped)) {
			md += `## \`${label}\` View \n\n`
			for (const shot of shots) {
				md += `### ${shot.prefix.toUpperCase()} - ${shot.width}px\n`
				md += `![${shot.name}](${shot.relPath})\n\n`
			}
		}
		fs.writeFileSync(path.join(cwd, 'snapshot-play.md'), md)
	})
})
