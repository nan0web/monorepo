import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP = path.join(__dirname, '../../tmp-test')

describe('MediaDownloadModel', () => {
	it.before(() => {
		fs.mkdirSync(TMP, { recursive: true })
	})

	it.after(() => {
		fs.rmSync(TMP, { recursive: true, force: true })
	})

	it('constructor — sets defaults', async () => {
		const { MediaDownloadModel } = await import('../domain/MediaDownloadModel.js')
		const m = new MediaDownloadModel()
		assert.equal(m.url, undefined)
		assert.equal(m.status, 'idle')
		assert.equal(m.transcript, '')
		assert.equal(m.title, '')
		assert.deepEqual(m.chunks, [])
		assert.equal(m.quality, 'medium')
		assert.equal(m.format, 'txt')
		assert.equal(m.language, 'auto')
	})

	it('constructor — overrides fields', async () => {
		const { MediaDownloadModel } = await import('../domain/MediaDownloadModel.js')
		const m = new MediaDownloadModel({
			url: 'https://youtube.com/watch?v=test',
			quality: 'large',
			format: 'json',
			language: 'uk',
		})
		assert.equal(m.url, 'https://youtube.com/watch?v=test')
		assert.equal(m.quality, 'large')
		assert.equal(m.format, 'json')
		assert.equal(m.language, 'uk')
	})

	it('run — throws without url', async () => {
		const { MediaDownloadModel } = await import('../domain/MediaDownloadModel.js')
		const m = new MediaDownloadModel()
		await assert.rejects(async () => {
			for await (const _ of m.run()) { /* collect */ }
		}, /Input URL or path is required/)
	})

	it('run — segments local audio and yields progress', async () => {
		await new Promise((resolve, reject) => {
			const proc = spawn('ffmpeg', [
				'-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
				'-t', '10',
				'-acodec', 'libmp3lame',
				path.join(TMP, 'test_run.mp3'),
			], { stdio: 'ignore' })
			proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)))
			proc.on('error', reject)
		})

		const { MediaDownloadModel } = await import('../domain/MediaDownloadModel.js')
		const m = new MediaDownloadModel({
			url: path.join(TMP, 'test_run.mp3'),
			quality: 'medium',
			format: 'txt',
		})

		const updates = []
		try {
			for await (const u of m.run()) {
				updates.push(u)
			}
		} catch {
			// Expected: AI.transcribe will fail without mlx_whisper
		}

		const statuses = updates.map(u => u.status)
		assert.ok(statuses.includes('segmenting'), 'should yield segmenting')
	})

	it('static describe — returns all field definitions', async () => {
		const { MediaDownloadModel } = await import('../domain/MediaDownloadModel.js')
		const fields = MediaDownloadModel.describe()
		const fieldNames = fields.map(f => f.field)
		assert.ok(fieldNames.includes('url'))
		assert.ok(fieldNames.includes('quality'))
		assert.ok(fieldNames.includes('format'))
		assert.ok(fieldNames.includes('language'))
		assert.ok(fieldNames.includes('transcript'))
	})
})