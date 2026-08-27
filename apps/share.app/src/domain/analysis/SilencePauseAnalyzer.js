import { PipelineNode } from '../pipeline/PipelineNode.js'

/**
 * @typedef {object} PauseMarker
 * @property {number} start - Start time of the pause (end of previous word)
 * @property {number} end - End time of the pause (start of next word)
 * @property {number} duration - Duration of the pause in seconds
 * @property {'silence'|'breath'|'topic_boundary'} type - Classification of the pause
 */

/**
 * @typedef {object} SilencePauseAnalyzerOptions
 * @property {number} [minPauseDuration=0.8] - Minimum pause duration to detect (seconds)
 * @property {number} [breathThreshold=1.2] - Pauses shorter than this but >= minPauseDuration are classified as 'breath'
 * @property {number} [topicBoundaryThreshold=1.5] - Pauses >= this are classified as 'topic_boundary'
 */

/**
 * SilencePauseAnalyzer — detects pauses and silence gaps in Whisper JSON transcripts.
 *
 * Analyzes word-level timestamps to find natural cut points.
 * Classification thresholds:
 * - silence: minPauseDuration <= duration < breathThreshold
 * - breath: breathThreshold <= duration < topicBoundaryThreshold
 * - topic_boundary: duration >= topicBoundaryThreshold
 */
export class SilencePauseAnalyzer extends PipelineNode {
	/**
	 * Analyze a Whisper JSON transcript for pauses between words.
	 *
	 * @param {object} whisperJson - Whisper JSON with segments[].words[] containing {word, start, end}
	 * @param {SilencePauseAnalyzerOptions} [options]
	 * @returns {PauseMarker[]}
	 */
	analyze(whisperJson, options = {}) {
		const {
			minPauseDuration = 0.8,
			breathThreshold = 1.2,
			topicBoundaryThreshold = 1.5,
		} = options

		const words = this._extractWords(whisperJson)
		if (words.length < 2) return []

		/** @type {PauseMarker[]} */
		const pauses = []

		for (let i = 0; i < words.length - 1; i++) {
			const currentEnd = words[i].end
			const nextStart = words[i + 1].start
			const duration = nextStart - currentEnd

			if (duration >= minPauseDuration) {
				pauses.push({
					start: currentEnd,
					end: nextStart,
					duration,
					type: this._classifyPause(duration, breathThreshold, topicBoundaryThreshold),
				})
			}
		}

		return pauses
	}

	/**
	 * PipelineNode interface: process Whisper JSON and return pauses.
	 * @param {object} input - { transcript: WhisperJSON, options?: SilencePauseAnalyzerOptions }
	 * @returns {Promise<{ pauses: PauseMarker[], transcript: object }>}
	 */
	async process(input) {
		const pauses = this.analyze(input.transcript, input.options)
		return { ...input, pauses }
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
				if (seg.words) {
					words.push(...seg.words)
				}
			}
		} else if (Array.isArray(whisperJson)) {
			words.push(...whisperJson)
		}
		return words.filter(w => typeof w.start === 'number' && typeof w.end === 'number')
	}

	/**
	 * Classify a pause based on its duration.
	 * @param {number} duration
	 * @param {number} breathThreshold
	 * @param {number} topicBoundaryThreshold
	 * @returns {'silence'|'breath'|'topic_boundary'}
	 */
	_classifyPause(duration, breathThreshold, topicBoundaryThreshold) {
		if (duration >= topicBoundaryThreshold) return 'topic_boundary'
		if (duration >= breathThreshold) return 'breath'
		return 'silence'
	}
}
