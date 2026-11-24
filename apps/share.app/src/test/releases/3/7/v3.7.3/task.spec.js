
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { WhisperEngine, parseMlxProgressLine, MLX_MODEL_META } from '@nan0web/ai'
import { WhisperTranscriptionService } from '../../../../../domain/analysis/WhisperTranscriptionService.js'
import { WhisperModelCatalog } from '../../../../../domain/analysis/WhisperModelCatalog.js'
import { MediaDownloadModel } from '../../../../../domain/MediaDownloadModel.js'
import { TranscribeCommand } from '../../../../../domain/commands/TranscribeCommand.js'
import { DownloadWhisperCommand } from '../../../../../domain/commands/DownloadWhisperCommand.js'
import { WhisperModelsCommand } from '../../../../../domain/commands/WhisperModelsCommand.js'
import { ShareAppCLI } from '../../../../../index.js'
import { modelFromArgv } from '@nan0web/ui-cli'

describe('Release v3.7.3: Live Tail, Detected Language & Whisper Models Catalog', () => {
	it('1. @nan0web/ai exports MLX_MODEL_META and parseMlxProgressLine parses language and text', () => {
		assert.ok(MLX_MODEL_META, 'MLX_MODEL_META should be exported')
		assert.ok(MLX_MODEL_META.medium?.sizeLabel, 'medium model metadata should have sizeLabel')

		const langEvent = parseMlxProgressLine('Detected language: Ukrainian')
		assert.equal(langEvent.language, 'Ukrainian')

		const segEvent = parseMlxProgressLine('[00:00.000 --> 00:05.500] Привіт, це тестовий запис!')
		assert.equal(segEvent.percent, 2)
		assert.equal(segEvent.text, 'Привіт, це тестовий запис!')
	})

	it('2. WhisperTranscriptionService forwards options.quality instead of hardcoding medium', async () => {
		let capturedQuality = null
		const mockDownloadModel = {
			run: async function* () {
				yield { status: 'done', transcript: JSON.stringify({ text: 'ok', segments: [] }) }
			},
		}

		// Spy on MediaDownloadModel constructor via WhisperTranscriptionService when downloadModel is not passed
		const db = new DB()
		let createdModel = null
		const origFactory = WhisperTranscriptionService.createDownloadModel
		WhisperTranscriptionService.createDownloadModel = (data, context) => {
			capturedQuality = data.quality
			createdModel = mockDownloadModel
			return createdModel
		}

		try {
			const gen = WhisperTranscriptionService.transcribe({
				url: 'test.m4a',
				outputDir: '.',
				quality: 'turbo',
				t: (s) => s,
				db,
				context: { db },
			})
			while (!(await gen.next()).done) {}
			assert.equal(capturedQuality, 'turbo', 'quality must be forwarded from options')
		} finally {
			WhisperTranscriptionService.createDownloadModel = origFactory
		}
	})

	it('3. TranscribeCommand shows model name and size on start and logs detected language once per change', async () => {
		const db = new DB()
		await db.saveDocument('audio.m4a', 'FAKE')

		const mockWhisper = {
			transcribe: async function* () {
				yield { type: 'progress', message: '🧠 Whisper chunk 1/2: [10%]', value: 10, total: 100, language: 'Ukrainian', text: 'Перший рядок' }
				yield { type: 'progress', message: '🧠 Whisper chunk 1/2: [50%]', value: 50, total: 100, language: 'Ukrainian', text: 'Другий рядок' }
				yield { type: 'progress', message: '🧠 Whisper chunk 2/2: [80%]', value: 80, total: 100, language: 'English', text: 'Third line' }
				return { whisperJson: { text: 'Перший рядок\nДругий рядок\nThird line', segments: [] }, transcriptPath: 'transcript.json' }
			},
		}

		const cmd = new TranscribeCommand(
			{ input: 'audio.m4a', quality: 'turbo', format: ['text'], tail: 2 },
			{ db, whisperService: mockWhisper }
		)

		const events = []
		for await (const ev of cmd.run()) {
			events.push(ev)
		}

		const showMsgs = events.filter((e) => e.type === 'show').map((e) => e.message)
		assert.ok(
			showMsgs.some((m) => m.includes('model: turbo') && m.includes('~')),
			`Expected start message with model & size, got: ${JSON.stringify(showMsgs)}`
		)

		const langMsgs = showMsgs.filter((m) => m.includes('Detected language:'))
		assert.equal(langMsgs.length, 2, `Expected 2 language log messages (Ukrainian, then English), got: ${JSON.stringify(langMsgs)}`)
		assert.ok(langMsgs[0].includes('Ukrainian'))
		assert.ok(langMsgs[1].includes('English'))

		const progressMsgs = events.filter((e) => e.type === 'progress').map((e) => e.message)
		assert.ok(
			progressMsgs.some((m) => m.includes('Перший рядок') && m.includes('Другий рядок')),
			`Expected tail lines in progress message, got: ${JSON.stringify(progressMsgs)}`
		)
	})

	it('4. TranscribeCommand and DownloadWhisperCommand define static tail field (default: 1) and respect tail=0', () => {
		assert.ok(TranscribeCommand.tail, 'TranscribeCommand.tail must exist')
		assert.equal(TranscribeCommand.tail.type, 'number')
		assert.equal(TranscribeCommand.tail.default, 1)

		assert.ok(DownloadWhisperCommand.tail, 'DownloadWhisperCommand.tail must exist')
		assert.equal(DownloadWhisperCommand.tail.type, 'number')
		assert.equal(DownloadWhisperCommand.tail.default, 1)

		const formatted = TranscribeCommand.formatTailProgress('Base msg', ['First very long line that exceeds terminal width', 'Second line'], 20, 1)
		assert.ok(!formatted.includes('First'), 'tail=1 should only keep last 1 line')
		assert.ok(formatted.includes('Second line'))

		const disabled = TranscribeCommand.formatTailProgress('Base msg', ['Second line'], 80, 0)
		assert.equal(disabled, 'Base msg', 'tail=0 should disable tail lines')
	})

	it('5. WhisperModelCatalog supports offline fallback, caching, and WhisperModelsCommand is registered in ShareAppCLI', async () => {
		const catalog = new WhisperModelCatalog({
			fetchFn: async () => {
				throw new Error('Network error')
			},
			cacheDir: '/non-existent-cache-dir-for-test',
		})

		const models = await catalog.listModels({ offline: true })
		assert.ok(Array.isArray(models) && models.length >= 6, 'Should return built-in MLX models in offline mode')
		const medium = models.find((m) => m.alias === 'medium')
		assert.ok(medium, 'Should include medium model')
		assert.equal(medium.isDefault, true)

		assert.ok(
			ShareAppCLI.command.options.includes(WhisperModelsCommand),
			'ShareAppCLI must register WhisperModelsCommand'
		)
		assert.equal(WhisperModelsCommand.alias, 'whisper:models')
	})

	it('6. TranscribeCommand and MediaDownloadModel support initialPrompt and conditionOnPreviousText (default true, inverted flag)', () => {
		assert.ok(TranscribeCommand.initialPrompt, 'TranscribeCommand.initialPrompt must exist')
		assert.equal(TranscribeCommand.initialPrompt.type, 'string')
		assert.ok(TranscribeCommand.noConditionOnPreviousText, 'TranscribeCommand.noConditionOnPreviousText must exist')
		assert.equal(TranscribeCommand.noConditionOnPreviousText.default, false)

		assert.ok(MediaDownloadModel.initialPrompt, 'MediaDownloadModel.initialPrompt must exist')
		assert.equal(MediaDownloadModel.conditionOnPreviousText.default, true)
	})

	it('7. TranscribeCommand accepts --model as alias for quality', () => {
		const cmd = new TranscribeCommand({ input: 'a.m4a', model: 'turbo' })
		assert.equal(cmd.quality, 'turbo')
		assert.equal(TranscribeCommand.quality.alias, 'model')
	})

	it('8. modelFromArgv parses --chunk-duration and --initial-prompt kebab-case flags cleanly', () => {
		assert.equal(TranscribeCommand.initialPrompt.alias, 'initial-prompt')
		assert.equal(TranscribeCommand.noConditionOnPreviousText.alias, 'no-condition-on-previous-text')
		assert.ok(TranscribeCommand.chunkDuration, 'TranscribeCommand.chunkDuration must exist')
		assert.equal(TranscribeCommand.chunkDuration.default, 300)
		assert.equal(TranscribeCommand.chunkDuration.alias, 'chunk-duration')

		const cmd = modelFromArgv(TranscribeCommand, ['--model', 'turbo', '--chunk-duration', '10', '/tmp/sample40s.m4a', '--force'])
		assert.equal(Number(cmd.chunkDuration), 10)
		assert.equal(cmd.input, '/tmp/sample40s.m4a')
		assert.equal(cmd.quality, 'turbo')
	})
})
