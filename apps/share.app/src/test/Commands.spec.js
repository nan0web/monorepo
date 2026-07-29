import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('ScriptGenerateCommand', () => {
	it('static alias is generate:script', async () => {
		const mod = await import('../domain/commands/ScriptGenerateCommand.js')
		assert.equal(mod.ScriptGenerateCommand.alias, 'generate:script')
	})

	it('static field definitions exist', async () => {
		const mod = await import('../domain/commands/ScriptGenerateCommand.js')
		const C = mod.ScriptGenerateCommand
		assert.ok(C.topic)
		assert.equal(C.topic.type, 'string')
		assert.equal(C.topic.required, true)
		assert.ok(C.style)
		assert.ok(C.language)
		assert.ok(C.output)
		assert.ok(C.duration)
		assert.equal(C.duration.type, 'number')
		assert.equal(C.duration.default, 60)
		assert.ok(C.platform)
	})

	it('STYLES has all style templates', async () => {
		const mod = await import('../domain/commands/ScriptGenerateCommand.js')
		assert.ok(mod.ScriptGenerateCommand.STYLES.storytelling)
		assert.ok(mod.ScriptGenerateCommand.STYLES.educational)
		assert.ok(mod.ScriptGenerateCommand.STYLES.promotional)
		assert.ok(mod.ScriptGenerateCommand.STYLES.hook)
		assert.ok(mod.ScriptGenerateCommand.STYLES.article)
	})

	it('_resolveStyle returns instructions for known style', async () => {
		const mod = await import('../domain/commands/ScriptGenerateCommand.js')
		const instructions = mod.ScriptGenerateCommand._resolveStyle('educational')
		assert.ok(instructions.includes('clear, structured lesson'))
		assert.ok(instructions.includes('Hook'))
	})

	it('_resolveStyle falls back to storytelling for unknown style', async () => {
		const mod = await import('../domain/commands/ScriptGenerateCommand.js')
		const instructions = mod.ScriptGenerateCommand._resolveStyle('nonexistent')
		assert.ok(instructions.includes('compelling narrative'))
	})

	it('_platformTip returns tips for known platforms', async () => {
		const mod = await import('../domain/commands/ScriptGenerateCommand.js')
		assert.ok(mod.ScriptGenerateCommand._platformTip('youtube').includes('search'))
		assert.ok(mod.ScriptGenerateCommand._platformTip('tiktok').includes('vertical'))
		assert.ok(mod.ScriptGenerateCommand._platformTip('instagram').includes('aesthetic'))
		assert.ok(mod.ScriptGenerateCommand._platformTip('linkedin').includes('Professional'))
	})

	it('_platformTip returns empty for unknown platform', async () => {
		const mod = await import('../domain/commands/ScriptGenerateCommand.js')
		assert.equal(mod.ScriptGenerateCommand._platformTip('unknown'), '')
	})

	it('constructor — sets fields from data', async () => {
		const mod = await import('../domain/commands/ScriptGenerateCommand.js')
		const cmd = new mod.ScriptGenerateCommand({
			topic: 'Test topic',
			style: 'hook',
			language: 'uk',
			duration: 30,
			platform: 'tiktok',
		})
		assert.equal(cmd.topic, 'Test topic')
		assert.equal(cmd.style, 'hook')
		assert.equal(cmd.language, 'uk')
		assert.equal(cmd.duration, 30)
		assert.equal(cmd.platform, 'tiktok')
	})

	it('run — yields error when topic is missing', async () => {
		const mod = await import('../domain/commands/ScriptGenerateCommand.js')
		const cmd = new mod.ScriptGenerateCommand({})
		const intents = []
		for await (const intent of cmd.run()) {
			intents.push(intent)
		}
		const errLog = intents.find(i => i.type === 'log' && i.level === 'error')
		assert.ok(errLog, 'should yield error log')
		assert.ok(errLog.message.includes('Topic'))
	})
})

describe('PublishCommand', () => {
	it('static alias is publish', async () => {
		const mod = await import('../domain/commands/PublishCommand.js')
		assert.equal(mod.PublishCommand.alias, 'publish')
	})

	it('static field definitions exist', async () => {
		const mod = await import('../domain/commands/PublishCommand.js')
		const C = mod.PublishCommand
		assert.ok(C.videoPath)
		assert.equal(C.videoPath.required, true)
		assert.ok(C.title)
		assert.equal(C.title.required, true)
		assert.ok(C.description)
		assert.equal(C.description.required, true)
		assert.ok(C.platforms)
		assert.ok(C.tags)
		assert.ok(C.credentials)
		assert.ok(C.language)
	})

	it('ADAPTER_MAP has expected adapters', async () => {
		const mod = await import('../domain/commands/PublishCommand.js')
		const map = mod.PublishCommand.ADAPTER_MAP
		assert.ok(map.youtube)
		assert.ok(map.telegram)
		assert.ok(map.medium)
		assert.ok(map.dummy)
	})

	it('constructor — sets fields from data', async () => {
		const mod = await import('../domain/commands/PublishCommand.js')
		const cmd = new mod.PublishCommand({
			videoPath: 'video.mp4',
			title: 'Test',
			description: 'Desc',
			tags: 'tag1,tag2',
			language: 'uk',
		})
		assert.equal(cmd.videoPath, 'video.mp4')
		assert.equal(cmd.title, 'Test')
		assert.equal(cmd.description, 'Desc')
		assert.equal(cmd.tags, 'tag1,tag2')
		assert.equal(cmd.language, 'uk')
	})
})

