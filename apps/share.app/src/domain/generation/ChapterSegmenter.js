import { PipelineNode } from '../pipeline/PipelineNode.js'

/**
 * @typedef {object} Chapter
 * @property {string} title - Chapter title (auto-generated from first words or segment text)
 * @property {number} startTime - Start time in seconds
 * @property {number} endTime - End time in seconds
 * @property {string} text - Full text content of the chapter
 * @property {string} [description] - Optional description
 * @property {string[]} [tags] - Optional tags
 */

/**
 * ChapterSegmenter — groups Whisper transcript segments into logical chapters
 * using detected pause points as natural boundaries.
 *
 * Snaps chapter boundaries to the nearest topic_boundary pauses, ensuring
 * clean cuts between speech sections without splitting mid-sentence.
 */
export class ChapterSegmenter extends PipelineNode {
	/**
	 * Segment a transcript into chapters based on detected pauses.
	 *
	 * @param {object} input
	 * @param {object} input.transcript - Whisper JSON with segments[].words[]
	 * @param {import('../analysis/SilencePauseAnalyzer.js').PauseMarker[]} input.pauses - Detected pauses
	 * @param {object} [input.options]
	 * @returns {Chapter[]}
	 */
	segment(input) {
		const { transcript, pauses = [] } = input
		if (!transcript || !transcript.segments || transcript.segments.length === 0) {
			return []
		}

		// Get topic_boundary pauses as primary split points
		const boundaries = pauses
			.filter(p => p.type === 'topic_boundary')
			.sort((a, b) => a.start - b.start)

		// If no topic boundaries found, return entire transcript as single chapter
		if (boundaries.length === 0) {
			const allWords = this._extractWords(transcript)
			const text = allWords.map(w => w.word).join(' ')
			return [{
				title: this._generateTitle(text),
				startTime: allWords.length > 0 ? allWords[0].start : 0,
				endTime: allWords.length > 0 ? allWords[allWords.length - 1].end : 0,
				text,
			}]
		}

		const allWords = this._extractWords(transcript)
		if (allWords.length === 0) return []

		/** @type {Chapter[]} */
		const chapters = []

		// Build chapters between boundary points
		const splitPoints = [
			allWords[0].start,
			...boundaries.flatMap(b => [b.start, b.end]),
			allWords[allWords.length - 1].end,
		]

		// Group into pairs: [contentStart, contentEnd, pauseStart, pauseEnd, contentStart, ...]
		// Content regions are between pause boundaries
		let chapterIndex = 0

		for (let i = 0; i < splitPoints.length - 1; i += 2) {
			const start = splitPoints[i]
			const end = splitPoints[i + 1]

			if (end - start < 0.1) continue

			const chapterWords = allWords.filter(w => w.start >= start - 0.05 && w.end <= end + 0.05)
			if (chapterWords.length === 0) continue

			const text = chapterWords.map(w => w.word).join(' ')

			chapters.push({
				title: this._generateTitle(text),
				startTime: chapterWords[0].start,
				endTime: chapterWords[chapterWords.length - 1].end,
				text,
			})
			chapterIndex++
		}

		return chapters
	}

	/**
	 * PipelineNode interface: segment transcript from pipeline input.
	 * @param {object} input
	 * @returns {Promise<object>}
	 */
	async process(input) {
		const chapters = this.segment(input)
		return { ...input, chapters }
	}

	/**
	 * Extract flat word array from Whisper JSON structure.
	 * @param {object} whisperJson
	 * @returns {Array<{word: string, start: number, end: number}>}
	 */
	_extractWords(whisperJson) {
		const words = []
		if (whisperJson && whisperJson.segments) {
			for (const seg of whisperJson.segments) {
				if (seg.words) words.push(...seg.words)
			}
		}
		return words.filter(w => typeof w.start === 'number' && typeof w.end === 'number')
	}

	/**
	 * Generate a chapter title from the first ~8 words of text.
	 * @param {string} text
	 * @returns {string}
	 */
	_generateTitle(text) {
		const words = text.split(/\s+/).slice(0, 8)
		const title = words.join(' ')
		return title.length > 60 ? title.slice(0, 57) + '...' : title
	}
}
