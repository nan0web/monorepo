import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import readline from 'node:readline'

const DEFAULT_SEGMENT_DURATION = 300 // 5 min
const DEFAULT_OVERLAP = 2 // seconds of overlap on each side of a segment boundary

/**
 * Compute Levenshtein distance between two strings.
 * Used for deduplication across chunk boundaries.
 */
function levenshtein(a, b) {
	const m = a.length, n = b.length
	const dp = new Uint32Array((m + 1) * (n + 1))
	for (let i = 0; i <= m; i++) dp[i * (n + 1)] = i
	for (let j = 0; j <= n; j++) dp[j] = j
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1
			dp[i * (n + 1) + j] = Math.min(
				dp[(i - 1) * (n + 1) + j] + 1,
				dp[i * (n + 1) + j - 1] + 1,
				dp[(i - 1) * (n + 1) + j - 1] + cost,
			)
		}
	}
	return dp[m * (n + 1) + n]
}

/**
 * Normalize text for comparison: lowercase, remove punctuation, collapse whitespace.
 */
function normalize(text) {
	return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * Utility for splitting audio files into overlapping segments using ffmpeg,
 * and merging chunked transcripts with deduplication.
 */
export class AudioSplitter {
	/**
	 * Splits an audio file into fixed-duration segments with overlap.
	 * For files shorter than segmentDuration, just copies the file.
	 * @param {string} inputPath - Path to the input audio file.
	 * @param {Object} options
	 * @param {number} [options.segmentDuration=300] - Duration of each segment in seconds (default 5m).
	 * @param {number} [options.overlap=2] - Overlap in seconds on each boundary (default 2s).
	 * @param {string} [options.outputDir] - Directory to save segments (defaults to input dir).
	 * @param {function} [options.onProgress] - Callback({ percent, currentTime, totalTime })
	 * @returns {Promise<string[]>} Array of paths to the generated segments.
	 */
	static async split(inputPath, options = {}) {
		const { segmentDuration = DEFAULT_SEGMENT_DURATION, overlap = DEFAULT_OVERLAP, outputDir = path.dirname(inputPath), onProgress } = options

		if (!fs.existsSync(inputPath)) {
			throw new Error(`Input file not found: ${inputPath}`)
		}

		const baseName = path.basename(inputPath, path.extname(inputPath))
		const totalDuration = await this.probeDuration(inputPath)

		// Short file (< segmentDuration): just copy, no split
		if (totalDuration !== null && totalDuration <= segmentDuration) {
			const outPath = path.join(outputDir, `${baseName}_part_000.mp3`)
			await this._extractSegment(inputPath, 0, totalDuration, outPath)
			return [outPath]
		}

		// If we can't probe duration, fall back to ffmpeg segment mode (no overlap)
		if (totalDuration === null) {
			return await this._splitFallback(inputPath, { segmentDuration, outputDir, onProgress })
		}

		// Calculate segment boundaries with overlap.
		// Each segment extends `overlap` seconds past the nominal boundary,
		// so overlapping text from adjacent chunks can be deduped.
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

		// Extract each segment with precise -ss / -t
		const resultFiles = []
		for (const seg of segments) {
			const outPath = path.join(outputDir, `${baseName}_part_${String(seg.index).padStart(3, '0')}.mp3`)
			await this._extractSegment(inputPath, seg.start, seg.duration, outPath)
			if (onProgress) {
				const pct = totalDuration ? Math.min(100, ((seg.start + seg.duration / 2) / totalDuration) * 100) : null
				onProgress({ percent: pct, currentTime: seg.start, totalTime: totalDuration })
			}
			resultFiles.push(outPath)
		}

		return resultFiles
	}

	/**
	 * Fallback split when duration probe fails — uses ffmpeg segment muxer (no overlap).
	 * @param {string} inputPath
	 * @param {object} options
	 * @returns {Promise<string[]>}
	 */
	static async _splitFallback(inputPath, { segmentDuration, outputDir, onProgress }) {
		const baseName = path.basename(inputPath, path.extname(inputPath))
		const segmentPattern = path.join(outputDir, `${baseName}_part_%03d.mp3`)

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
			.filter(f => f.startsWith(`${baseName}_part_`) && f.endsWith('.mp3'))
			.map(f => path.join(outputDir, f))
			.sort()

		return files
	}

	/**
	 * Probe audio duration using ffprobe.
	 * @param {string} inputPath
	 * @returns {Promise<number|null>} duration in seconds, or null if probe fails
	 */
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

	/**
	 * Extract a segment from an audio file using ffmpeg.
	 * @param {string} inputPath
	 * @param {number} startSeconds
	 * @param {number} durationSeconds
	 * @param {string} outputPath
	 */
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

	/**
	 * Merge overlapping chunk transcripts with deduplication.
	 * Uses Levenshtein distance to find and remove duplicate text at chunk boundaries.
	 * @param {string[]} transcripts - Array of transcript strings, one per chunk.
	 * @returns {string} Merged transcript with duplicates removed.
	 */
	static mergeTranscripts(transcripts) {
		if (transcripts.length === 0) return ''
		if (transcripts.length === 1) return transcripts[0]

		const merged = [transcripts[0]]

		for (let i = 1; i < transcripts.length; i++) {
			const prev = merged[merged.length - 1]
			const curr = transcripts[i]

			// Find the best overlap point between end of prev and start of curr
			const overlapLen = this._findOverlap(prev, curr)
			if (overlapLen > 0) {
				// Remove the overlapping portion from curr's beginning
				merged[merged.length - 1] = prev + curr.slice(overlapLen)
			} else {
				merged[merged.length - 1] = prev + '\n\n' + curr
			}
		}

		return merged[merged.length - 1]
	}

	/**
	 * Find the length of overlapping text at the boundary of two chunks.
	 * Tries suffixes of `prev` against prefixes of `curr`, using Levenshtein distance
	 * to detect near-matches (Whisper may transcribe the same words slightly differently).
	 * @param {string} prev - Previous chunk text
	 * @param {string} curr - Current chunk text
	 * @param {number} [maxOverlap=50] - Max characters to search for overlap
	 * @returns {number} Number of characters of curr that overlap with prev
	 */
	static _findOverlap(prev, curr, maxOverlap = 50) {
		const searchSpace = Math.min(maxOverlap, prev.length, curr.length)
		if (searchSpace < 10) return 0

		for (let len = searchSpace; len >= 10; len -= 2) {
			const suffix = prev.slice(-len)
			const prefix = curr.slice(0, len)
			const normSuffix = normalize(suffix)
			const normPrefix = normalize(prefix)

			// Requirement: the first and last word of the overlap must match exactly.
			// This prevents false positives where only the middle matches
			// (e.g. "first chunk content" vs "second chunk content").
			const suffixWords = normSuffix.split(/\s+/)
			const prefixWords = normPrefix.split(/\s+/)
			if (suffixWords.length < 2 || prefixWords.length < 2) continue
			if (suffixWords[0] !== prefixWords[0]) continue
			if (suffixWords[suffixWords.length - 1] !== prefixWords[prefixWords.length - 1]) continue

			// Exact match
			if (normSuffix === normPrefix) return len

			// Near match via Levenshtein (allow 20% difference, tighter than 30%)
			const dist = levenshtein(normSuffix, normPrefix)
			const maxDist = Math.max(1, Math.floor(len * 0.2))
			if (dist <= maxDist) return len
		}

		return 0
	}
}
