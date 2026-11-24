import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Model } from '@nan0web/types'
import { modelFromArgv } from '../../../../../ui/core/modelFromArgv.js'

class SampleCommand extends Model {
	static input = { type: 'string', positional: true, help: 'Input file' }
	static chunkDuration = { type: 'number', default: 300, alias: 'chunk-duration', help: 'Chunk duration' }
	static quality = { type: 'string', default: 'medium', alias: 'model', help: 'Model quality' }
}

describe('Release v3.5.2: modelFromArgv kebab-case & long alias support', () => {
	it('parses kebab-case flag --chunk-duration 10 without polluting positional input', () => {
		const cmd = modelFromArgv(SampleCommand, ['--chunk-duration', '10', '/tmp/audio.m4a'])
		assert.equal(Number(cmd.chunkDuration), 10)
		assert.equal(cmd.input, '/tmp/audio.m4a')
	})

	it('parses long alias --model turbo into quality', () => {
		const cmd = modelFromArgv(SampleCommand, ['--model', 'turbo', '/tmp/audio.m4a'])
		assert.equal(cmd.quality, 'turbo')
		assert.equal(cmd.input, '/tmp/audio.m4a')
	})
})
