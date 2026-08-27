import { AudioSplitter } from '../domain/AudioSplitter.js'
import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'

const DEFAULT_SEGMENT_DURATION = 300 // 5 min
const DEFAULT_OVERLAP = 2 // seconds of overlap on each side of a segment boundary

/**
 * Node.js Port extending AudioSplitter domain ModelAsApp.
 */
export class AudioSplitterPort extends AudioSplitter {
	/**
	 * Splits an audio file into fixed-duration segments with overlap using ffmpeg.
	 * @param {string} inputPath
	 * @param {Object} [options]
	 * @returns {Promise<string[]>}
	 */
	static async split(inputPath, options = {}) {
		const { segmentDuration = DEFAULT_SEGMENT_DURATION, overlap = DEFAULT_OVERLAP, outputDir = path.dirname(inputPath), onProgress } = options

		if (!fs.existsSync(inputPath)) {
			throw new Error(`Input file not found: ${inputPath}`)
		}

		const baseName = path.basename(inputPath, path.extname(inputPath))
		const totalDuration = await this.probeDuration(inputPath)

		const ext = path.extname(inputPath) || '.mp3'
		if (totalDuration !== null && totalDuration <= segmentDuration) {
			const outPath = path.join(outputDir, `${baseName}_part_000${ext}`)
			await this._extractSegment(inputPath, 0, totalDuration, outPath)
			return [outPath]
		}

		if (totalDuration === null) {
			return await this._splitFallback(inputPath, { segmentDuration, outputDir, onProgress })
		}

		const step = segmentDuration
		const segments = []
		let i = 0
		while (true) {
			const nominalStart = i * step
			if (nominalStart >= totalDuration) break
			const start = Math.max(0, nominalStart - (i > 0 ? overlap : 0))
			const end = Math.min(totalDuration, nominalStart + step + overlap)
			segments.push({ start, duration: end - start, index: i })
			i++
			if (end >= totalDuration) break
		}

		const resultFiles = []
		for (const seg of segments) {
			const outPath = path.join(outputDir, `${baseName}_part_${String(seg.index).padStart(3, '0')}${ext}`)
			await this._extractSegment(inputPath, seg.start, seg.duration, outPath)
			if (onProgress) {
				const pct = totalDuration ? Math.min(100, Math.round(((seg.start + seg.duration / 2) / totalDuration) * 100)) : null
				onProgress({ percent: pct, currentTime: seg.start, totalTime: totalDuration })
			}
			resultFiles.push(outPath)
		}

		return resultFiles
	}

	static async _splitFallback(inputPath, { segmentDuration, outputDir, onProgress }) {
		const ext = path.extname(inputPath) || '.mp3'
		const baseName = path.basename(inputPath, ext)
		const segmentPattern = path.join(outputDir, `${baseName}_part_%03d${ext}`)

		await new Promise((resolve, reject) => {
			const proc = spawn('ffmpeg', [
				'-i', inputPath,
				'-f', 'segment',
				'-segment_time', String(segmentDuration),
				'-c', 'copy',
				segmentPattern,
			], { stdio: ['ignore', 'pipe', 'pipe'] })

			let stderrBuf = ''
			proc.stderr.on('data', (chunk) => { stderrBuf += chunk.toString() })

			proc.on('close', (code) => {
				if (code === 0) resolve()
				else reject(new Error(`ffmpeg segment fallback exit ${code}\n${stderrBuf.slice(-300)}`))
			})
			proc.on('error', reject)
		})

		const files = fs.readdirSync(outputDir)
			.filter(f => f.startsWith(`${baseName}_part_`) && f.endsWith(ext))
			.map(f => path.join(outputDir, f))
			.sort()

		return files
	}

	static async probeDuration(inputPath) {
		try {
			const { stdout } = await new Promise((resolve, reject) => {
				const proc = spawn('ffprobe', [
					'-v', 'error',
					'-show_entries', 'format=duration',
					'-of', 'default=noprint_wrappers=1:nokey=1',
					inputPath,
				])
				let out = ''
				proc.stdout.on('data', (chunk) => { out += chunk.toString() })
				proc.on('close', (code) => {
					if (code === 0) resolve({ stdout: out.trim() })
					else reject(new Error('ffprobe failed'))
				})
				proc.on('error', reject)
			})
			const dur = parseFloat(stdout)
			return Number.isFinite(dur) ? dur : null
		} catch {
			return null
		}
	}

	static async _extractSegment(inputPath, startSeconds, durationSeconds, outputPath) {
		await new Promise((resolve, reject) => {
			const proc = spawn('ffmpeg', [
				'-y',
				'-ss', String(startSeconds),
				'-i', inputPath,
				'-t', String(durationSeconds),
				'-c', 'copy',
				outputPath,
			], { stdio: ['ignore', 'pipe', 'pipe'] })

			let stderrBuf = ''
			proc.stderr.on('data', (chunk) => { stderrBuf += chunk.toString() })

			proc.on('close', (code) => {
				if (code === 0) resolve()
				else reject(new Error(`ffmpeg extract exit ${code}\n${stderrBuf.slice(-300)}`))
			})
			proc.on('error', reject)
		})
	}
}
