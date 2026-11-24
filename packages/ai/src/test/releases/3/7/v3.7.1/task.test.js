import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
	MLX_MODEL_MAP,
	MLX_MODEL_META,
	parseMlxProgressLine,
	fetchMlxWhisperModels,
	buildMlxArgs,
	normalizeWhisperLanguage,
} from '../../../../../domain/WhisperEngine.js'

describe('Release v3.7.1: WhisperEngine Context Flags & Catalog', () => {
	it('1. buildMlxArgs includes --condition-on-previous-text True by default and --initial-prompt when provided', () => {
		const args = buildMlxArgs('/tmp/audio.m4a', {
			model: 'turbo',
			language: 'uk',
			format: 'json',
			outputDir: '/tmp',
			initialPrompt: 'NaN•Web, 7iOS',
		})
		assert.ok(args.includes('--initial-prompt'))
		assert.ok(args.includes('NaN•Web, 7iOS'))
		assert.ok(args.includes('--condition-on-previous-text'))
		const idx = args.indexOf('--condition-on-previous-text')
		assert.equal(args[idx + 1], 'True')
	})

	it('2. normalizeWhisperLanguage maps full language names to ISO-639-1 codes', () => {
		assert.equal(normalizeWhisperLanguage('Ukrainian'), 'uk')
		assert.equal(normalizeWhisperLanguage('English'), 'en')
		assert.equal(normalizeWhisperLanguage('uk'), 'uk')
		assert.equal(normalizeWhisperLanguage('auto'), undefined)
	})

	it('3. parseMlxProgressLine, MLX_MODEL_META and fetchMlxWhisperModels work as contracted', async () => {
		assert.ok(MLX_MODEL_MAP.turbo)
		assert.ok(MLX_MODEL_META.medium.sizeLabel)
		assert.deepEqual(parseMlxProgressLine('Detected language: Ukrainian'), { language: 'Ukrainian' })
		const models = await fetchMlxWhisperModels({ offline: true })
		assert.ok(models.length >= 6)
	})
})
