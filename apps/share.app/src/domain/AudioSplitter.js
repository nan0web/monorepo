import { ModelAsApp } from '@nan0web/ui'

/**
 * Compute Levenshtein distance between two strings.
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
 * Normalize text for comparison.
 */
function normalize(text) {
	return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * AudioSplitter domain model (Model-as-App).
 * Platform-agnostic domain application controller for audio splitting and transcript merging.
 */
export class AudioSplitter extends ModelAsApp {
	static alias = 'audio:split'

	/**
	 * Resolves port and splits audio file.
	 * @param {string} inputPath
	 * @param {Object} [options]
	 * @returns {Promise<string[]>}
	 */
	static async split(inputPath, options = {}) {
		let port = options.splitter || options._?.splitter
		if (!port) {
			const { AudioSplitterPort } = await import('../ports/AudioSplitterPort.js')
			port = AudioSplitterPort
		}
		return port.split(inputPath, options)
	}

	/**
	 * Resolves port and probes audio duration.
	 * @param {string} inputPath
	 * @param {Object} [options]
	 * @returns {Promise<number|null>}
	 */
	static async probeDuration(inputPath, options = {}) {
		let port = options.splitter || options._?.splitter
		if (!port) {
			const { AudioSplitterPort } = await import('../ports/AudioSplitterPort.js')
			port = AudioSplitterPort
		}
		return port.probeDuration(inputPath, options)
	}

	/**
	 * Merge overlapping chunk transcripts with deduplication.
	 * Pure domain algorithm.
	 * @param {string[]} transcripts
	 * @returns {string}
	 */
	static mergeTranscripts(transcripts, format = 'txt', options = {}) {
		const { segmentDuration = 300, overlap = 2 } = options

		if (transcripts.length === 0) return format === 'json' ? JSON.stringify({ text: '', segments: [] }) : ''
		if (transcripts.length === 1) return transcripts[0]

		if (format === 'json') {
			let mergedText = ''
			const mergedSegments = []

			for (let i = 0; i < transcripts.length; i++) {
				const chunkJson = JSON.parse(transcripts[i])
				const nominalStart = i * segmentDuration
				const offset = Math.max(0, nominalStart - (i > 0 ? overlap : 0))
				const nextNominalStart = nominalStart + segmentDuration
				const isLastChunk = i === transcripts.length - 1

				for (const seg of chunkJson.segments || []) {
					// Add offset
					seg.start += offset
					seg.end += offset
					if (seg.words) {
						for (const w of seg.words) {
							w.start += offset
							w.end += offset
						}
					}

					// Deduplicate overlap using precise timestamps
					if (i > 0 && seg.start < nominalStart) {
						continue // Skip overlap, previous chunk handled it
					}
					if (!isLastChunk && seg.start >= nextNominalStart) {
						continue // Let the next chunk handle it
					}

					seg.id = mergedSegments.length
					mergedSegments.push(seg)
					mergedText += (seg.text || '') + ' '
				}
			}

			return JSON.stringify({
				text: mergedText.trim(),
				segments: mergedSegments,
				language: JSON.parse(transcripts[0]).language || 'auto'
			}, null, 2)
		}

		const merged = [transcripts[0]]

		for (let i = 1; i < transcripts.length; i++) {
			const prev = merged[merged.length - 1]
			const curr = transcripts[i]

			const overlapLen = this._findOverlap(prev, curr)
			if (overlapLen > 0) {
				merged[merged.length - 1] = prev + curr.slice(overlapLen)
			} else {
				merged[merged.length - 1] = prev + '\n\n' + curr
			}
		}

		return merged[merged.length - 1]
	}

	/**
	 * Find the length of overlapping text at the boundary of two chunks.
	 * Pure domain algorithm.
	 * @param {string} prev
	 * @param {string} curr
	 * @param {number} [maxOverlap=50]
	 * @returns {number}
	 */
	static _findOverlap(prev, curr, maxOverlap = 50) {
		const searchSpace = Math.min(maxOverlap, prev.length, curr.length)
		if (searchSpace < 10) return 0

		for (let len = searchSpace; len >= 10; len -= 2) {
			const suffix = prev.slice(-len)
			const prefix = curr.slice(0, len)
			const normSuffix = normalize(suffix)
			const normPrefix = normalize(prefix)

			const suffixWords = normSuffix.split(/\s+/)
			const prefixWords = normPrefix.split(/\s+/)
			if (suffixWords.length < 2 || prefixWords.length < 2) continue
			if (suffixWords[0] !== prefixWords[0]) continue
			if (suffixWords[suffixWords.length - 1] !== prefixWords[prefixWords.length - 1]) continue

			if (normSuffix === normPrefix) return len

			const dist = levenshtein(normSuffix, normPrefix)
			const maxDist = Math.max(1, Math.floor(len * 0.2))
			if (dist <= maxDist) return len
		}

		return 0
	}
}
