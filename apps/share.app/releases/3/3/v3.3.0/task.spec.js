import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

import { TranscriptCacheService } from '../../../../src/domain/storage/TranscriptCacheService.js'
import { MediaInspectorService } from '../../../../src/domain/analysis/MediaInspectorService.js'
import { SubtitleMuxerPort } from '../../../../src/domain/pipeline/SubtitleMuxerPort.js'
import { HFEmbeddingService } from '../../../../src/domain/ai/HFEmbeddingService.js'
import { DriveBatchTranscribeCommand } from '../../../../src/domain/commands/DriveBatchTranscribeCommand.js'

describe('Release v3.3.0 Contract: Media Indexing, Soft Subtitles & HF Vector Search', () => {
	describe('1. TranscriptCacheService (Hierarchical Path Tree)', () => {
		it('should generate hierarchical cache path mirroring input file path', () => {
			const cache = new TranscriptCacheService({ baseDir: '/tmp/test-cache' })
			const targetPath = '/Volumes/MyHDD/Lectures/2026/01-Truth-Matrix.mov'
			const jsonCache = cache.getCachePath(targetPath, 'json')
			const sbvCache = cache.getCachePath(targetPath, 'sbv')

			assert.equal(
				jsonCache,
				path.normalize('/tmp/test-cache/transcripts/Volumes/MyHDD/Lectures/2026/01-Truth-Matrix.json')
			)
			assert.equal(
				sbvCache,
				path.normalize('/tmp/test-cache/transcripts/Volumes/MyHDD/Lectures/2026/01-Truth-Matrix.sbv')
			)
		})

		it('should save and load transcript data in hierarchical cache', () => {
			const tmpDir = path.join(os.tmpdir(), `cache-test-${Date.now()}`)
			const cache = new TranscriptCacheService({ baseDir: tmpDir })
			const mockVideo = '/Volumes/Work/sample.mov'
			const transcriptData = { text: 'Hello world', segments: [{ id: 0, text: 'Hello' }] }

			assert.equal(cache.has(mockVideo), false)
			cache.save(mockVideo, transcriptData)
			assert.equal(cache.has(mockVideo), true)

			const loaded = cache.load(mockVideo)
			assert.deepEqual(loaded, transcriptData)

			// Clean up
			fs.rmSync(tmpDir, { recursive: true, force: true })
		})
	})

	describe('2. MediaInspectorService (ffprobe stream inspection)', () => {
		it('should be instantiable and provide hasSubtitles and extractSubtitles methods', () => {
			const inspector = new MediaInspectorService()
			assert.equal(typeof inspector.hasSubtitles, 'function')
			assert.equal(typeof inspector.extractSubtitles, 'function')
			assert.equal(typeof inspector.getVideoMeta, 'function')
		})

		it('should parse ffprobe stream output correctly', () => {
			const inspector = new MediaInspectorService()
			const probeOutput = {
				streams: [
					{ codec_type: 'video', codec_name: 'h264' },
					{ codec_type: 'audio', codec_name: 'aac' },
					{ codec_type: 'subtitle', codec_name: 'mov_text', tags: { language: 'uk' } },
				],
			}
			const result = inspector.analyzeStreams(probeOutput)
			assert.equal(result.hasSubtitles, true)
			assert.equal(result.subtitleStreams.length, 1)
			assert.equal(result.subtitleStreams[0].codec, 'mov_text')
			assert.equal(result.subtitleStreams[0].language, 'uk')
		})
	})

	describe('3. SubtitleMuxerPort (Soft Subtitle Stream Muxing & Safe Swap)', () => {
		it('should generate valid FFmpeg stream copy muxing commands', () => {
			const muxer = new SubtitleMuxerPort()
			const cmd = muxer.buildMuxCommand({
				inputVideo: '/Volumes/MyHDD/video.mov',
				subtitlePath: '/Volumes/MyHDD/video.srt',
				outputPath: '/Volumes/MyHDD/.video.tmp.mov',
				language: 'uk',
			})

			assert.ok(cmd.includes('-c:v copy'))
			assert.ok(cmd.includes('-c:a copy'))
			assert.ok(cmd.includes('-c:s mov_text'))
			assert.ok(cmd.includes('language=uk'))
		})

		it('should safely replace original file only when temp file is valid', () => {
			const muxer = new SubtitleMuxerPort()
			const tmpDir = path.join(os.tmpdir(), `swap-test-${Date.now()}`)
			fs.mkdirSync(tmpDir, { recursive: true })

			const original = path.join(tmpDir, 'movie.mov')
			const temp = path.join(tmpDir, '.movie.tmp.mov')

			fs.writeFileSync(original, 'original-content-12345')
			fs.writeFileSync(temp, 'new-muxed-content-67890')

			const success = muxer.safeAtomicReplace({
				originalPath: original,
				tempPath: temp,
				validator: (p) => fs.existsSync(p) && fs.statSync(p).size > 0,
			})

			assert.equal(success, true)
			assert.equal(fs.existsSync(original), true)
			assert.equal(fs.existsSync(temp), false)
			assert.equal(fs.readFileSync(original, 'utf8'), 'new-muxed-content-67890')

			// Clean up
			fs.rmSync(tmpDir, { recursive: true, force: true })
		})
	})

	describe('4. HFEmbeddingService (Hugging Face Spaces Vector Embeddings)', () => {
		it('should be instantiable with space/model config', () => {
			const hf = new HFEmbeddingService({
				spaceUrl: 'https://api-inference.huggingface.co/models/BAAI/bge-m3',
				token: 'test-token',
			})
			assert.equal(typeof hf.embed, 'function')
			assert.equal(typeof hf.embedBatch, 'function')
		})

		it('should format payload correctly for Hugging Face feature extraction', () => {
			const hf = new HFEmbeddingService()
			const payload = hf.buildRequestPayload(['Text chunk 1', 'Text chunk 2'])
			assert.deepEqual(payload, {
				inputs: ['Text chunk 1', 'Text chunk 2'],
				options: { wait_for_model: true },
			})
		})
	})

	describe('5. DriveBatchTranscribeCommand (ModelAsApp CLI Command)', () => {
		it('should be importable and extend ModelAsApp with alias drive:batch-transcribe', () => {
			assert.equal(DriveBatchTranscribeCommand.alias, 'drive:batch-transcribe')
			assert.ok(DriveBatchTranscribeCommand.dir, 'dir option should be defined')
			assert.ok(DriveBatchTranscribeCommand.UI, 'UI schema should be defined')
		})
	})
})
