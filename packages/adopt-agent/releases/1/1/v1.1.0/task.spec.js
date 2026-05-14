import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import childProcess from 'node:child_process'

const CWD = process.cwd()

describe('v1.1.0 Contract: Advanced Web E2E & UI Localization', () => {
	describe('play.e2e.js configuration', () => {
		let e2eCode = ''
		before(() => {
			e2eCode = fs.readFileSync(path.join(CWD, 'play/play.e2e.js'), 'utf-8')
		})

		test('Contains all 5 requested viewports', () => {
			assert.match(e2eCode, /370/, 'Missing viewport width 370')
			assert.match(e2eCode, /768/, 'Missing viewport width 768')
			assert.match(e2eCode, /1024/, 'Missing viewport width 1024')
			assert.match(e2eCode, /1200/, 'Missing viewport width 1200')
			assert.match(e2eCode, /1920/, 'Missing viewport width 1920')
		})

		test('Organizes screenshots into desktop and mobile domains', () => {
			assert.match(e2eCode, /desktop/, 'Missing desktop subdirectory logic')
			assert.match(e2eCode, /mobile/, 'Missing mobile subdirectory logic')
		})

		test('Uses fullPage: true for screenshots to capture scroll', () => {
			assert.match(e2eCode, /fullPage:\s*true/, 'Missing fullPage flag for screenshot')
		})

		test('Generates snapshot-play.md file', () => {
			assert.match(
				e2eCode,
				/snapshot-play\.md|snapshots\.md/,
				'Script does not seem to output a markdown gallery',
			)
			assert.match(e2eCode, /writeFileSync/, 'Script should write the generated MD file')
		})
	})

	describe('Web SSR Server Features', () => {
		let serverProcess
		let p = 3015 // Using offset port to not collide with anything
		const baseURL = `http://127.0.0.1:${p}`

		before(async () => {
			return new Promise((resolve, reject) => {
				serverProcess = childProcess.spawn('node', ['play/web.js'], {
					cwd: CWD,
					env: { ...process.env, PORT: String(p) },
				})
				serverProcess.stdout.on('data', (d) => {
					if (d.toString().includes('SSR running.')) resolve()
				})
				serverProcess.stderr.on('data', (d) => {
					if (d.toString().includes('EADDRINUSE')) reject(new Error('Port in use'))
				})
				setTimeout(resolve, 3000)
			})
		})

		after(() => {
			if (serverProcess) serverProcess.kill()
		})

		test('Translates main UI when /uk/ is provided', async () => {
			const res = await fetch(`${baseURL}/uk/`)
			const html = await res.text()
			try {
				assert.match(
					html,
					/Навігація|Документи/i,
					'UI was not translated to Ukrainian via SSR routing',
				)
			} catch (e) {
				fs.writeFileSync(path.join(CWD, 'uk_fail.html'), html)
				throw e
			}
		})

		test('Serves static .png files', async () => {
			// Write a dummy ping file to snapshots just to test server
			const imgDir = path.join(CWD, 'snapshots/play/web/desktop')
			fs.mkdirSync(imgDir, { recursive: true })
			const imgPath = path.join(imgDir, 'test_dummy.png')
			fs.writeFileSync(imgPath, 'fake-png-data')

			const res = await fetch(`${baseURL}/snapshots/play/web/desktop/test_dummy.png`)
			assert.equal(res.status, 200, 'Server should return 200 OK for png')
			assert.equal(res.headers.get('content-type'), 'image/png', 'Wrong content-type')

			fs.unlinkSync(imgPath)
		})
	})
})
