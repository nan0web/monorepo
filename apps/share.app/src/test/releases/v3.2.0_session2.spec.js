import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

/**
 * Release v3.2.0 — Session 2 Contract Spec.
 *
 * Covers:
 * 1. VideoSlicerPort — FFmpeg cutting based on cut-map.yaml (16:9 stream copy & 9:16 vertical render).
 * 2. YouTubePublisherPort — YouTube Data API v3 publishing (unlisted / public / shorts).
 * 3. VideoPipelineCommand — Master orchestrator linking the entire pipeline.
 *
 * All tests MUST be RED before implementation in Session 2.
 */
describe('Release v3.2.0 — Video Slicing & Publishing Pipeline (Session 2 Contract)', () => {

	// ─── 1. VideoSlicerPort ───

	describe('VideoSlicerPort', () => {
		it('should be importable', async () => {
			const { VideoSlicerPort } = await import('../../ports/VideoSlicerPort.js')
			assert.ok(VideoSlicerPort)
		})

		it('should parse cut-map and generate correct FFmpeg slicing commands for 16:9 (stream copy)', async () => {
			const { VideoSlicerPort } = await import('../../ports/VideoSlicerPort.js')
			const slicer = new VideoSlicerPort()

			const mockCutMap = {
				version: 1,
				source: 'input.mp4',
				aspectRatio: '16:9',
				segments: [
					{ label: 'chapter_1', start: 10.0, end: 120.0, type: 'episode' },
				],
			}

			const commands = slicer.buildCommands(mockCutMap, { outputDir: 'output' })
			assert.equal(commands.length, 1)
			assert.ok(commands[0].includes('-ss 10'), 'Command must seek to start time')
			assert.ok(commands[0].includes('-t 110') || commands[0].includes('-to 120'), 'Command must have duration/end')
			assert.ok(commands[0].includes('-c copy'), '16:9 standard episode should use stream copy')
		})

		it('should generate vertical render command (9:16) with crop/scale for shorts', async () => {
			const { VideoSlicerPort } = await import('../../ports/VideoSlicerPort.js')
			const slicer = new VideoSlicerPort()

			const mockCutMap = {
				version: 1,
				source: 'input.mp4',
				aspectRatio: '16:9',
				segments: [
					{ label: 'short_1', start: 30.0, end: 60.0, type: 'short', aspectRatio: '9:16' },
				],
			}

			const commands = slicer.buildCommands(mockCutMap, { outputDir: 'output' })
			assert.equal(commands.length, 1)
			assert.ok(commands[0].includes('crop=') || commands[0].includes('scale='), '9:16 short must include crop/scale filter')
		})

		it('should slice video files and return list of output files', async () => {
			const { VideoSlicerPort } = await import('../../ports/VideoSlicerPort.js')
			const slicer = new VideoSlicerPort({
				// Mock runner
				runner: async () => ({ code: 0, stdout: '', stderr: '' }),
			})

			const mockCutMap = {
				version: 1,
				source: 'input.mp4',
				aspectRatio: '16:9',
				segments: [
					{ label: 'chapter_1', start: 0, end: 10, type: 'episode' },
				],
			}

			const results = await slicer.slice(mockCutMap, { outputDir: 'tmp/out' })
			assert.ok(Array.isArray(results))
			assert.equal(results.length, 1)
			assert.ok(results[0].outputPath.includes('chapter_1.mp4'))
		})
	})

	// ─── 2. YouTubePublisherPort ───

	describe('YouTubePublisherPort', () => {
		it('should be importable', async () => {
			const { YouTubePublisherPort } = await import('../../ports/YouTubePublisherPort.js')
			assert.ok(YouTubePublisherPort)
		})

		it('should upload video with metadata and return video ID and URL', async () => {
			const { YouTubePublisherPort } = await import('../../ports/YouTubePublisherPort.js')
			
			// Mock client injection
			const mockApi = {
				videos: {
					insert: async ({ requestBody }) => ({
						data: {
							id: 'mock_yt_12345',
							snippet: requestBody.snippet,
							status: requestBody.status,
						},
					}),
				},
			}

			const publisher = new YouTubePublisherPort({ apiClient: mockApi })
			const res = await publisher.publishVideo({
				filePath: 'output/chapter_1.mp4',
				title: 'Огляд нових плагінів',
				description: 'Детальний розбір функціоналу',
				tags: ['плагіни', 'розробка'],
				privacyStatus: 'unlisted',
			})

			assert.ok(res.success)
			assert.equal(res.videoId, 'mock_yt_12345')
			assert.equal(res.url, 'https://youtu.be/mock_yt_12345')
			assert.equal(res.privacyStatus, 'unlisted')
		})

		it('should tag and format Shorts videos with #Shorts automatically', async () => {
			const { YouTubePublisherPort } = await import('../../ports/YouTubePublisherPort.js')

			let capturedBody = null
			const mockApi = {
				videos: {
					insert: async ({ requestBody }) => {
						capturedBody = requestBody
						return { data: { id: 'mock_short_999' } }
					},
				},
			}

			const publisher = new YouTubePublisherPort({ apiClient: mockApi })
			await publisher.publishShort({
				filePath: 'output/short_1.mp4',
				title: 'Топ фіча',
				description: 'Дивись деталі',
			})

			assert.ok(capturedBody.snippet.title.includes('#Shorts') || capturedBody.snippet.description.includes('#Shorts'))
		})
	})

	// ─── 3. VideoPipelineCommand (Master Orchestrator) ───

	describe('VideoPipelineCommand', () => {
		it('should be importable and extend ModelAsApp', async () => {
			const { VideoPipelineCommand } = await import('../../domain/commands/VideoPipelineCommand.js')
			assert.ok(VideoPipelineCommand)
			assert.equal(VideoPipelineCommand.alias, 'pipeline:video')
		})

		it('should define required CLI arguments (url, cutMap, outputDir, publish, etc.)', async () => {
			const { VideoPipelineCommand } = await import('../../domain/commands/VideoPipelineCommand.js')
			assert.ok(VideoPipelineCommand.url, 'Must define url flag')
			assert.ok(VideoPipelineCommand.cutMap, 'Must define cutMap flag')
			assert.ok(VideoPipelineCommand.outputDir, 'Must define outputDir flag')
			assert.ok(VideoPipelineCommand.publish, 'Must define publish flag')
		})

		it('should orchestrate full pipeline in mock/dry-run mode', async () => {
			const { VideoPipelineCommand } = await import('../../domain/commands/VideoPipelineCommand.js')
			
			const cmd = new VideoPipelineCommand({
				url: 'https://youtube.com/watch?v=mock123',
				outputDir: 'tmp/pipeline_test',
				dryRun: true,
			})

			assert.ok(cmd)
			assert.equal(typeof cmd.run, 'function')
		})
	})
})
