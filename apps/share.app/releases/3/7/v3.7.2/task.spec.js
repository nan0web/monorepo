import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DownloadWhisperCommand } from '../../../../src/domain/commands/DownloadWhisperCommand.js'
import { MediaDownloadModel } from '../../../../src/domain/MediaDownloadModel.js'
import { YouTubeDownloader } from '../../../../src/domain/YouTubeDownloader.js'
import { AudioSplitter } from '../../../../src/domain/AudioSplitter.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP = path.join(__dirname, 'tmp-v372-test')

describe('Release v3.7.2: Save Video in download:whisper', () => {
	it.before(() => {
		fs.mkdirSync(TMP, { recursive: true })
	})

	it.after(() => {
		fs.rmSync(TMP, { recursive: true, force: true })
	})

	it('DownloadWhisperCommand defines static saveVideo boolean field', () => {
		assert.ok(DownloadWhisperCommand.saveVideo, 'saveVideo static field should exist')
		assert.equal(DownloadWhisperCommand.saveVideo.type, 'boolean')
		assert.equal(DownloadWhisperCommand.saveVideo.default, false)
	})

	it('MediaDownloadModel defines static saveVideo field with default false', () => {
		assert.ok(MediaDownloadModel.saveVideo, 'MediaDownloadModel.saveVideo should exist')
		assert.equal(MediaDownloadModel.saveVideo.default, false)
		const model = new MediaDownloadModel({ saveVideo: true })
		assert.equal(model.saveVideo, true)
	})

	it('YouTubeDownloader exposes downloadVideo delegating to port.downloadVideo', async () => {
		assert.equal(typeof YouTubeDownloader.downloadVideo, 'function', 'YouTubeDownloader.downloadVideo must be a function')
		let calledWith = null
		const mockPort = {
			downloadVideo: async (url, outputDir, onProgress, options) => {
				calledWith = { url, outputDir, options }
				return { filePath: path.join(outputDir, 'video.mp4'), title: 'Test Video' }
			},
		}
		const res = await YouTubeDownloader.downloadVideo('https://www.facebook.com/share/v/1Drpr9S39U/', TMP, undefined, {
			downloader: mockPort,
		})
		assert.equal(res.title, 'Test Video')
		assert.equal(calledWith.url, 'https://www.facebook.com/share/v/1Drpr9S39U/')
		assert.equal(calledWith.outputDir, TMP)
	})

	it('MediaDownloadModel keeps video file when saveVideo is true and places it beside output', async () => {
		const outDir = path.join(TMP, 'saved-output')
		fs.mkdirSync(outDir, { recursive: true })
		const expectedVideo = path.join(outDir, 'my-video.mp4')
		const segmentFile = path.join(TMP, 'seg_000.mp3')
		const transcriptFile = path.join(TMP, 'seg_000.txt')

		let downloadVideoCalled = false
		const mockDownloader = {
			downloadVideo: async (url, outputDir, _onProgress, options) => {
				downloadVideoCalled = true
				const target = path.join(outputDir, `${options.filename || 'video'}.mp4`)
				fs.writeFileSync(target, 'FAKE_MP4_DATA')
				return { filePath: target, title: 'My Video' }
			},
			downloadAudio: async () => {
				throw new Error('downloadAudio should not be called when saveVideo is true')
			},
		}

		// Stub AudioSplitter.split and AI.prototype.transcribe via options or monkey-patch
		const origSplit = AudioSplitter.split
		const origMerge = AudioSplitter.mergeTranscripts
		const { AI } = await import('@nan0web/ai')
		const origTranscribe = AI.prototype.transcribe

		AudioSplitter.split = async () => {
			fs.writeFileSync(segmentFile, 'FAKE_AUDIO')
			return [segmentFile]
		}
		AudioSplitter.mergeTranscripts = (chunks) => chunks.join('\n')
		AI.prototype.transcribe = async () => {
			fs.writeFileSync(transcriptFile, 'Привіт світе')
			return { filePaths: [transcriptFile] }
		}

		try {
			const model = new MediaDownloadModel(
				{
					url: 'https://www.facebook.com/share/v/1Drpr9S39U/',
					saveVideo: true,
					output: path.join(outDir, 'my-video.txt'),
					format: 'txt',
				},
				{ downloader: mockDownloader }
			)

			const updates = []
			for await (const u of model.run()) {
				updates.push(u)
			}

			assert.ok(downloadVideoCalled, 'downloadVideo must be called')
			assert.ok(fs.existsSync(expectedVideo), 'Video file must be kept on disk beside output')
			const doneEvent = updates.find(u => u.status === 'done')
			assert.ok(doneEvent, 'done event must be yielded')
			assert.equal(doneEvent.videoPath, expectedVideo)
		} finally {
			AudioSplitter.split = origSplit
			AudioSplitter.mergeTranscripts = origMerge
			AI.prototype.transcribe = origTranscribe
		}
	})
})
