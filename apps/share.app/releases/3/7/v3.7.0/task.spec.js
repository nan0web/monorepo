import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { TranscribeCommand } from '../../../../src/domain/commands/TranscribeCommand.js'
import { ShareAppCLI } from '../../../../src/index.js'
import { runGenerator } from '@nan0web/ui'

describe('Release v3.7.0 Contract: TranscribeCommand, Multiselect & Low-Frequency Progress', () => {
	// Sample mock Whisper transcript JSON with word-level timestamps
	const mockWhisperResult = {
		text: 'Привіт світ! Це тестовий запис для транскрибації.',
		segments: [
			{
				id: 0,
				start: 0.0,
				end: 2.5,
				text: 'Привіт світ!',
				words: [
					{ word: 'Привіт', start: 0.0, end: 1.2 },
					{ word: 'світ!', start: 1.3, end: 2.5 },
				],
			},
			{
				id: 1,
				start: 2.8,
				end: 5.5,
				text: 'Це тестовий запис для транскрибації.',
				words: [
					{ word: 'Це', start: 2.8, end: 3.1 },
					{ word: 'тестовий', start: 3.2, end: 3.9 },
					{ word: 'запис', start: 4.0, end: 4.5 },
					{ word: 'для', start: 4.6, end: 4.8 },
					{ word: 'транскрибації.', start: 4.9, end: 5.5 },
				],
			},
		],
	}

	class MockWhisperService {
		static calls = []
		static async *transcribe(options) {
			MockWhisperService.calls.push(options)
			yield { type: 'progress', message: 'transcribing', percent: 50 }
			return {
				whisperJson: mockWhisperResult,
				transcriptPath: `${options.outputDir || 'tmp'}/transcript.json`,
			}
		}
	}

	describe('1. Model & Schema Contract', () => {
		it('TranscribeCommand should extend ModelAsApp and define static alias transcribe', () => {
			assert.equal(TranscribeCommand.alias, 'transcribe')
		})

		it('TranscribeCommand should define static format with multiselect array specification', () => {
			assert.ok(TranscribeCommand.format, 'format option must be defined')
			assert.equal(TranscribeCommand.format.type, 'array')
			assert.equal(TranscribeCommand.format.multiselect, true)
		})

		it('ShareAppCLI should register TranscribeCommand in command options', () => {
			const options = ShareAppCLI.command?.options || []
			assert.ok(
				options.includes(TranscribeCommand),
				'ShareAppCLI must include TranscribeCommand in static command.options'
			)
		})
	})

	describe('2. Glob expansion with brace expansion (Zero-FS / In-Memory DB)', () => {
		it('should expand brace patterns like *.{mp3,m4a,aac} using DB.listDir / predefined paths', () => {
			const patterns = TranscribeCommand.expandBraces('in/*.{mp3,m4a,aac}')
			assert.deepEqual(patterns, ['in/*.mp3', 'in/*.m4a', 'in/*.aac'])
		})

		it('should expand complex brace patterns with multiple groups', () => {
			const patterns = TranscribeCommand.expandBraces('{in,out}/*.{mp3,wav}')
			assert.deepEqual(patterns, [
				'in/*.mp3',
				'in/*.wav',
				'out/*.mp3',
				'out/*.wav',
			])
		})

		it('should resolve matching documents from In-Memory DB', async () => {
			const db = new DB({
				predefined: [
					['media/audio1.mp3', 'AUDIO_DATA_1'],
					['media/audio2.m4a', 'AUDIO_DATA_2'],
					['media/ignore.txt', 'TEXT_DATA'],
					['other/audio3.aac', 'AUDIO_DATA_3'],
				],
			})
			await db.connect()

			const matched = await TranscribeCommand.findMatchingFiles(db, 'media/*.{mp3,m4a}')
			assert.deepEqual(matched.sort(), ['media/audio1.mp3', 'media/audio2.m4a'].sort())
		})
	})

	describe('3. Multiselect Format Parsing & Target Derivative Saving', () => {
		it('should parse comma-separated or array format list into normalized array', () => {
			const cmd1 = new TranscribeCommand({ format: 'text,json' })
			assert.deepEqual(cmd1.getFormatList(), ['text', 'json'])

			const cmd2 = new TranscribeCommand({ format: ['text', 'sbv', 'srt'] })
			assert.deepEqual(cmd2.getFormatList(), ['text', 'sbv', 'srt'])
		})

		it('should generate formatted outputs (.txt, .json, .sbv, .srt, .vtt) correctly', () => {
			const txt = TranscribeCommand.formatOutput(mockWhisperResult, 'text')
			assert.ok(txt.includes('Привіт світ!'))

			const jsonStr = TranscribeCommand.formatOutput(mockWhisperResult, 'json')
			const parsed = JSON.parse(jsonStr)
			assert.equal(parsed.segments[0].words[0].word, 'Привіт')

			const sbv = TranscribeCommand.formatOutput(mockWhisperResult, 'sbv')
			// YouTube SBV format: 0:00:00.000,0:00:02.500
			assert.match(sbv, /0:00:00\.000,0:00:02\.500/)
			assert.ok(sbv.includes('Привіт світ!'))

			const srt = TranscribeCommand.formatOutput(mockWhisperResult, 'srt')
			assert.match(srt, /00:00:00,000 --> 00:00:02,500/)

			const vtt = TranscribeCommand.formatOutput(mockWhisperResult, 'vtt')
			assert.ok(vtt.startsWith('WEBVTT'))
			assert.match(vtt, /00:00:00\.000 --> 00:00:02\.500/)
		})

		it('should save derivatives next to input file in DB', async () => {
			const db = new DB({
				predefined: [
					['diary/2026-11-05/in/note.mp3', 'AUDIO_BINARY_BYTES'],
				],
			})
			await db.connect()

			const cmd = new TranscribeCommand(
				{
					input: 'diary/2026-11-05/in/note.mp3',
					format: 'text,json,sbv',
				},
				{
					db,
					whisperService: MockWhisperService,
				}
			)

			const events = []
			const res = await runGenerator(cmd.run(), {
				ask: async () => ({ value: {} }),
				progress: (p) => events.push(p),
				show: (s) => events.push(s),
				log: (l) => events.push(l),
			})

			assert.equal(res?.status, 'ok')

			const savedTxt = await db.loadDocument('diary/2026-11-05/in/note.txt')
			assert.ok(savedTxt?.includes('Привіт світ!'))

			const savedJson = await db.loadDocument('diary/2026-11-05/in/note.json')
			assert.ok(savedJson?.segments || JSON.parse(savedJson)?.segments)

			const savedSbv = await db.loadDocument('diary/2026-11-05/in/note.sbv')
			assert.ok(savedSbv?.includes('0:00:00.000,0:00:02.500'))
		})
	})

	describe('4. Idempotency & Caching (--force)', () => {
		it('should skip transcription if all target format files already exist, unless force is true', async () => {
			const db = new DB({
				predefined: [
					['recordings/voice.m4a', 'AUDIO_DATA'],
					['recordings/voice.txt', 'Existing transcription'],
					['recordings/voice.json', JSON.stringify(mockWhisperResult)],
				],
			})
			await db.connect()

			let calledService = false
			const CustomMockWhisper = {
				async *transcribe() {
					calledService = true
					return { whisperJson: mockWhisperResult }
				},
			}

			// 1. Without --force -> skipped
			const cmdSkip = new TranscribeCommand(
				{
					input: 'recordings/voice.m4a',
					format: 'text,json',
					force: false,
				},
				{ db, whisperService: CustomMockWhisper }
			)

			const resSkip = await runGenerator(cmdSkip.run(), {
				ask: async () => ({ value: {} }),
				progress: () => {},
				show: () => {},
			})
			assert.equal(resSkip?.processed, 0)
			assert.equal(resSkip?.skipped, 1)
			assert.equal(calledService, false, 'Whisper service should not be called when files exist')

			// 2. With --force -> reprocessed
			const cmdForce = new TranscribeCommand(
				{
					input: 'recordings/voice.m4a',
					format: 'text,json',
					force: true,
				},
				{ db, whisperService: CustomMockWhisper }
			)

			const resForce = await runGenerator(cmdForce.run(), {
				ask: async () => ({ value: {} }),
				progress: () => {},
				show: () => {},
			})
			assert.equal(resForce?.processed, 1)
			assert.equal(resForce?.skipped, 0)
			assert.equal(calledService, true, 'Whisper service must be called when --force is true')
		})
	})

	describe('5. TTY & Low-Frequency Progress Throttler', () => {
		it('should throttle frequent progress updates in non-TTY mode to avoid flooding log/context', () => {
			const throttler = TranscribeCommand.createProgressThrottler({
				isTTY: false,
				intervalMs: 1000,
				stepPercent: 10,
			})

			// First event should pass
			assert.equal(throttler.shouldEmit({ percent: 1, time: 100 }), true)
			throttler.markEmitted({ percent: 1, time: 100 })

			// Same second, small percent increment (<10%) -> should be suppressed
			assert.equal(throttler.shouldEmit({ percent: 4, time: 300 }), false)

			// Same second, but percent jumped >= 10% -> should pass
			assert.equal(throttler.shouldEmit({ percent: 12, time: 400 }), true)
			throttler.markEmitted({ percent: 12, time: 400 })

			// 1200ms later (>1000ms), small percent increment -> should pass by time interval
			assert.equal(throttler.shouldEmit({ percent: 14, time: 1700 }), true)
		})
	})
})
