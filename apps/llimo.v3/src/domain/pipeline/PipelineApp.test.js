import { describe, it } from 'node:test'
import assert from 'node:assert'
import path from 'node:path'
import { AppPipeline } from './pipelines/AppPipeline.js'
import { PipelineRunner } from './PipelineRunner.js'

describe('Pipeline & Phase Detection Suite', () => {
	const mockFs = (files) => {
		return {
			existsSync(filePath) {
				if (files.includes(filePath)) return true
				return files.some(f => f.startsWith(filePath))
			},
			readdirSync(dirPath) {
				const matches = files
					.filter(f => f.startsWith(dirPath))
					.map(f => {
						const relative = f.slice(dirPath.length).replace(/^\//, '')
						return relative.split('/')[0]
					})
					.filter(Boolean)
				return Array.from(new Set(matches))
			}
		}
	}

	const mockFsPromises = (files) => {
		return {
			async readdir(dirPath) {
				const matches = files
					.filter(f => f.startsWith(dirPath))
					.map(f => {
						const relative = f.slice(dirPath.length).replace(/^\//, '')
						return relative.split('/')[0]
					})
					.filter(Boolean)
				return Array.from(new Set(matches))
			}
		}
	}

	it('should detect Phase 1 (SEED) when no description exists', async () => {
		const pipeline = new AppPipeline({})
		const fs = mockFs([])
		const fsPromises = mockFsPromises([])
		const phase = await pipeline.detectCurrentPhase('/app', fs, fsPromises, path)
		assert.strictEqual(phase, '1-seed')
	})

	it('should detect Phase 2 (MODEL) when description exists but no domain files', async () => {
		const pipeline = new AppPipeline({})
		const fs = mockFs([
			'/app/releases/1/0/v1.0.0/release.md'
		])
		const fsPromises = mockFsPromises([
			'/app/releases/1/0/v1.0.0/release.md'
		])
		const phase = await pipeline.detectCurrentPhase('/app', fs, fsPromises, path)
		assert.strictEqual(phase, '2-model')
	})

	it('should detect Phase 3 (CONTRACT) when description and domain model exists but no tests', async () => {
		const pipeline = new AppPipeline({})
		const fs = mockFs([
			'/app/releases/1/0/v1.0.0/release.md',
			'/app/src/domain/CalcModel.js'
		])
		const fsPromises = mockFsPromises([
			'/app/src/domain/CalcModel.js'
		])
		const phase = await pipeline.detectCurrentPhase('/app', fs, fsPromises, path)
		assert.strictEqual(phase, '3-contract')
	})

	it('should detect Phase 4 (ADAPTER) when model and tests exist but no UI adapter', async () => {
		const pipeline = new AppPipeline({})
		const fs = mockFs([
			'/app/releases/1/0/v1.0.0/release.md',
			'/app/src/domain/CalcModel.js',
			'/app/src/domain/CalcModel.test.js'
		])
		const fsPromises = mockFsPromises([
			'/app/src/domain/CalcModel.js',
			'/app/src/domain/CalcModel.test.js'
		])
		const phase = await pipeline.detectCurrentPhase('/app', fs, fsPromises, path)
		assert.strictEqual(phase, '4-adapter')
	})

	it('should detect Phase 5 (UI-CLI) when adapter exists but no CLI entry point', async () => {
		const pipeline = new AppPipeline({})
		const fs = mockFs([
			'/app/releases/1/0/v1.0.0/release.md',
			'/app/src/domain/CalcModel.js',
			'/app/src/domain/CalcModel.test.js',
			'/app/src/ui/adapter/CalcAdapter.js'
		])
		const fsPromises = mockFsPromises([
			'/app/src/domain/CalcModel.js',
			'/app/src/domain/CalcModel.test.js',
			'/app/src/ui/adapter/CalcAdapter.js'
		])
		const phase = await pipeline.detectCurrentPhase('/app', fs, fsPromises, path)
		assert.strictEqual(phase, '5-ui-cli')
	})

	it('should detect Phase 6 (UI-CHAT) when CLI exists but no Chat interface', async () => {
		const pipeline = new AppPipeline({})
		const fs = mockFs([
			'/app/releases/1/0/v1.0.0/release.md',
			'/app/src/domain/CalcModel.js',
			'/app/src/domain/CalcModel.test.js',
			'/app/src/ui/adapter/CalcAdapter.js',
			'/app/src/ui/cli/index.js'
		])
		const fsPromises = mockFsPromises([
			'/app/src/domain/CalcModel.js',
			'/app/src/domain/CalcModel.test.js',
			'/app/src/ui/adapter/CalcAdapter.js',
			'/app/src/ui/cli/index.js'
		])
		const phase = await pipeline.detectCurrentPhase('/app', fs, fsPromises, path)
		assert.strictEqual(phase, '6-ui-chat')
	})

	it('should detect Phase 7 (UI-WEB) when Chat exists but no Web interface', async () => {
		const pipeline = new AppPipeline({})
		const fs = mockFs([
			'/app/releases/1/0/v1.0.0/release.md',
			'/app/src/domain/CalcModel.js',
			'/app/src/domain/CalcModel.test.js',
			'/app/src/ui/adapter/CalcAdapter.js',
			'/app/src/ui/cli/index.js',
			'/app/src/ui/chat/index.js'
		])
		const fsPromises = mockFsPromises([
			'/app/src/domain/CalcModel.js',
			'/app/src/domain/CalcModel.test.js',
			'/app/src/ui/adapter/CalcAdapter.js',
			'/app/src/ui/cli/index.js',
			'/app/src/ui/chat/index.js'
		])
		const phase = await pipeline.detectCurrentPhase('/app', fs, fsPromises, path)
		assert.strictEqual(phase, '7-ui-web')
	})

	it('should detect Phase 8 (UI-MOBILE) when Web exists but no Mobile interface', async () => {
		const pipeline = new AppPipeline({})
		const fs = mockFs([
			'/app/releases/1/0/v1.0.0/release.md',
			'/app/src/domain/CalcModel.js',
			'/app/src/domain/CalcModel.test.js',
			'/app/src/ui/adapter/CalcAdapter.js',
			'/app/src/ui/cli/index.js',
			'/app/src/ui/chat/index.js',
			'/app/src/ui/web/index.js'
		])
		const fsPromises = mockFsPromises([
			'/app/src/domain/CalcModel.js',
			'/app/src/domain/CalcModel.test.js',
			'/app/src/ui/adapter/CalcAdapter.js',
			'/app/src/ui/cli/index.js',
			'/app/src/ui/chat/index.js',
			'/app/src/ui/web/index.js'
		])
		const phase = await pipeline.detectCurrentPhase('/app', fs, fsPromises, path)
		assert.strictEqual(phase, '8-ui-mobile')
	})

	it('should detect Phase 9 (QA) when all UI interfaces are present', async () => {
		const pipeline = new AppPipeline({})
		const fs = mockFs([
			'/app/releases/1/0/v1.0.0/release.md',
			'/app/src/domain/CalcModel.js',
			'/app/src/domain/CalcModel.test.js',
			'/app/src/ui/adapter/CalcAdapter.js',
			'/app/src/ui/cli/index.js',
			'/app/src/ui/chat/index.js',
			'/app/src/ui/web/index.js',
			'/app/src/ui/mobile/index.js'
		])
		const fsPromises = mockFsPromises([
			'/app/src/domain/CalcModel.js',
			'/app/src/domain/CalcModel.test.js',
			'/app/src/ui/adapter/CalcAdapter.js',
			'/app/src/ui/cli/index.js',
			'/app/src/ui/chat/index.js',
			'/app/src/ui/web/index.js',
			'/app/src/ui/mobile/index.js'
		])
		const phase = await pipeline.detectCurrentPhase('/app', fs, fsPromises, path)
		assert.strictEqual(phase, '9-qa')
	})

	it('should instantiate PipelineRunner and return error if name not found', async () => {
		const runner = new PipelineRunner({})
		const gen = runner.execute('invalid-name', 'task')
		let result = null
		while (true) {
			const { value, done } = await gen.next()
			if (done) {
				result = value
				break
			}
		}
		assert.strictEqual(result.ok, false)
		assert.ok(result.error.includes('not found'))
	})
})
