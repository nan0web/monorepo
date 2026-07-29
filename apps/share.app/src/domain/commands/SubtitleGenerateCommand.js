import { ModelAsApp } from '@nan0web/ui-cli'
import { ResultIntent } from '../Models.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chunkTranscript, blocksToAss } from '../generation/SubtitleChunker.js'

/**
 * @typedef {object} SubtitleGenerateCommandOptions
 * @property {string} transcriptPath - Path to the JSON transcript file from Whisper.
 * @property {number} videoDuration - Duration of the video in seconds.
 * @property {string} [outputPath] - Path to save the generated .ass subtitle file.
 * @property {number} [maxBlockWidth=850] - Maximum pixel width for a subtitle block.
 * @property {number} [maxWordsPerBlock=3] - Maximum words per subtitle block.
 */

export class SubtitleGenerateCommand extends ModelAsApp {
	static alias = 'generate:subtitles'

	static transcriptPath = {
		type: 'string',
		required: true,
		help: 'Path to the JSON transcript file from Whisper.',
	}

	static videoDuration = {
		type: 'number',
		required: true,
		help: 'Duration of the video in seconds.',
	}

	static outputPath = {
		type: 'string',
		required: false,
		help: 'Path to save the generated .ass subtitle file.',
	}

	static maxBlockWidth = {
		type: 'number',
		required: false,
		default: 850,
		help: 'Maximum pixel width for a subtitle block (default 850px for 1080p).',
	}

	static maxWordsPerBlock = {
		type: 'number',
		required: false,
		default: 3,
		help: 'Maximum words per subtitle block (default 3).',
	}

	/**
	 * @param {SubtitleGenerateCommandOptions} data
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		// Validate input path
		try {
			await fs.access(this.transcriptPath)
		} catch (err) {
			yield {
				type: 'log',
				level: 'error',
				message: `Error accessing transcript file: ${this.transcriptPath}. ${err.message}`,
			}
			return { type: 'result', data: { success: false, message: `Transcript file not found: ${this.transcriptPath}` } }
		}

		yield {
			type: 'progress',
			message: `Generating subtitles from ${this.transcriptPath} using SubtitleChunker...`,
		}

		let transcriptData
		try {
			const fileContent = await fs.readFile(this.transcriptPath, 'utf-8')
			transcriptData = JSON.parse(fileContent)
		} catch (err) {
			yield {
				type: 'log',
				level: 'error',
				message: `Error parsing transcript file: ${this.transcriptPath}. ${err.message}`,
			}
			return { type: 'result', data: { success: false, message: `Failed to parse transcript file.` } }
		}

		// Use SubtitleChunker to intelligently group words by pixel width
		const blocks = chunkTranscript(transcriptData, {
			maxWidth: this.maxBlockWidth,
			maxWords: this.maxWordsPerBlock,
		})

		if (blocks.length === 0) {
			yield {
				type: 'log',
				level: 'warn',
				message: 'No subtitle blocks were generated (empty transcript).',
			}
			return { type: 'result', data: { success: true, outputPath: null, subtitleCount: 0 } }
		}

		// Convert blocks to ASS format
		const assContent = blocksToAss(blocks)

		const finalOutputPath = this.outputPath || path.basename(this.transcriptPath, '.json') + '.ass'

		try {
			await fs.writeFile(finalOutputPath, assContent, 'utf-8')
			yield {
				type: 'log',
				level: 'success',
				message: `Subtitles generated successfully: ${finalOutputPath} (${blocks.length} blocks)`,
			}
			return {
				type: 'result',
				data: {
					success: true,
					outputPath: finalOutputPath,
					subtitleCount: blocks.length,
				},
			}
		} catch (err) {
			yield {
				type: 'log',
				level: 'error',
				message: `Error writing subtitle file: ${finalOutputPath}. ${err.message}`,
			}
			return { type: 'result', data: { success: false, message: `Failed to write subtitle file.` } }
		}
	}
}
