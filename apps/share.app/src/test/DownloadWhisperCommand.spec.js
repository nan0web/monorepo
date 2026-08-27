import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('DownloadWhisperCommand', () => {
	it('static alias is download:whisper', async () => {
		const { DownloadWhisperCommand } = await import('../domain/commands/DownloadWhisperCommand.js')
		assert.equal(DownloadWhisperCommand.alias, 'download:whisper')
	})

	it('static field definitions exist', async () => {
		const { DownloadWhisperCommand } = await import('../domain/commands/DownloadWhisperCommand.js')
		assert.ok(DownloadWhisperCommand.url)
		assert.equal(DownloadWhisperCommand.url.type, 'string')
		assert.equal(DownloadWhisperCommand.url.required, true)
		assert.ok(DownloadWhisperCommand.output)
		assert.ok(DownloadWhisperCommand.quality)
		assert.ok(DownloadWhisperCommand.format)
		assert.ok(DownloadWhisperCommand.language)
	})

	it('_detectFormat — returns format from extension', async () => {
		const { DownloadWhisperCommand } = await import('../domain/commands/DownloadWhisperCommand.js')
		assert.equal(DownloadWhisperCommand._detectFormat('output.srt'), 'srt')
		assert.equal(DownloadWhisperCommand._detectFormat('output.vtt'), 'vtt')
		assert.equal(DownloadWhisperCommand._detectFormat('output.json'), 'json')
		assert.equal(DownloadWhisperCommand._detectFormat('output.txt'), null)
		assert.equal(DownloadWhisperCommand._detectFormat('output'), null)
	})

	it('_detectFormat — case insensitive', async () => {
		const { DownloadWhisperCommand } = await import('../domain/commands/DownloadWhisperCommand.js')
		assert.equal(DownloadWhisperCommand._detectFormat('output.SRT'), 'srt')
		assert.equal(DownloadWhisperCommand._detectFormat('output.JSON'), 'json')
	})

	it('constructor — passes data to super', async () => {
		const { DownloadWhisperCommand } = await import('../domain/commands/DownloadWhisperCommand.js')
		const cmd = new DownloadWhisperCommand({
			url: 'https://youtube.com/watch?v=test',
			quality: 'large',
			format: 'json',
			language: 'uk',
		})
		assert.equal(cmd.url, 'https://youtube.com/watch?v=test')
		assert.equal(cmd.quality, 'large')
		assert.equal(cmd.format, 'json')
		assert.equal(cmd.language, 'uk')
	})

	it('run — yields error when url is missing', async () => {
		const { DownloadWhisperCommand } = await import('../domain/commands/DownloadWhisperCommand.js')
		const cmd = new DownloadWhisperCommand({})
		const results = []
		let finalResult
		for await (const intent of cmd.run()) {
			results.push(intent)
		}
		// The return value of an async generator is the final {done:true, value}
		// which for-await-of DOES NOT include. We check the yielded intents.
		const errorShow = results.find(r => r.type === 'show' && r.level === 'error')
		assert.ok(errorShow, 'should yield an error show')
		// The generator returns a result object (not yielded)
		// We verify the proper error message was yielded
		assert.ok(errorShow.message.includes('Usage:'))
	})
})