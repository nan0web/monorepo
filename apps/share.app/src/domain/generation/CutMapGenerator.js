import { PipelineNode } from '../pipeline/PipelineNode.js'

/**
 * @typedef {object} CutMapSegment
 * @property {string} label - Segment identifier (e.g. 'intro', 'chapter_1', 'short_1')
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 * @property {'episode'|'short'|'intro'|'outro'} type - Segment type
 * @property {string} [aspectRatio] - Per-segment aspect ratio override (e.g. '9:16', '16:9')
 * @property {string} [title] - Segment title
 * @property {string} [description] - Segment description
 * @property {string[]} [tags] - Segment tags
 */

/**
 * @typedef {object} CutMap
 * @property {number} version - Schema version (always 1)
 * @property {string} source - Source video file path
 * @property {string} aspectRatio - Default aspect ratio for all segments
 * @property {CutMapSegment[]} segments - Array of cut segments
 */

/**
 * CutMapGenerator — generates a YAML-compatible cut-map from detected pauses and word data.
 *
 * The cut-map is a configuration file that the author reviews and edits
 * before executing the actual video slicing. Each segment defines start/end
 * times, type (episode/short), and optional aspect ratio override.
 */
export class CutMapGenerator extends PipelineNode {
	/**
	 * Generate a cut-map object from pauses and word-level timestamps.
	 *
	 * @param {object} input
	 * @param {import('../analysis/SilencePauseAnalyzer.js').PauseMarker[]} input.pauses - Detected pauses
	 * @param {Array<{word: string, start: number, end: number}>} input.words - Word-level timestamps
	 * @param {string} [input.source='video.mp4'] - Source video path
	 * @param {string} [input.defaultAspectRatio='16:9'] - Default aspect ratio
	 * @returns {CutMap}
	 */
	generate(input) {
		const {
			pauses = [],
			words = [],
			source = 'video.mp4',
			defaultAspectRatio = '16:9',
		} = input

		const totalDuration = words.length > 0
			? words[words.length - 1].end
			: 0

		// Split content at topic_boundary pauses first, then silence pauses
		const cutPoints = [0]
		for (const pause of pauses) {
			if (pause.type === 'topic_boundary' || pause.type === 'silence') {
				cutPoints.push(pause.start)
				cutPoints.push(pause.end)
			}
		}
		if (totalDuration > 0) {
			cutPoints.push(totalDuration)
		}

		// Remove duplicates and sort
		const uniquePoints = [...new Set(cutPoints)].sort((a, b) => a - b)

		// Build segments from consecutive pairs of cut points
		/** @type {CutMapSegment[]} */
		const segments = []
		let chapterIndex = 1

		for (let i = 0; i < uniquePoints.length - 1; i += 2) {
			const start = uniquePoints[i]
			const end = uniquePoints[i + 1]
			if (end - start < 0.1) continue // Skip negligible gaps

			const label = `chapter_${chapterIndex}`
			const segmentWords = words.filter(w => w.start >= start && w.end <= end)
			const text = segmentWords.map(w => w.word).join(' ')

			segments.push({
				label,
				start: Math.round(start * 100) / 100,
				end: Math.round(end * 100) / 100,
				type: 'episode',
				title: text.slice(0, 60) || label,
			})
			chapterIndex++
		}

		return {
			version: 1,
			source,
			aspectRatio: defaultAspectRatio,
			segments,
		}
	}

	/**
	 * PipelineNode interface: generate cut-map from pipeline input.
	 * @param {object} input - { pauses, transcript, source, ... }
	 * @returns {Promise<object>}
	 */
	async process(input) {
		const words = this._extractWords(input.transcript)
		const cutMap = this.generate({
			pauses: input.pauses,
			words,
			source: input.source,
			defaultAspectRatio: input.defaultAspectRatio,
		})
		return { ...input, cutMap }
	}

	/**
	 * Serialize a CutMap object to YAML string.
	 * Lightweight serializer — no external deps.
	 *
	 * @param {CutMap} cutMap
	 * @returns {string}
	 */
	static toYaml(cutMap) {
		let yaml = ''
		yaml += `version: ${cutMap.version}\n`
		yaml += `source: "${cutMap.source}"\n`
		yaml += `aspectRatio: "${cutMap.aspectRatio}"\n`
		yaml += `segments:\n`

		for (const seg of cutMap.segments) {
			yaml += `  - label: "${seg.label}"\n`
			yaml += `    start: ${seg.start}\n`
			yaml += `    end: ${seg.end}\n`
			yaml += `    type: "${seg.type}"\n`
			if (seg.aspectRatio) {
				yaml += `    aspectRatio: "${seg.aspectRatio}"\n`
			}
			if (seg.title) {
				yaml += `    title: "${seg.title.replace(/"/g, '\\"')}"\n`
			}
			if (seg.description) {
				yaml += `    description: "${seg.description.replace(/"/g, '\\"')}"\n`
			}
			if (seg.tags && seg.tags.length > 0) {
				yaml += `    tags:\n`
				for (const tag of seg.tags) {
					yaml += `      - "${tag}"\n`
				}
			}
		}

		return yaml
	}

	/**
	 * Extract flat word array from Whisper JSON.
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
		return words
	}
}
