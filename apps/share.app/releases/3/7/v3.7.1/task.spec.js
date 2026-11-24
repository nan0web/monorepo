import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { progress } from '@nan0web/ui'
import { TranscribeCommand } from '../../../../src/domain/commands/TranscribeCommand.js'
import { WhisperTranscriptionService } from '../../../../src/domain/analysis/WhisperTranscriptionService.js'

describe('Release v3.7.1 Contract: TranscribeCommand UX, CWD & Rich Progress', () => {
	it('should yield a descriptive error message when input is missing', async () => {
		const db = new DB()
		const cmd = new TranscribeCommand({}, { db })
		const events = []
		const gen = cmd.run()
		while (true) {
			const { value, done } = await gen.next()
			if (done) {
				assert.equal(value?.value?.status ?? value?.data?.status ?? value?.status, 'error')
				break
			}
			events.push(value)
		}
		const hasDescriptiveError = events.some((e) => {
			const str = JSON.stringify(e || {})
			return str.includes('Input file') || str.includes('missing') || str.includes('Usage:')
		})
		assert.ok(hasDescriptiveError, 'Expected descriptive alert/log error when input is missing')
	})

	it('should support directory input and find audio/video files by default', async () => {
		const db = new DB()
		await db.saveDocument('arch/diary/in/261116.m4a', 'mock-audio')
		await db.saveDocument('arch/diary/in/261117.mp4', 'mock-video')
		await db.saveDocument('arch/diary/in/notes.txt', 'ignore-me')

		assert.equal(typeof TranscribeCommand.findMatchingFiles, 'function')
		const matched = await TranscribeCommand.findMatchingFiles(db, 'arch/diary/in')
		assert.ok(matched.includes('arch/diary/in/261116.m4a'))
		assert.ok(matched.includes('arch/diary/in/261117.mp4'))
		assert.ok(!matched.includes('arch/diary/in/notes.txt'))
	})

	it('should save derivative file next to input file in db root (no data/ prefix)', async () => {
		const db = new DB()
		await db.saveDocument('arch/diary/in/261116.m4a', 'mock-audio')

		const mockWhisper = {
			async *transcribe() {
				return {
					text: 'Hello world',
					segments: [{ start: 0, end: 1.5, text: 'Hello world' }],
				}
			},
		}

		const cmd = new TranscribeCommand(
			{ input: 'arch/diary/in/261116.m4a', format: ['text'] },
			{ db, whisperService: mockWhisper }
		)
		const gen = cmd.run()
		while (!(await gen.next()).done) {
			// consume
		}

		const saved = await db.loadDocument('arch/diary/in/261116.txt')
		assert.ok(saved, 'Derivative .txt must be saved at arch/diary/in/261116.txt')
	})

	it('should forward non-zero progress value from WhisperTranscriptionService progress events', async () => {
		const db = new DB()
		await db.saveDocument('arch/diary/in/261116.m4a', 'mock-audio')

		const mockWhisper = {
			async *transcribe() {
				yield progress('🧠 Whisper chunk 1/2: [56%]', 0.56, { id: 'whisper', total: 2 })
				return { text: 'Hello', segments: [{ start: 0, end: 1, text: 'Hello' }] }
			},
		}

		const cmd = new TranscribeCommand(
			{ input: 'arch/diary/in/261116.m4a', format: ['text'] },
			{ db, whisperService: mockWhisper }
		)
		const progressEvents = []
		const gen = cmd.run()
		while (true) {
			const { value, done } = await gen.next()
			if (done) break
			if (value?.type === 'progress') progressEvents.push(value)
		}

		assert.ok(progressEvents.length > 0, 'Expected at least one progress event')
		const first = progressEvents[0]
		const val = first.value ?? first.current ?? 0
		assert.ok(val > 0, `Expected progress value > 0 for chunk 1/2 at 56%, got ${val}`)
	})

	it('should emit monotonically non-decreasing progress across chunks in WhisperTranscriptionService', async () => {
		const db = new DB()
		const mockDownloadModel = {
			async *run() {
				yield { status: 'transcribing', chunk: 1, total: 2 }
				yield { status: 'partial_progress', chunk: 1, total: 2, percent: 50 }
				yield { status: 'partial', chunk: 1, total: 2 }
				yield { status: 'transcribing', chunk: 2, total: 2 }
				yield { status: 'partial_progress', chunk: 2, total: 2, percent: 10 }
				yield { status: 'partial', chunk: 2, total: 2 }
				yield { status: 'done', transcript: JSON.stringify({ text: 'ok', segments: [] }) }
			},
		}

		const gen = WhisperTranscriptionService.transcribe({
			url: 'test.m4a',
			outputDir: '.',
			db,
			t: (k) => k,
			silentHeader: true,
			downloadModel: mockDownloadModel,
		})

		const ratios = []
		while (true) {
			const { value, done } = await gen.next()
			if (done) break
			if (value?.type === 'progress') {
				const total = value.total ?? value.options?.total ?? 100
				const val = value.value ?? value.current ?? 0
				ratios.push(total > 0 ? val / total : 0)
			}
		}

		assert.ok(ratios.length >= 5, `Expected at least 5 progress events, got ${ratios.length}`)
		for (let i = 1; i < ratios.length; i++) {
			assert.ok(
				ratios[i] >= ratios[i - 1],
				`Progress jumped backwards at index ${i}: ${ratios[i - 1]} -> ${ratios[i]} (all: ${ratios.join(', ')})`
			)
		}
	})

	it('should emit batchStart and batchProgress with total duration and elapsed time for directory', async () => {
		const db = new DB()
		await db.saveDocument('arch/diary/in/a.m4a', 'mock-audio-1')
		await db.saveDocument('arch/diary/in/b.m4a', 'mock-audio-2')

		const mockWhisper = {
			async *transcribe() {
				return { text: 'Hello', segments: [{ start: 0, end: 1, text: 'Hello' }] }
			},
		}

		const cmd = new TranscribeCommand(
			{ input: 'arch/diary/in', format: ['text'] },
			{ db, whisperService: mockWhisper }
		)
		const messages = []
		const gen = cmd.run()
		while (true) {
			const { value, done } = await gen.next()
			if (done) break
			if (value?.message) messages.push(value.message)
		}

		assert.ok(
			messages.some((m) => m.includes('Found 2 media file(s)') && m.includes('total duration:')),
			`Expected batchStart message, got: ${JSON.stringify(messages)}`
		)
		assert.ok(
			messages.some((m) => m.includes('Audio processed:') && m.includes('Elapsed:')),
			`Expected batchProgress message, got: ${JSON.stringify(messages)}`
		)
	})

	it('should embed transcription into metadata without creating separate files when --embed is set', async () => {
		const db = new DB()
		await db.saveDocument('arch/diary/in/261116.m4a', 'mock-audio')

		const mockWhisper = {
			async *transcribe() {
				return { text: 'Embedded text', segments: [{ start: 0, end: 1, text: 'Embedded text' }] }
			},
		}

		let embeddedCalls = []
		const mockEmbedder = async (file, text) => {
			embeddedCalls.push({ file, text })
		}

		const cmd = new TranscribeCommand(
			{ input: 'arch/diary/in/261116.m4a', format: ['text'], embed: true },
			{ db, whisperService: mockWhisper, embedder: mockEmbedder }
		)
		const gen = cmd.run()
		while (!(await gen.next()).done) {
			// consume
		}

		assert.equal(embeddedCalls.length, 1, 'Expected embedder to be called once')
		assert.equal(embeddedCalls[0].file, 'arch/diary/in/261116.m4a')
		assert.ok(embeddedCalls[0].text.includes('Embedded text'))

		const savedTxt = await db.loadDocument('arch/diary/in/261116.txt').catch(() => undefined)
		assert.equal(savedTxt, undefined, 'Separate .txt file must NOT be created when --embed is true')
	})

	it('should not carry over segmenting/downloading progress into transcription phase', async () => {
		const db = new DB()
		await db.saveDocument('arch/diary/in/261116.m4a', 'mock-audio')

		const mockWhisper = {
			async *transcribe() {
				yield progress('✂️ Splitting audio into chunks... 100%', 100, { id: 'whisper', total: 100 })
				yield progress('🧠 Whisper chunk 1/2: [2%]', 0.02, { id: 'whisper', total: 2 })
				return { text: 'Hello', segments: [{ start: 0, end: 1, text: 'Hello' }] }
			},
		}

		const cmd = new TranscribeCommand(
			{ input: 'arch/diary/in/261116.m4a', format: ['text'] },
			{ db, whisperService: mockWhisper }
		)
		const progressEvents = []
		const gen = cmd.run()
		while (true) {
			const { value, done } = await gen.next()
			if (done) break
			if (value?.type === 'progress') progressEvents.push(value)
		}

		const last = progressEvents[progressEvents.length - 1]
		const val = last.value ?? last.current ?? 0
		assert.ok(val <= 5, `Expected transcription progress to be ~1%, not carried over from segmenting (got ${val})`)
	})

	it('should not save transcript.json when format is only text', async () => {
		const db = new DB()
		await db.saveDocument('arch/diary/in/261116.m4a', 'mock-audio')

		const mockDownloadModel = {
			async *run() {
				yield { status: 'done', transcript: JSON.stringify({ text: 'Only text', segments: [] }) }
			},
		}

		const cmd = new TranscribeCommand(
			{ input: 'arch/diary/in/261116.m4a', format: ['text'] },
			{
				db,
				whisperService: {
					transcribe: (opts) =>
						WhisperTranscriptionService.transcribe({ ...opts, downloadModel: mockDownloadModel }),
				},
			}
		)
		const gen = cmd.run()
		while (!(await gen.next()).done) {
			// consume
		}

		const savedJson = await db.loadDocument('arch/diary/in/transcript.json').catch(() => undefined)
		assert.equal(savedJson, undefined, 'transcript.json must NOT be saved when only text format is requested')
	})

	it('should pass offline: true to whisperService when --offline is set', async () => {
		const db = new DB()
		await db.saveDocument('arch/diary/in/261116.m4a', 'mock-audio')

		let receivedOffline = null
		const mockWhisper = {
			async *transcribe(opts) {
				receivedOffline = opts.offline
				return { text: 'Offline ok', segments: [] }
			},
		}

		const cmd = new TranscribeCommand(
			{ input: 'arch/diary/in/261116.m4a', format: ['text'], offline: true },
			{ db, whisperService: mockWhisper }
		)
		const gen = cmd.run()
		while (!(await gen.next()).done) {
			// consume
		}

		assert.equal(receivedOffline, true, 'Expected offline: true to be passed to whisperService')
	})
})
