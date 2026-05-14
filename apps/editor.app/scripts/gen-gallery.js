import playwright from 'playwright'
import fs from 'fs'
import path from 'path'

/**
 * gen-gallery.js
 *
 * Hyper-granular gallery generator for visual verification.
 * Takes a snapshot after every single character interaction.
 */
const OUTPUT_DIR = './docs/gallery'
const BASE_URL = 'http://localhost:4246/'

async function generateGallery() {
	if (fs.existsSync(OUTPUT_DIR)) {
		fs.rmSync(OUTPUT_DIR, { recursive: true, force: true })
	}
	fs.mkdirSync(OUTPUT_DIR, { recursive: true })

	console.info('🚀 Starting Hyper-Granular Gallery Generator...')
	const browser = await playwright.chromium.launch()
	const page = await browser.newPage()
	await page.setViewportSize({ width: 1280, height: 800 })

	let frame = 0
	async function snapshot(label) {
		frame++
		const filename = `${String(frame).padStart(3, '0')}-${label}.png`
		console.info(`📸 Frame ${frame}: ${label}`)
		await page.screenshot({ path: `${OUTPUT_DIR}/${filename}` })
		await page.waitForTimeout(300)
	}

	try {
		// 1. Initial
		await page.goto(BASE_URL)
		await page.waitForSelector('.loading-overlay', { state: 'hidden' })
		await snapshot('initial')

		// 2. Typing Title per character
		const text = 'Lux UI'
		for (let i = 0; i < text.length; i++) {
			await page.keyboard.type(text[i])
			await snapshot(`typing-title-${i + 1}`)
		}

		// 3. Tags per character
		await page.keyboard.press('Tab') // Description
		await page.keyboard.press('Tab') // Author
		await page.keyboard.press('Tab') // Tags
		await snapshot('focus-tags')

		const tagsContent = 'ag, l'
		for (let i = 0; i < tagsContent.length; i++) {
			await page.keyboard.type(tagsContent[i])
			await snapshot(`typing-tags-${i + 1}`)
		}

		// 4. Catalog with arrow navigation
		await page.click('button.catalog')
		await snapshot('catalog-opened')
		await page.keyboard.press('ArrowDown')
		await snapshot('catalog-down-1')
		await page.keyboard.press('Enter')
		await snapshot('catalog-selected')

		// 5. Recursion: Level 2
		await page.click('button.link')
		await page.waitForTimeout(400) // Show loading overlay
		await snapshot('loading-level-2')
		await page.waitForSelector('.loading-overlay', { state: 'hidden' })
		await snapshot('level-2-loaded')

		// 6. Return
		await page.keyboard.press('Escape')
		await snapshot('returned-level-1')

		// Generate GALLERY.MD index
		const images = fs
			.readdirSync(OUTPUT_DIR)
			.filter((f) => f.endsWith('.png'))
			.sort()
		let md = '# 📷 Hyper-Granular Interaction Gallery\n\n'
		md += 'Visual verification of every character and interaction step.\n\n'
		images.forEach((img) => {
			md += `### Frame: ${img}\n\n![${img}](./gallery/${img})\n\n---\n\n`
		})
		fs.writeFileSync('./docs/GALLERY.md', md)
		console.info('✔ GALLERY.md updated.')
	} catch (err) {
		console.error('❌ Failed:', err.message)
	} finally {
		await browser.close()
		console.info('🏁 Finished.')
	}
}

generateGallery()
