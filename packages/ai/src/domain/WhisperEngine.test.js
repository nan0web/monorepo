import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
	parseMlxProgressLine,
	MLX_MODEL_MAP,
	MLX_MODEL_META,
	fetchMlxWhisperModels,
} from './WhisperEngine.js'

describe('WhisperEngine: progress parsing & model catalog', () => {
	it('parses Detected language line', () => {
		const res = parseMlxProgressLine('Detected language: Ukrainian')
		assert.deepEqual(res, { language: 'Ukrainian' })
	})

	it('parses timestamp and segment text', () => {
		const res = parseMlxProgressLine('[01:15.250 --> 01:20.000]   Вітаю всіх на зустрічі!  ')
		assert.equal(res.percent, 27)
		assert.equal(res.currentTime, 80)
		assert.equal(res.text, 'Вітаю всіх на зустрічі!')
	})

	it('returns null for unrelated lines', () => {
		assert.equal(parseMlxProgressLine('Loading model weights...'), null)
		assert.equal(parseMlxProgressLine(''), null)
	})

	it('exposes MLX_MODEL_MAP and MLX_MODEL_META', () => {
		assert.equal(MLX_MODEL_MAP.medium, 'mlx-community/whisper-medium')
		assert.ok(MLX_MODEL_META.medium.sizeLabel)
		assert.ok(MLX_MODEL_META.turbo.sizeLabel)
	})

	it('fetchMlxWhisperModels parses HF API response and falls back on error', async () => {
		const mockFetch = async () => ({
			ok: true,
			json: async () => [
				{
					id: 'mlx-community/whisper-tiny',
					siblings: [{ rfilename: 'weights.npz', size: 75 * 1024 * 1024 }],
				},
				{
					id: 'mlx-community/whisper-custom-q4',
					siblings: [{ rfilename: 'model.safetensors', size: 500 * 1024 * 1024 }],
				},
			],
		})
		const list = await fetchMlxWhisperModels({ fetchFn: mockFetch })
		assert.ok(list.some((m) => m.id === 'mlx-community/whisper-tiny' && m.alias === 'tiny'))
		assert.ok(list.some((m) => m.id === 'mlx-community/whisper-custom-q4'))

		const fallback = await fetchMlxWhisperModels({
			fetchFn: async () => {
				throw new Error('offline')
			},
		})
		assert.ok(fallback.length >= 6)
	})
})
