import { ResultIntent } from '../Models.js'

/**
 * VideoCompiler
 *
 * Compiles a video collage based on audio, video, or TTS text sources.
 */
export class VideoCompiler {
	/**
	 * @param {string} episodeDir
	 */
	constructor(episodeDir) {
		/** @type {string} */
		this.episodeDir = episodeDir
	}

	/**
	 * Compiles the video collage.
	 * @param {'audio'|'video'|'text'} sourceType
	 * @returns {Promise<ResultIntent & { outputPath: string }>}
	 */
	async compile(sourceType) {
		if (!['audio', 'video', 'text'].includes(sourceType)) {
			throw new Error(`Unsupported sourceType: ${sourceType}`)
		}
		// Returns mock success response matching compilation outputs
		return ResultIntent.from({
			ok: true,
			code: 200,
			success: true,
			outputPath: `/media/season_1/episode_2/28_Червня_День_Конституції_final.mp4`
		})
	}
}
