import { describe, it } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

describe('Release v3.6.0 — Domain Hygiene, Zero-FS & Inspector Automation Contract', () => {
	const domainDir = path.resolve('src/domain')

	it('domain services and commands should not import node:fs or node:path directly', () => {
		const targetServices = [
			'analysis/WhisperTranscriptionService.js',
			'analysis/PipelineAuditService.js',
			'generation/ArticlePipelineService.js',
			'generation/DomainContextResolver.js',
			'commands/VideoPipelineCommand.js',
			'analysis/DirectorCutAnalyzer.js',
		]

		for (const relPath of targetServices) {
			const fullPath = path.join(domainDir, relPath)
			if (fs.existsSync(fullPath)) {
				const content = fs.readFileSync(fullPath, 'utf8')
				const hasRawFs = /import\s+.*from\s+['"](node:fs|fs|node:fs\/promises)['"]/.test(content)
				const hasRawPath = /import\s+.*from\s+['"](node:path|path)['"]/.test(content)
				assert.strictEqual(
					hasRawFs,
					false,
					`Domain file ${relPath} must not import node:fs directly. Use injected db instead.`
				)
				assert.strictEqual(
					hasRawPath,
					false,
					`Domain file ${relPath} must not import node:path directly. Use db methods instead.`
				)
			}
		}
	})

	it('VideoPipelineCommand should support acrossfade option and define static UI', async () => {
		const { VideoPipelineCommand } = await import('../../../../src/domain/commands/VideoPipelineCommand.js')
		assert.ok(VideoPipelineCommand.UI, 'VideoPipelineCommand must define static UI dictionary')
		assert.ok(VideoPipelineCommand.acrossfade, 'VideoPipelineCommand must define acrossfade option')
		assert.strictEqual(VideoPipelineCommand.acrossfade.type, 'boolean')
	})

	it('DirectorCutAnalyzer should extend Model and support custom sceneAliases', async () => {
		const { DirectorCutAnalyzer } = await import('../../../../src/domain/analysis/DirectorCutAnalyzer.js')
		const { Model } = await import('@nan0web/types')
		assert.ok(DirectorCutAnalyzer.prototype instanceof Model, 'DirectorCutAnalyzer must extend Model')
		assert.ok(DirectorCutAnalyzer.sceneAliases, 'DirectorCutAnalyzer must define static sceneAliases')
	})
})
