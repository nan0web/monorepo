import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

/**
 * Release v3.2.0 — Universal Video Processing Pipeline Contract.
 *
 * Composable Node-format pipeline: Whisper → Pause Detection → Cut Map → Chapter Segmentation.
 * Each test MUST be Red before implementation begins.
 */
describe('Release v3.2.0 — Video Processing Pipeline', () => {

	// ─── 1. PipelineNode (Composable Node Architecture) ───

	describe('PipelineNode', () => {
		it('should be importable as a base class', async () => {
			const { PipelineNode } = await import('../../domain/pipeline/PipelineNode.js')
			assert.ok(PipelineNode)
			assert.equal(typeof PipelineNode, 'function')
		})

		it('should define abstract process() method', async () => {
			const { PipelineNode } = await import('../../domain/pipeline/PipelineNode.js')
			const node = new PipelineNode()
			await assert.rejects(() => node.process({}), /process\(\) must be implemented/)
		})

		it('should compose a chain of nodes via static compose()', async () => {
			const { PipelineNode } = await import('../../domain/pipeline/PipelineNode.js')

			class AddOneNode extends PipelineNode {
				async process(input) { return { value: (input.value || 0) + 1 } }
			}
			class DoubleNode extends PipelineNode {
				async process(input) { return { value: input.value * 2 } }
			}

			const pipeline = PipelineNode.compose([AddOneNode, DoubleNode])
			const result = await pipeline.execute({ value: 3 })
			// (3 + 1) * 2 = 8
			assert.equal(result.value, 8)
		})

		it('should support pipe() for chaining individual nodes', async () => {
			const { PipelineNode } = await import('../../domain/pipeline/PipelineNode.js')

			class IncrementNode extends PipelineNode {
				async process(input) { return { value: (input.value || 0) + 1 } }
			}

			const a = new IncrementNode()
			const b = new IncrementNode()
			a.pipe(b)
			const result = await a.execute({ value: 0 })
			// 0 + 1 + 1 = 2
			assert.equal(result.value, 2)
		})
	})

	// ─── 2. SilencePauseAnalyzer ───

	describe('SilencePauseAnalyzer', () => {
		/** @type {import('../../domain/analysis/SilencePauseAnalyzer.js').SilencePauseAnalyzer} */
		let SilencePauseAnalyzer

		const MOCK_WHISPER_JSON = {
			text: 'Привіт друзі сьогодні ми розглянемо нові плагіни для відеомонтажу',
			segments: [{
				id: 0,
				start: 0.0,
				end: 8.5,
				text: 'Привіт друзі сьогодні ми розглянемо нові плагіни для відеомонтажу',
				words: [
					{ word: 'Привіт', start: 0.0, end: 0.4 },
					{ word: 'друзі', start: 0.5, end: 0.9 },
					// -- long pause: 1.6s (topic boundary) --
					{ word: 'сьогодні', start: 2.5, end: 3.0 },
					{ word: 'ми', start: 3.05, end: 3.15 },
					{ word: 'розглянемо', start: 3.2, end: 3.8 },
					// -- medium pause: 1.2s --
					{ word: 'нові', start: 5.0, end: 5.3 },
					{ word: 'плагіни', start: 5.35, end: 5.8 },
					{ word: 'для', start: 5.85, end: 5.95 },
					{ word: 'відеомонтажу', start: 6.0, end: 6.8 },
				],
			}],
		}

		it('should be importable', async () => {
			const mod = await import('../../domain/analysis/SilencePauseAnalyzer.js')
			SilencePauseAnalyzer = mod.SilencePauseAnalyzer
			assert.ok(SilencePauseAnalyzer)
		})

		it('should detect pauses above threshold from Whisper JSON', async () => {
			const mod = await import('../../domain/analysis/SilencePauseAnalyzer.js')
			SilencePauseAnalyzer = mod.SilencePauseAnalyzer

			const analyzer = new SilencePauseAnalyzer()
			const pauses = analyzer.analyze(MOCK_WHISPER_JSON, { minPauseDuration: 0.8 })

			assert.ok(Array.isArray(pauses))
			assert.ok(pauses.length >= 2, `Expected at least 2 pauses, got ${pauses.length}`)

			// First pause: 0.9 → 2.5 = 1.6s
			const firstPause = pauses[0]
			assert.ok(firstPause.duration >= 1.5, `First pause duration: ${firstPause.duration}`)
			assert.equal(typeof firstPause.start, 'number')
			assert.equal(typeof firstPause.end, 'number')
		})

		it('should classify pause types: silence, breath, topic_boundary', async () => {
			const mod = await import('../../domain/analysis/SilencePauseAnalyzer.js')
			const analyzer = new mod.SilencePauseAnalyzer()
			const pauses = analyzer.analyze(MOCK_WHISPER_JSON, { minPauseDuration: 0.8 })

			// Long pause (>1.5s) should be classified as topic_boundary
			const topicBoundary = pauses.find(p => p.type === 'topic_boundary')
			assert.ok(topicBoundary, 'Expected at least one topic_boundary pause')
		})

		it('should return empty array for transcript without pauses', async () => {
			const mod = await import('../../domain/analysis/SilencePauseAnalyzer.js')
			const analyzer = new mod.SilencePauseAnalyzer()

			const noPauses = {
				segments: [{
					words: [
						{ word: 'a', start: 0.0, end: 0.1 },
						{ word: 'b', start: 0.12, end: 0.2 },
						{ word: 'c', start: 0.22, end: 0.3 },
					],
				}],
			}
			const pauses = analyzer.analyze(noPauses, { minPauseDuration: 0.8 })
			assert.equal(pauses.length, 0)
		})
	})

	// ─── 3. CutMapGenerator ───

	describe('CutMapGenerator', () => {
		const MOCK_PAUSES = [
			{ start: 0.9, end: 2.5, duration: 1.6, type: 'topic_boundary' },
			{ start: 3.8, end: 5.0, duration: 1.2, type: 'silence' },
		]

		const MOCK_WORDS = [
			{ word: 'Привіт', start: 0.0, end: 0.4 },
			{ word: 'друзі', start: 0.5, end: 0.9 },
			{ word: 'сьогодні', start: 2.5, end: 3.0 },
			{ word: 'ми', start: 3.05, end: 3.15 },
			{ word: 'розглянемо', start: 3.2, end: 3.8 },
			{ word: 'нові', start: 5.0, end: 5.3 },
			{ word: 'плагіни', start: 5.35, end: 5.8 },
			{ word: 'для', start: 5.85, end: 5.95 },
			{ word: 'відеомонтажу', start: 6.0, end: 6.8 },
		]

		it('should be importable', async () => {
			const mod = await import('../../domain/generation/CutMapGenerator.js')
			assert.ok(mod.CutMapGenerator)
		})

		it('should generate a cut-map object with segments from pauses and words', async () => {
			const mod = await import('../../domain/generation/CutMapGenerator.js')
			const generator = new mod.CutMapGenerator()

			const cutMap = generator.generate({
				pauses: MOCK_PAUSES,
				words: MOCK_WORDS,
				source: 'test-video.mp4',
				defaultAspectRatio: '16:9',
			})

			assert.ok(cutMap)
			assert.equal(cutMap.version, 1)
			assert.equal(cutMap.source, 'test-video.mp4')
			assert.equal(cutMap.aspectRatio, '16:9')
			assert.ok(Array.isArray(cutMap.segments))
			assert.ok(cutMap.segments.length >= 2, `Expected >= 2 segments, got ${cutMap.segments.length}`)
		})

		it('should produce segments with label, start, end, type, and optional aspectRatio', async () => {
			const mod = await import('../../domain/generation/CutMapGenerator.js')
			const generator = new mod.CutMapGenerator()

			const cutMap = generator.generate({
				pauses: MOCK_PAUSES,
				words: MOCK_WORDS,
				source: 'test-video.mp4',
			})

			const seg = cutMap.segments[0]
			assert.ok(seg.label, 'Segment should have a label')
			assert.equal(typeof seg.start, 'number')
			assert.equal(typeof seg.end, 'number')
			assert.ok(seg.type, 'Segment should have a type')
		})

		it('should serialize cut-map to YAML string', async () => {
			const mod = await import('../../domain/generation/CutMapGenerator.js')
			const generator = new mod.CutMapGenerator()

			const cutMap = generator.generate({
				pauses: MOCK_PAUSES,
				words: MOCK_WORDS,
				source: 'video.mp4',
			})

			const yaml = mod.CutMapGenerator.toYaml(cutMap)
			assert.equal(typeof yaml, 'string')
			assert.ok(yaml.includes('version:'), 'YAML should contain version field')
			assert.ok(yaml.includes('segments:'), 'YAML should contain segments field')
			assert.ok(yaml.includes('start:'), 'YAML should contain start timestamps')
		})
	})

	// ─── 4. ChapterSegmenter ───

	describe('ChapterSegmenter', () => {
		const MOCK_WHISPER_JSON = {
			text: 'Привіт друзі сьогодні ми розглянемо перший плагін він називається SuperEdit а тепер перейдемо до другого плагіну FastCut',
			segments: [
				{
					id: 0, start: 0.0, end: 10.0,
					text: 'Привіт друзі сьогодні ми розглянемо перший плагін він називається SuperEdit',
					words: [
						{ word: 'Привіт', start: 0.0, end: 0.4 },
						{ word: 'друзі', start: 0.5, end: 0.9 },
						{ word: 'сьогодні', start: 2.5, end: 3.0 },
						{ word: 'ми', start: 3.1, end: 3.2 },
						{ word: 'розглянемо', start: 3.3, end: 3.9 },
						{ word: 'перший', start: 4.0, end: 4.3 },
						{ word: 'плагін', start: 4.4, end: 4.8 },
						{ word: 'він', start: 5.0, end: 5.1 },
						{ word: 'називається', start: 5.2, end: 5.8 },
						{ word: 'SuperEdit', start: 5.9, end: 6.5 },
					],
				},
				{
					id: 1, start: 12.0, end: 22.0,
					text: 'а тепер перейдемо до другого плагіну FastCut',
					words: [
						{ word: 'а', start: 12.0, end: 12.1 },
						{ word: 'тепер', start: 12.2, end: 12.5 },
						{ word: 'перейдемо', start: 12.6, end: 13.2 },
						{ word: 'до', start: 13.3, end: 13.4 },
						{ word: 'другого', start: 13.5, end: 13.9 },
						{ word: 'плагіну', start: 14.0, end: 14.5 },
						{ word: 'FastCut', start: 14.6, end: 15.2 },
					],
				},
			],
		}

		const MOCK_PAUSES = [
			{ start: 6.5, end: 12.0, duration: 5.5, type: 'topic_boundary' },
		]

		it('should be importable', async () => {
			const mod = await import('../../domain/generation/ChapterSegmenter.js')
			assert.ok(mod.ChapterSegmenter)
		})

		it('should segment transcript into chapters based on pauses', async () => {
			const mod = await import('../../domain/generation/ChapterSegmenter.js')
			const segmenter = new mod.ChapterSegmenter()

			const chapters = segmenter.segment({
				transcript: MOCK_WHISPER_JSON,
				pauses: MOCK_PAUSES,
			})

			assert.ok(Array.isArray(chapters))
			assert.ok(chapters.length >= 2, `Expected >= 2 chapters, got ${chapters.length}`)
		})

		it('should produce chapters with title, startTime, endTime, text', async () => {
			const mod = await import('../../domain/generation/ChapterSegmenter.js')
			const segmenter = new mod.ChapterSegmenter()

			const chapters = segmenter.segment({
				transcript: MOCK_WHISPER_JSON,
				pauses: MOCK_PAUSES,
			})

			const ch = chapters[0]
			assert.ok(ch.title, 'Chapter must have a title')
			assert.equal(typeof ch.startTime, 'number')
			assert.equal(typeof ch.endTime, 'number')
			assert.ok(ch.text, 'Chapter must have text content')
		})

		it('should snap chapter boundaries to nearest pause points', async () => {
			const mod = await import('../../domain/generation/ChapterSegmenter.js')
			const segmenter = new mod.ChapterSegmenter()

			const chapters = segmenter.segment({
				transcript: MOCK_WHISPER_JSON,
				pauses: MOCK_PAUSES,
			})

			// First chapter should end at the topic_boundary pause start (6.5)
			assert.ok(chapters[0].endTime <= 6.5 + 0.1,
				`Chapter 1 endTime (${chapters[0].endTime}) should be near pause start 6.5`)
			// Second chapter should start at or near the pause end (12.0)
			assert.ok(chapters[1].startTime >= 12.0 - 0.1,
				`Chapter 2 startTime (${chapters[1].startTime}) should be near pause end 12.0`)
		})
	})
})
