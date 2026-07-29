/**
 * SubtitleChunker
 *
 * Groups Whisper word-level timestamps into display blocks (1-3 words)
 * that fit within a maximum pixel width (~850px) for ASS karaoke subtitles.
 *
 * Uses a per-character width approximation for the target font (Arial 30pt).
 */

// Approximate pixel width per character for Arial 30pt.
// Cyrillic/wide chars ~20px, narrow chars (i, l, I, 1) ~10px, average ~16px.
// We use a conservative 18px to be safe at 850px max.
const PX_PER_CHAR = 18
const MAX_BLOCK_WIDTH = 850
const MAX_WORDS_PER_BLOCK = 3
const MAX_CHARS_PER_BLOCK = Math.floor(MAX_BLOCK_WIDTH / PX_PER_CHAR)

/**
 * Estimates pixel width of a text string for the target font.
 * @param {string} text
 * @returns {number}
 */
export function estimateTextWidth(text) {
	let width = 0
	for (const ch of text) {
		// Narrow characters
		if ('iIl1!.,;:()[]{}'.includes(ch)) {
			width += 10
		} else if ('mwWMB'.includes(ch)) {
			width += 22
		} else if (ch === ' ') {
			width += 8
		} else {
			width += PX_PER_CHAR
		}
	}
	return width
}

/**
 * @typedef {object} WordEntry
 * @property {string} word
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {object} SubtitleBlock
 * @property {string} text - The combined text for this block
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 * @property {number} wordCount - Number of words in this block
 * @property {number} estimatedWidth - Estimated pixel width
 */

/**
 * Groups words into subtitle blocks.
 *
 * Whisper JSON structure expected:
 * { segments: [ { words: [ { word: 'hello', start: 0.1, end: 0.5 }, ... ] } ] }
 *
 * @param {Array<{ segments: Array<{ words: Array<WordEntry> }> }>|Array<WordEntry>} transcriptData
 *        Either the full transcript object with segments, or a flat array of WordEntry.
 * @param {object} [options]
 * @param {number} [options.maxWidth=850] - Maximum pixel width for a block
 * @param {number} [options.maxWords=3] - Maximum words per block
 * @returns {Array<SubtitleBlock>}
 */
export function chunkTranscript(transcriptData, options = {}) {
	const maxWidth = options.maxWidth ?? MAX_BLOCK_WIDTH
	const maxWords = options.maxWords ?? MAX_WORDS_PER_BLOCK

	// Flatten words from segments structure if needed
	let words = []
	if (Array.isArray(transcriptData)) {
		// Could be flat array of WordEntry or array of segments
		if (transcriptData.length > 0 && 'segments' in transcriptData[0]) {
			// Actually it's the full object wrapped in array — unlikely
			words = transcriptData
		} else if (transcriptData.length > 0 && 'word' in transcriptData[0]) {
			words = transcriptData
		} else {
			// Assume it's the full transcript object
			words = transcriptData
		}
	} else if (transcriptData && transcriptData.segments) {
		for (const segment of transcriptData.segments) {
			if (segment.words) {
				words.push(...segment.words)
			}
		}
	}

	if (words.length === 0) {
		return []
	}

	const blocks = []
	let currentBlock = []
	let currentBlockWidth = 0
	let currentBlockStart = words[0]?.start ?? 0

	for (let i = 0; i < words.length; i++) {
		const w = words[i]
		const wordText = (w.word || '').trim()
		if (!wordText) continue

		const wordWidth = estimateTextWidth(wordText)
		const spaceWidth = currentBlock.length > 0 ? estimateTextWidth(' ') : 0
		const wouldBeWidth = currentBlockWidth + spaceWidth + wordWidth

		// Start new block if:
		// 1. Adding this word exceeds max width, OR
		// 2. We already have maxWords words, OR
		// 3. The word itself is wider than maxWidth (unlikely, but handle)
		const startNewBlock =
			currentBlock.length > 0 &&
			(wouldBeWidth > maxWidth || currentBlock.length >= maxWords)

		if (startNewBlock) {
			// Finalize current block
			blocks.push({
				text: currentBlock.join(' '),
				start: currentBlockStart,
				end: words[i - 1].end,
				wordCount: currentBlock.length,
				estimatedWidth: currentBlockWidth,
			})
			// Start new block with this word
			currentBlock = [wordText]
			currentBlockWidth = wordWidth
			currentBlockStart = w.start
		} else {
			if (currentBlock.length === 0) {
				currentBlockStart = w.start
			}
			currentBlock.push(wordText)
			currentBlockWidth = wouldBeWidth
		}
	}

	// Finalize last block
	if (currentBlock.length > 0) {
		blocks.push({
			text: currentBlock.join(' '),
			start: currentBlockStart,
			end: words[words.length - 1].end,
			wordCount: currentBlock.length,
			estimatedWidth: currentBlockWidth,
		})
	}

	return blocks
}

/**
 * Converts an array of SubtitleBlock to ASS format content string.
 *
 * @param {Array<SubtitleBlock>} blocks
 * @param {object} [options]
 * @param {number} [options.playResX=1920]
 * @param {number} [options.playResY=1080]
 * @param {string} [options.style] - Full ASS Style line (overrides default)
 * @returns {string}
 */
export function blocksToAss(blocks, options = {}) {
	const playResX = options.playResX ?? 1920
	const playResY = options.playResY ?? 1080

	const style = options.style ?? `Style: Default,Arial,30,&H00FFFFFF,&H0000FFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,0,2,1,2,"Italic"`

	let ass = `[Script Info]
Title: Auto-generated subtitles (chunked)
ScriptType: v4.00+
PlayResX: ${playResX}
PlayResY: ${playResY}
${style}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`

	for (const block of blocks) {
		const start = formatTimeAss(block.start)
		const end = formatTimeAss(block.end)
		ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${block.text}\n`
	}

	return ass
}

/**
 * Formats seconds to ASS time format (H:MM:SS.cc)
 * @param {number} seconds
 * @returns {string}
 */
function formatTimeAss(seconds) {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = Math.floor(seconds % 60)
	const cs = Math.floor((seconds % 1) * 100)
	return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}