describe('ShortsGenerateCommand', () => {
	it('static alias is generate:shorts', async () => {
		const mod = await import('../domain/commands/ShortsGenerateCommand.js')
		assert.equal(mod.ShortsGenerateCommand.alias, 'generate:shorts')
	})

	it('static field definitions exist', async () => {
		const mod = await import('../domain/commands/ShortsGenerateCommand.js')
		const C = mod.ShortsGenerateCommand
		assert.ok(C.shortsYaml)
		assert.ok(C.videoPath)
		assert.ok(C.imgPath)
		assert.ok(C.outputDir)
		assert.ok(C.transcriptPath)
		assert.ok(C.useHardwareAcceleration)
		assert.equal(C.useHardwareAcceleration.type, 'boolean')
		assert.ok(C.auto)
		assert.equal(C.auto.type, 'boolean')
		assert.ok(C.autoDuration)
		assert.equal(C.autoDuration.default, 30)
	})

	it('constructor — sets fields from data', async () => {
		const mod = await import('../domain/commands/ShortsGenerateCommand.js')
		const cmd = new mod.ShortsGenerateCommand({
			shortsYaml: 'config.yaml',
			videoPath: 'video.mp4',
			outputDir: 'out',
			auto: true,
			autoDuration: 15,
		})
		assert.equal(cmd.shortsYaml, 'config.yaml')
		assert.equal(cmd.videoPath, 'video.mp4')
		assert.equal(cmd.outputDir, 'out')
		assert.equal(cmd.auto, true)
		assert.equal(cmd.autoDuration, 15)
	})

	it('_autoSegment — empty segments for no words', async () => {
		const mod = await import('../domain/commands/ShortsGenerateCommand.js')
		const cmd = new mod.ShortsGenerateCommand({})
		const result = cmd._autoSegment({ segments: [] }, 30)
		assert.deepEqual(result, [])
	})

	it('_autoSegment — creates segments from word timestamps', async () => {
		const mod = await import('../domain/commands/ShortsGenerateCommand.js')
		const cmd = new mod.ShortsGenerateCommand({})
		const transcript = {
			segments: [{
				words: [
					{ text: 'Hello', start: 0, end: 0.5 },
					{ text: 'world', start: 0.5, end: 1.0 },
					{ text: 'this', start: 1.0, end: 1.5 },
					{ text: 'is', start: 1.5, end: 2.0 },
					{ text: 'a', start: 2.0, end: 2.5 },
					{ text: 'test', start: 2.5, end: 3.0 },
				],
			}],
		}
		const segments = cmd._autoSegment(transcript, 2)
		assert.ok(segments.length >= 1)
		assert.equal(segments[0].label, 'short_1')
		assert.equal(typeof segments[0].start, 'number')
		assert.equal(typeof segments[0].end, 'number')
	})

	it('run — yields error when no input provided', async () => {
		const mod = await import('../domain/commands/ShortsGenerateCommand.js')
		const cmd = new mod.ShortsGenerateCommand({})
		const intents = []
		for await (const intent of cmd.run()) {
			intents.push(intent)
		}
		const errLog = intents.find(i => i.type === 'log' && i.level === 'error')
		assert.ok(errLog, 'should yield error log')
		assert.ok(errLog.message.includes('--shortsYaml') || errLog.message.includes('--auto'))
	})
})

