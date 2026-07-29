import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP = path.join(__dirname, '../../tmp-test')

describe('AudioSplitter', () => {
	it.before(() => {
		fs.mkdirSync(TMP, { recursive: true })
	})

	it.after(() => {
		fs.rmSync(TMP, { recursive: true, force: true })
	})

	it('throws when input file does not exist', async () => {
		const { AudioSplitter } = await import('../domain/AudioSplitter.js')
		await assert.rejects(
			() => AudioSplitter.split('/nonexistent/file.mp3'),
			/Input file not found/,
		)
	})

	it('splits audio into segments and calls onProgress', async () => {
		await new Promise((resolve, reject) => {
			const proc = spawn('ffmpeg', [
				'-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
				'-t', '10',
				'-acodec', 'libmp3lame',
				path.join(TMP, 'test_input.mp3'),
			], { stdio: 'ignore' })
			proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)))
			proc.on('error', reject)
		})

		const { AudioSplitter } = await import('../domain/AudioSplitter.js')
		const progressEvents = []
		const files = await AudioSplitter.split(path.join(TMP, 'test_input.mp3'), {
			segmentDuration: 5,
			outputDir: TMP,
			onProgress: (p) => progressEvents.push(p),
		})

		assert.ok(files.length >= 2, 'should create >=2 segments for 10s at 5s each')
		assert.ok(progressEvents.length >= 1, 'should emit progress')
		for (const f of files) {
			assert.ok(fs.existsSync(f), `segment exists: ${path.basename(f)}`)
		}
	})

	it('single segment for audio shorter than duration', async () => {
		await new Promise((resolve, reject) => {
			const proc = spawn('ffmpeg', [
				'-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
				'-t', '1',
				'-acodec', 'libmp3lame',
				path.join(TMP, 'test_short.mp3'),
			], { stdio: 'ignore' })
			proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)))
			proc.on('error', reject)
		})

		const { AudioSplitter } = await import('../domain/AudioSplitter.js')
		const files = await AudioSplitter.split(path.join(TMP, 'test_short.mp3'), {
			segmentDuration: 10,
			outputDir: TMP,
		})
		assert.equal(files.length, 1, 'short audio should produce 1 segment')
	})

	it('probeDuration returns null for missing file', async () => {
		const { AudioSplitter } = await import('../domain/AudioSplitter.js')
		const dur = await AudioSplitter.probeDuration('/nonexistent.mp3')
		assert.equal(dur, null)
	})

	it('probeDuration returns duration for valid file', async () => {
		const { AudioSplitter } = await import('../domain/AudioSplitter.js')
		const file = path.join(TMP, 'test_probe.mp3')
		await new Promise((resolve, reject) => {
			const proc = spawn('ffmpeg', [
				'-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
				'-t', '3',
				'-acodec', 'libmp3lame',
				file,
			], { stdio: 'ignore' })
			proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)))
			proc.on('error', reject)
		})
		const dur = await AudioSplitter.probeDuration(file)
		assert.ok(dur !== null, 'duration should not be null')
		assert.ok(Math.abs(dur - 3) < 0.5, `duration should be ~3s, got ${dur}`)
	})
})

describe('AudioSplitter — dedup', () => {
	it('mergeTranscripts returns empty for empty array', async () => {
		const { AudioSplitter } = await import('../domain/AudioSplitter.js')
		assert.equal(AudioSplitter.mergeTranscripts([]), '')
	})

	it('mergeTranscripts returns single transcript as-is', async () => {
		const { AudioSplitter } = await import('../domain/AudioSplitter.js')
		assert.equal(AudioSplitter.mergeTranscripts(['hello world']), 'hello world')
	})

	it('mergeTranscripts removes exact duplicate overlap', async () => {
		const { AudioSplitter } = await import('../domain/AudioSplitter.js')
		const result = AudioSplitter.mergeTranscripts([
			'This is the first chunk with some text.',
			'with some text. This is the second chunk.',
		])
		assert.ok(result.includes('first chunk'))
		assert.ok(result.includes('second chunk'))
		// "with some text." should be deduped
		const overlap = 'with some text.'
		const first = result.indexOf(overlap)
		const last = result.lastIndexOf(overlap)
		assert.equal(first, last, 'overlapping text should appear only once')
	})

	it('mergeTranscripts handles non-overlapping chunks', async () => {
		const { AudioSplitter } = await import('../domain/AudioSplitter.js')
		const result = AudioSplitter.mergeTranscripts([
			'First chunk content.',
			'Second chunk content with no overlap.',
		])
		assert.ok(result.includes('First chunk'))
		assert.ok(result.includes('Second chunk'))
	})

	it('_findOverlap returns 0 for very short strings', async () => {
		const { AudioSplitter } = await import('../domain/AudioSplitter.js')
		assert.equal(AudioSplitter._findOverlap('a', 'b'), 0)
		assert.equal(AudioSplitter._findOverlap('short', 'short'), 0)
	})

	it('_findOverlap detects exact overlap', async () => {
		const { AudioSplitter } = await import('../domain/AudioSplitter.js')
		// Overlap text must be at the END of prev and START of curr
		const len = AudioSplitter._findOverlap(
			'This is some text that is shared across chunks and overlap',
			'shared across chunks and overlap here is new content',
		)
		assert.ok(len > 0, 'should find overlap')
		assert.ok(len <= 50, 'overlap should not exceed maxOverlap')
	})
})