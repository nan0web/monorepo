import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('YouTubeDownloader', () => {
	it('_parseProgress — extracts percent, speed, eta', async () => {
		const { YouTubeDownloader } = await import('../domain/YouTubeDownloader.js')
		const r = YouTubeDownloader._parseProgress('[download]  45.2% of ~5.23MiB at 1.2MiB/s ETA 00:01')
		assert.deepEqual(r, { percent: 45.2, speed: '1.2MiB/s', eta: '00:01' })
	})

	it('_parseProgress — null for non-progress lines', async () => {
		const { YouTubeDownloader } = await import('../domain/YouTubeDownloader.js')
		assert.equal(YouTubeDownloader._parseProgress('[youtube] downloading webpage'), null)
		assert.equal(YouTubeDownloader._parseProgress(''), null)
	})

	it('_parseProgress — handles 0%, 100%, no speed', async () => {
		const { YouTubeDownloader } = await import('../domain/YouTubeDownloader.js')
		assert.equal(YouTubeDownloader._parseProgress('[download]   0.0%').percent, 0)
		assert.equal(YouTubeDownloader._parseProgress('[download] 100.0%').percent, 100)
		const r = YouTubeDownloader._parseProgress('[download]  50.0% of 2.50MiB')
		assert.deepEqual(r, { percent: 50, speed: '', eta: '' })
	})

	it('_getCookiesArgs — resolves browser, file, and Netscape content', async () => {
		const { YouTubeDownloaderPort } = await import('../ports/YouTubeDownloaderPort.js')

		// 1. Browser name
		assert.deepEqual(YouTubeDownloaderPort._getCookiesArgs({ cookies: 'chrome' }), ['--cookies-from-browser', 'chrome'])

		// 2. Empty options
		assert.deepEqual(YouTubeDownloaderPort._getCookiesArgs({}), [])

		// 3. Local file path (existing file)
		const tempFile = './package.json'
		const args = YouTubeDownloaderPort._getCookiesArgs({ cookies: tempFile })
		assert.equal(args[0], '--cookies')
		assert.ok(args[1].endsWith('package.json'))

		// 4. Netscape string content
		const netscapeText = '.youtube.com\tTRUE\t/\tFALSE\t0\tPREF\tf1=50000000'
		const netscapeArgs = YouTubeDownloaderPort._getCookiesArgs({ cookies: netscapeText })
		assert.equal(netscapeArgs[0], '--cookies')
		assert.ok(netscapeArgs[1].includes('temp_cookies.txt'))
	})
})