describe('SubtitleGenerateCommand', () => {
	it('static alias is generate:subtitles', async () => {
		const mod = await import('../domain/commands/SubtitleGenerateCommand.js')
		assert.equal(mod.SubtitleGenerateCommand.alias, 'generate:subtitles')
	})

	it('static field definitions exist', async () => {
		const mod = await import('../domain/commands/SubtitleGenerateCommand.js')
		const C = mod.SubtitleGenerateCommand
		assert.ok(C.transcriptPath)
		assert.equal(C.transcriptPath.required, true)
		assert.ok(C.videoDuration)
		assert.equal(C.videoDuration.required, true)
		assert.ok(C.outputPath)
		assert.ok(C.maxBlockWidth)
		assert.equal(C.maxBlockWidth.default, 850)
		assert.ok(C.maxWordsPerBlock)
		assert.equal(C.maxWordsPerBlock.default, 3)
	})

	it('constructor — sets fields from data', async () => {
		const mod = await import('../domain/commands/SubtitleGenerateCommand.js')
		const cmd = new mod.SubtitleGenerateCommand({
			transcriptPath: 'tr.json',
			videoDuration: 60,
			outputPath: 'subs.ass',
			maxBlockWidth: 800,
		})
		assert.equal(cmd.transcriptPath, 'tr.json')
		assert.equal(cmd.videoDuration, 60)
		assert.equal(cmd.outputPath, 'subs.ass')
		assert.equal(cmd.maxBlockWidth, 800)
	})

	it('run — yields error when transcript file not found', async () => {
		const mod = await import('../domain/commands/SubtitleGenerateCommand.js')
		const cmd = new mod.SubtitleGenerateCommand({
			transcriptPath: '/nonexistent/path/tr.json',
			videoDuration: 60,
		})
		const intents = []
		for await (const intent of cmd.run()) {
			intents.push(intent)
		}
		const errLog = intents.find(i => i.type === 'log' && i.level === 'error')
		assert.ok(errLog, 'should yield error log')
		assert.ok(errLog.message.includes('Error accessing'))
	})
})

describe('VideoCompileCommand', () => {
	it('static alias is compile:video', async () => {
		const mod = await import('../domain/commands/VideoCompileCommand.js')
		assert.equal(mod.VideoCompileCommand.alias, 'compile:video')
	})

	it('static field definitions exist', async () => {
		const mod = await import('../domain/commands/VideoCompileCommand.js')
		const C = mod.VideoCompileCommand
		assert.ok(C.episodeDir)
		assert.equal(C.episodeDir.required, true)
		assert.ok(C.sourceVideoPath)
		assert.ok(C.sourceAudioPath)
		assert.ok(C.sourceTextPath)
		assert.ok(C.subtitlePath)
		assert.ok(C.shortsDir)
		assert.ok(C.outputPath)
		assert.ok(C.useHardwareAcceleration)
		assert.equal(C.useHardwareAcceleration.type, 'boolean')
	})

	it('constructor — sets fields from data', async () => {
		const mod = await import('../domain/commands/VideoCompileCommand.js')
		const cmd = new mod.VideoCompileCommand({
			episodeDir: './episode',
			sourceVideoPath: 'video.mp4',
			subtitlePath: 'subs.ass',
			useHardwareAcceleration: true,
		})
		assert.equal(cmd.episodeDir, './episode')
		assert.equal(cmd.sourceVideoPath, 'video.mp4')
		assert.equal(cmd.subtitlePath, 'subs.ass')
		assert.equal(cmd.useHardwareAcceleration, true)
	})

	it('_getVideoEncoder — returns videotoolbox when HW enabled', async () => {
		const mod = await import('../domain/commands/VideoCompileCommand.js')
		const cmd = new mod.VideoCompileCommand({ episodeDir: '.', useHardwareAcceleration: true })
		const enc = cmd._getVideoEncoder()
		assert.equal(enc.codec, 'h264_videotoolbox')
		assert.equal(enc.opts, '-b:v 5M')
	})

	it('_getVideoEncoder — returns libx264 when HW disabled', async () => {
		const mod = await import('../domain/commands/VideoCompileCommand.js')
		const cmd = new mod.VideoCompileCommand({ episodeDir: '.', useHardwareAcceleration: false })
		const enc = cmd._getVideoEncoder()
		assert.equal(enc.codec, 'libx264')
		assert.equal(enc.opts, '-preset medium -crf 23')
	})

	it('run — yields error when no source provided', async () => {
		const mod = await import('../domain/commands/VideoCompileCommand.js')
		const cmd = new mod.VideoCompileCommand({ episodeDir: '.' })
		const intents = []
		for await (const intent of cmd.run()) {
			intents.push(intent)
		}
		const errLog = intents.find(i => i.type === 'log' && i.level === 'error')
		assert.ok(errLog, 'should yield error log')
		assert.ok(errLog.message.includes('No valid source'))
	})

	it('run — yields warn for text source', async () => {
		const mod = await import('../domain/commands/VideoCompileCommand.js')
		const cmd = new mod.VideoCompileCommand({ episodeDir: '.', sourceTextPath: 'script.txt' })
		const intents = []
		for await (const intent of cmd.run()) {
			intents.push(intent)
		}
		const warnLog = intents.find(i => i.type === 'log' && i.level === 'warn')
		assert.ok(warnLog, 'should yield warn log')
		assert.ok(warnLog.message.includes('not fully implemented'))
	})

	it('getFilesFromDirectory — returns empty for missing dir', async () => {
		const mod = await import('../domain/commands/VideoCompileCommand.js')
		const cmd = new mod.VideoCompileCommand({ episodeDir: '.' })
		const files = await cmd.getFilesFromDirectory('/nonexistent-dir-12345', '.mp4')
		assert.deepEqual(files, [])
	})
})