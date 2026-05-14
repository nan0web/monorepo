import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const VIEWPORTS = [
	{ width: 375, height: 812, name: '375' },
	{ width: 768, height: 1024, name: '768' },
	{ width: 1024, height: 768, name: '1024' },
	{ width: 1200, height: 800, name: '1200' },
	{ width: 1920, height: 1080, name: '1920' },
]

const THEMES = ['light', 'dark']

const ACTIONS = [
	'01_InitialPage',
	'02_SpotlightMode',
	'03_FormActive',
	'04_ListPanel',
	'05_HighlightFromList'
]

const GALLERY_FILE = 'WEB_GALLERY.md'
const SNAPSHOT_DIR = 'snapshots/web'
const SSG_DIR = 'snapshots/ssg'

test.describe('🕸 Web Gallery Auditor — Actions', () => {
	test.setTimeout(180_000)

	test.beforeAll(() => {
		if (!fs.existsSync(SNAPSHOT_DIR)) {
			fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })
		}
		if (!fs.existsSync(SSG_DIR)) {
			fs.mkdirSync(SSG_DIR, { recursive: true })
		}
	})

	for (const vp of VIEWPORTS) {
		test(`Audit & Screenshot: ${vp.name}px`, async ({ browser }) => {
			const viewportAudits = ACTIONS.reduce((acc, comp) => {
				acc[comp] = { component: comp, screenshots: 0, errors: [], score: 100 }
				return acc
			}, {})

			for (const theme of THEMES) {
				const context = await browser.newContext({
					viewport: { width: vp.width, height: vp.height },
					colorScheme: theme,
				})

				const page = await context.newPage()
				const locale = 'en' // default for comment sandbox
				
				// Ensure directories
				const snapDir = path.join(SNAPSHOT_DIR, locale, vp.name, theme)
				if (!fs.existsSync(snapDir)) {
					fs.mkdirSync(snapDir, { recursive: true })
				}

				// Generate all action snapshots within the same page context
				const takeSnap = async (actionId, currentAudit) => {
					const screenshotPath = path.join(snapDir, `${actionId}.webp`)
					await page.screenshot({ path: screenshotPath, type: 'png' })
					currentAudit.screenshots++
				}

				// 1. Initial Page
				await page.goto('/')
				try { await page.waitForLoadState('networkidle', { timeout: 2000 }) } catch (e) {}
				await page.waitForTimeout(500)

				// Set theme
				const isDark = theme === 'dark'
				await page.evaluate((dark) => {
					const root = document.documentElement
					const current = root.dataset.bsTheme
					if ((dark && current !== 'dark') || (!dark && current === 'dark')) {
						document.querySelector('.theme-toggle').click()
					}
				}, isDark)
				await page.waitForTimeout(300)

				await takeSnap('01_InitialPage', viewportAudits['01_InitialPage'])

				// 2. Spotlight Mode
				await page.click('#btn-activate')
				await page.waitForSelector('.nan0-comment-spotlight[data-active="true"]')
				await page.waitForTimeout(300)
				await takeSnap('02_SpotlightMode', viewportAudits['02_SpotlightMode'])

				// 3. Form Active
				// We need to click on feature card
				const card = await page.locator('#feature-zero-hardcode')
				const box = await card.boundingBox()
				if (!box) {
					viewportAudits['03_FormActive'].errors.push(`[${vp.name}/${theme}] ❌ Feature card not found for clicking.`)
					viewportAudits['03_FormActive'].score -= 50
				} else {
					await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
					await page.waitForSelector('.nan0-comment-form')
					// Type text and close toast logic
					await page.fill('.nan0-comment-input', 'Audit testing comment')
					await takeSnap('03_FormActive', viewportAudits['03_FormActive'])
					
					// Generate SSG for Form
					if (theme === 'light' && vp.name === '1024') {
						const formHtml = await page.$eval('.nan0-comment-form', el => el.outerHTML)
						fs.writeFileSync(path.join(SSG_DIR, '03_FormActive.html'), formHtml)
					}

					await page.press('.nan0-comment-input', 'Control+Enter')
					await page.waitForSelector('.nan0-comment-toast')
					await page.waitForTimeout(500)
				}

				// 4. List Panel
				await page.click('#btn-list', { force: true })
				await page.waitForSelector('.nan0-comment-list-panel')
				await page.waitForTimeout(300)
				await takeSnap('04_ListPanel', viewportAudits['04_ListPanel'])

				// Generate SSG for List Panel
				if (theme === 'light' && vp.name === '1024') {
					const listHtml = await page.$eval('.nan0-comment-list-panel', el => el.outerHTML)
					fs.writeFileSync(path.join(SSG_DIR, '04_ListPanel.html'), listHtml)
				}

				// 5. Highlight From List
				try {
					const targetLink = page.locator('.nan0-comment-list-target').first()
					await targetLink.click()
					await page.waitForTimeout(600)
					await takeSnap('05_HighlightFromList', viewportAudits['05_HighlightFromList'])
				} catch (e) {
					viewportAudits['05_HighlightFromList'].errors.push(`[${vp.name}/${theme}] ❌ Highlight target not found: ${e.message}`)
				}

				await page.close()
				await context.close()
			}

			// Generate Markdown Documentation for this viewport
			const locale = 'en'
			const langDir = path.join('docs', locale, 'web_gallery')
			if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true })
				
			const vpDir = path.join(langDir, vp.name)
			if (!fs.existsSync(vpDir)) fs.mkdirSync(vpDir, { recursive: true })

			let vpIndex = `# ${vp.name}px (${locale})\n\n[⬅ Назад](../../../WEB_GALLERY.md)\n\n## 🎨 Теми\n\n`
			for (const theme of THEMES) {
				vpIndex += `- [${theme === 'dark' ? '🌙' : '☀️'} **${theme}**](./${theme}/index.md)\n`
				
				const themeDir = path.join(vpDir, theme)
				if (!fs.existsSync(themeDir)) fs.mkdirSync(themeDir, { recursive: true })

				let themeIndex = `# ${theme === 'dark' ? '🌙' : '☀️'} ${theme} — ${vp.name}px\n\n[⬅ Назад](../index.md)\n\n`
				for (const act of ACTIONS) {
					const snapPath = `../../../../../snapshots/web/${locale}/${vp.name}/${theme}/${act}.webp`
					themeIndex += `## 🎬 ${act}\n\n![${act}](${snapPath})\n\n---\n\n`
				}
				fs.writeFileSync(path.join(themeDir, 'index.md'), themeIndex)
			}
			fs.writeFileSync(path.join(vpDir, 'index.md'), vpIndex)

			// Language index
			let langIndex = `# Web Gallery\n\n[⬅ Назад](../../../WEB_GALLERY.md)\n\n## 📱 Розширення\n\n`
			for (const allVp of VIEWPORTS) {
				langIndex += `- [🖥 **${allVp.name}px**](./${allVp.name}/index.md)\n`
			}
			fs.writeFileSync(path.join(langDir, 'index.md'), langIndex)
			
			// Write audit to disk
			fs.writeFileSync(path.join(SNAPSHOT_DIR, `audit_${vp.name}.json`), JSON.stringify(viewportAudits, null, 2))
		})
	}

	test.afterAll(() => {
		const allAudits = []
		for (const vp of VIEWPORTS) {
			const fp = path.join(SNAPSHOT_DIR, `audit_${vp.name}.json`)
			if (fs.existsSync(fp)) {
				allAudits.push(JSON.parse(fs.readFileSync(fp, 'utf-8')))
			}
		}

		const mergedScores = {}
		ACTIONS.forEach(a => { mergedScores[a] = { score: 100, screenshots: 0, errors: [] } })

		for (const group of allAudits) {
			for (const comp of Object.values(group)) {
                if (!mergedScores[comp.component]) continue;
				mergedScores[comp.component].screenshots += comp.screenshots
				mergedScores[comp.component].errors.push(...comp.errors)
				if (comp.score < mergedScores[comp.component].score) {
					mergedScores[comp.component].score = comp.score
				}
			}
		}

		const totalExpected = VIEWPORTS.length * THEMES.length
		const rootContent = `# 🕸 Web Gallery: @nan0web/comment

Автоматично згенеровані скріншоти Actions (Сценаріїв) для коментарів.

**Матриця:** ${VIEWPORTS.length} розширень × ${THEMES.length} тем = **${totalExpected} скріншотів** на сценарій.

## 🌐 Галерея

- [💬 **Сценарії (en)**](./docs/en/web_gallery/index.md)

## 📊 Аудит

| Сценарій | Оцінка | Скріншотів | Помилки |
| --- | --- | --- | --- |
${ACTIONS.map((c) => {
	const r = mergedScores[c]
	const isClean = r.errors.length === 0
	return `| \`${c}\` | **${r.score}/100** | ${r.screenshots}/${totalExpected} | ${isClean ? '✅ Чисто' : r.errors.length + ' помилок'} |`
}).join('\n')}
`
		fs.writeFileSync(GALLERY_FILE, rootContent)
	})
})
