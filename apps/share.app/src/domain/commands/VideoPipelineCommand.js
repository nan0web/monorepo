import { ModelAsApp } from '@nan0web/ui-cli'
import { PipelineNode } from '../pipeline/PipelineNode.js'
import { SilencePauseAnalyzer } from '../analysis/SilencePauseAnalyzer.js'
import { CutMapGenerator } from '../generation/CutMapGenerator.js'
import { ChapterSegmenter } from '../generation/ChapterSegmenter.js'
import { VideoSlicerPort } from '../../ports/VideoSlicerPort.js'
import { YouTubePublisherPort } from '../../ports/YouTubePublisherPort.js'
import { YouTubeDownloaderPort } from '../../ports/YouTubeDownloaderPort.js'
import { MediaDownloadModel } from '../MediaDownloadModel.js'
import { ShortsGenerateCommand } from './ShortsGenerateCommand.js'
import { chunkTranscript, blocksToSrt, blocksToVtt } from '../generation/SubtitleChunker.js'
import { ArticlePipelineService } from '../generation/ArticlePipelineService.js'
import { PipelineAuditService } from '../analysis/PipelineAuditService.js'
import { WhisperTranscriptionService } from '../analysis/WhisperTranscriptionService.js'
import { DirectorCutAnalyzer } from '../analysis/DirectorCutAnalyzer.js'
import { MediaInspectorService } from '../analysis/MediaInspectorService.js'
import { progress, show, result, log } from '@nan0web/ui'

/**
 * @typedef {object} VideoPipelineOptions
 * @property {string} [url] - Source video URL (YouTube, TikTok, etc.) or local file.
 * @property {string} [cutMap] - Optional path to pre-existing cut-map.yaml.
 * @property {string} [outputDir='tmp/pipeline'] - Directory for intermediate and output assets.
 * @property {string} [publish] - Comma-separated platforms to publish to (e.g., 'youtube,telegram').
 * @property {boolean} [dryRun=false] - If true, execute without calling external mutating APIs.
 */

/**
 * Master pipeline orchestrator for video ingestion, transcript analysis, pause-based cut-map generation, slicing, and multi-platform publishing.
 */
export class VideoPipelineCommand extends ModelAsApp {
	static alias = 'pipeline:video'

	static UI = {
		title: 'Universal Video Processing & Multi-Platform Distribution Pipeline',
		initializing: 'Initializing pipeline for {map}',
		missingInput: 'Please provide either --url or --cutMap',
		stepTranscription: '🎙️ Step 1/4: Audio extraction & Whisper transcription ({name})...',
		cachedTranscriptFound: 'Found saved transcript: {path} (using cache)',
		audioDownloadProgress: '📥 Extracting/downloading audio track... {percent}%',
		audioSegmentProgress: '✂️ Splitting audio into chunks... {percent}%',
		whisperChunkProgress: '🧠 Transcribing Whisper chunk {chunk}/{total} (MLX/Metal)...',
		whisperChunkDetail: '🧠 Whisper chunk {chunk}/{total}: [{percent}%]',
		whisperChunkDone: '✅ Chunk {chunk}/{total} processed',
		transcriptionSaved: '✅ Transcription completed and saved to {path}',
		stepSegmentation: '🔍 Step 2/4: Pause analysis & logical chapter segmentation...',
		pausesFound: 'Found {count} pauses: {breakdown}',
		directorScenesFound: '🎬 Director Cut: Found {count} scenes via voice markers (Camera <Scene>): {scenes}',
		episodesGenerated: '📋 Generated {count} logical episodes -> {path}',
		stepSlicing: '🎬 Step 3/4: Slicing {count} video episodes (16:9) and generating subtitles...',
		slicingComplete: '🎬 Successfully sliced {count} logical episodes in {outputDir}',
		subtitlesGenerated: '📝 Generated .srt and .vtt subtitles for each episode in {outputDir}',
		overviewCreated: '📄 Created overview & YouTube timestamps -> {path}',
		groundTruthLoaded: '🧩 Attached Ground Truth from {count} local sources: {sources}',
		articleGenStart: '✍️ [{current}/{total}] Generating article: {title}...',
		articleSaved: '✅ [{current}/{total}] Saved: {file}',
		articlesAllDone: '📚 Generated {count} publications ({template}) in {dir}/',
		masterLongreadDone: '📖 Generated structured long-read ({template}) -> {path}',
		socialPackagesDone: '📱 Generated distribution packages for channel and {count} individual episodes -> {dir}/',
		llmMetrics: '📊 LLM Usage: {tokens} tokens (Prompt: {prompt}, Completion: {completion}) | Cost: {cost} [{model}]',
		shortsProgress: '📱 Generating vertical 9:16 Shorts...',
		stitchProgress: '🎞️ Stitching {count} scenes with "{transition}" transition ({duration}s)...',
		stitchComplete: '✅ Successfully stitched scenes into {path} ({duration}s)',
		previewFrameDone: '📸 Saved 9:16 preview frame snapshot -> {path}',
		stepPublishing: '📡 Step 4/4: Publishing to {platform}...',
		auditEmptyWarning: '⚠️ Integrity inspector found {count} empty files!',
		auditSuccess: '🔍 Quality inspector: All artifacts valid ({videos} videos, {subtitles} subtitles, {articles} articles, {social} social kits)',
		pipelineComplete: '🎉 Complete video processing pipeline finished successfully!',
	}

	static url = {
		type: 'string',
		required: false,
		help: 'Source video URL or local file path',
	}

	static cutMap = {
		type: 'string',
		required: false,
		help: 'Path to existing cut-map.yaml definition',
	}

	static outputDir = {
		type: 'string',
		required: false,
		default: 'tmp/pipeline',
		help: 'Directory to store generated segments and logs',
	}

	static publish = {
		type: 'string',
		required: false,
		help: 'Platforms to publish slices to (e.g. youtube,telegram)',
	}

	static language = {
		type: 'string',
		required: false,
		default: 'auto',
		help: 'Language code: en|uk|auto (default: auto — Whisper automatically detects audio language)',
	}

	static minChapterDuration = {
		type: 'number',
		required: false,
		default: 180,
		help: 'Minimum duration for logical chapters/episodes in seconds (default: 180s = 3 min)',
	}

	static directorCut = {
		type: 'boolean',
		required: false,
		default: false,
		help: 'Enable Director Cut voice trigger detection (Camera <Scene> | Start, Camera Stop)',
	}

	static cutSilence = {
		type: 'boolean',
		required: false,
		default: false,
		help: 'Whether to cut silence gaps and trim scenes to speech boundaries (default: false)',
	}

	static minSilenceDuration = {
		type: 'number',
		required: false,
		default: 2.0,
		help: 'Minimum silence duration in seconds before considering a gap for trimming (default: 2.0s)',
	}

	static paddingBefore = {
		type: 'number',
		required: false,
		default: 0.5,
		help: 'Seconds of padding before speech in Director Cut (default: 0.5)',
	}

	static paddingAfter = {
		type: 'number',
		required: false,
		default: 1.0,
		help: 'Seconds of padding after speech in Director Cut (default: 1.0)',
	}

	static scenes = {
		type: 'string',
		required: false,
		default: '',
		help: 'Custom scene coordinates / alignment config (e.g. "code=left+100,chat=right-50" or JSON/YAML file path)',
	}

	static stitch = {
		type: 'boolean',
		required: false,
		default: false,
		help: 'Stitch director scenes into a single final video with xfade/acrossfade transitions (default: false)',
	}

	static transition = {
		type: 'string',
		required: false,
		default: 'fade',
		help: 'Transition effect for stitching scenes: fade | wipeleft | slideleft | dissolve (default: fade)',
	}

	static transitionDuration = {
		type: 'number',
		required: false,
		default: 0.5,
		help: 'Transition duration in seconds for scene stitching (default: 0.5)',
	}

	static acrossfade = {
		type: 'boolean',
		required: false,
		default: true,
		help: 'Apply audio acrossfade between stitched scenes for smooth audio transition (default: true)',
	}

	static audioTransitionDuration = {
		type: 'number',
		required: false,
		default: 0.5,
		help: 'Audio transition duration in seconds for acrossfade (default: 0.5)',
	}

	static previewFrame = {
		type: 'number',
		required: false,
		help: 'Instant snapshot of 1 frame with 9:16 crop applied at given timestamp (seconds) for calibration without full render',
	}

	static shorts = {
		type: 'boolean',
		required: false,
		default: false,
		help: 'Whether to generate vertical 9:16 Shorts (default: false)',
	}

	static shortsDuration = {
		type: 'number',
		required: false,
		default: 45,
		help: 'Target duration per Short in seconds (default: 45)',
	}

	static subtitles = {
		type: 'boolean',
		required: false,
		default: true,
		help: 'Generate .srt and .vtt subtitle files for each episode with offset timestamps (default: true)',
	}

	static article = {
		type: 'boolean',
		required: false,
		default: true,
		help: 'Generate structured markdown article from video transcript (default: true)',
	}

	static template = {
		type: 'string',
		required: false,
		default: 'tech',
		help: 'Article template: tech | smm | tldr (default: tech)',
	}

	static model = {
		type: 'string',
		required: false,
		default: 'openai/gpt-oss-120b',
		help: 'LLM model ID on OpenRouter (e.g. openai/gpt-oss-120b, meta-llama/llama-3.3-70b-instruct, meta-llama/llama-4-scout)',
	}

	static sources = {
		type: 'string',
		required: false,
		default: '/Users/i/src/apps/payload-cms,/Users/i/src/apps/vibe-cli-patches',
		help: 'Comma-separated directory paths to local repositories for Ground Truth context and code references',
	}

	static overview = {
		type: 'boolean',
		required: false,
		default: true,
		help: 'Generate executive summary overview and YouTube chapters timestamps (default: true)',
	}

	static dryRun = {
		type: 'boolean',
		required: false,
		default: false,
		help: 'Dry run mode without external mutations',
	}

	/**
	 * @param {VideoPipelineOptions} [data]
	 * @param {object} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const { t } = this._

		const rawUrl = this.url
		const outputDir = this.outputDir || 'tmp/pipeline'
		const dryRun = Boolean(this.dryRun)

		yield progress(t(VideoPipelineCommand.UI.initializing, { map: rawUrl || this.cutMap }), 0, {
			id: 'pipeline',
			total: 100,
		})

		if (!rawUrl && !this.cutMap) {
			yield show(t(VideoPipelineCommand.UI.missingInput), 'error')
			return result({ success: false, message: 'Missing --url or --cutMap parameter.' })
		}

		// Normalize path if starts with ~
		const url =
			rawUrl && rawUrl.startsWith('~/')
				? this.$db.resolveSync(process.env.HOME || '', rawUrl.slice(2))
				: rawUrl

		try {
			await this.$db.mkdir(outputDir)
		} catch {}

		if (dryRun) {
			yield show('[DryRun] Step 1: Media Ingestion & Preparation', 'info')
			yield show('[DryRun] Step 2: Silence & Topic Boundary Detection', 'info')
			yield show('[DryRun] Step 3: FFmpeg Slicing & Shorts Generation', 'info')
			if (this.publish) {
				yield show(`[DryRun] Step 4: Publishing to ${this.publish}`, 'info')
			}
			return result({ success: true, outputDir, url, published: Boolean(this.publish) })
		}

		// --- Step 1: Transcription (Whisper JSON) ---
		const { whisperJson, transcriptPath } = yield* WhisperTranscriptionService.transcribe({
			url,
			outputDir,
			language: this.language || 'auto',
			t,
			context: this._,
		})

		// --- Step 2: Pause Analysis & Chapter Segmentation ---
		yield progress(t(VideoPipelineCommand.UI.stepSegmentation), 50, {
			id: 'pipeline',
			total: 100,
		})
		const pauseAnalyzer = new SilencePauseAnalyzer()
		const pauses = whisperJson
			? pauseAnalyzer.analyze(whisperJson, { minPauseDuration: 1.0, topicBoundaryThreshold: 2.0 })
			: []
		const pauseBreakdown = pauses.reduce((acc, p) => {
			acc[p.type] = (acc[p.type] || 0) + 1
			return acc
		}, {})

		yield show(
			t(VideoPipelineCommand.UI.pausesFound, {
				count: pauses.length,
				breakdown: JSON.stringify(pauseBreakdown),
			}),
			'info'
		)

		// 1. Director Cut Check: Camera <Scene> / Camera Stop
		let directorScenes = []
		if (this.directorCut && whisperJson) {
			let parsedScenes = {}
			if (this.scenes) {
				if (typeof this.scenes === 'object') {
					parsedScenes = this.scenes
				} else if (typeof this.scenes === 'string') {
					const trimmed = this.scenes.trim()
					if (trimmed.startsWith('{')) {
						try { parsedScenes = JSON.parse(trimmed) } catch {}
					} else {
						try {
							const exists = await this.$db.stat(trimmed)
							if (exists) {
								const fileContent = await this.$db.loadDocument(trimmed)
								parsedScenes = trimmed.endsWith('.json') ? JSON.parse(fileContent) : (typeof fileContent === 'object' ? fileContent : JSON.parse(fileContent))
							} else {
								parsedScenes = VideoSlicerPort.parseSceneSpecs(trimmed)
							}
						} catch {
							// format: "code=left+100,chat=right-50" or "code:960x1080+0+0"
							parsedScenes = VideoSlicerPort.parseSceneSpecs(trimmed)
						}
					}
				}
			}

			let totalDuration
			if (url) {
				try {
					const isLocal = await this.$db.stat(url)
					if (isLocal) {
						const inspector = new MediaInspectorService()
						const rawProbe = inspector.probe(url)
						if (rawProbe?.format?.duration) {
							totalDuration = Number(rawProbe.format.duration)
						}
					}
				} catch {}
			}

			const director = new DirectorCutAnalyzer({
				scenes: parsedScenes,
				cutSilence: Boolean(this.cutSilence),
				minSilenceDuration: Number(this.minSilenceDuration) || 2.0,
				paddingBefore: Number(this.paddingBefore) || 0.5,
				paddingAfter: Number(this.paddingAfter) || 1.0,
				totalDuration,
			})
			directorScenes = director.parseScenes(whisperJson)
		}

		let segments = []
		if (directorScenes.length > 0) {
			yield show(
				t(VideoPipelineCommand.UI.directorScenesFound, {
					count: directorScenes.length,
					scenes: directorScenes.map(s => s.sceneName).join(', ')
				}),
				'success'
			)
			segments = directorScenes.map((s, idx) => {
				const seg = {
					label: `scene_${s.sceneName.toLowerCase()}_${idx + 1}`,
					start: s.start,
					end: s.end,
					type: 'scene',
					title: `${s.sceneName} Scene`,
					text: s.text,
					align: s.align || 'center',
				}
				if (s.offsetX !== undefined) seg.offsetX = s.offsetX
				if (s.box) seg.crop = s.box
				return seg
			})
		} else {
			// Segment into logical chapters/episodes (e.g. 5-10 min each, or minChapterDuration)
			const segmenter = new ChapterSegmenter()
			const minDur = Number(this.minChapterDuration) || 180
			const rawChapters = segmenter.segment({ transcript: whisperJson, pauses })

			// Consolidate into chapters of sensible minimum length
			const chapters = []
			let currentCh = null

			for (const ch of rawChapters) {
				if (!currentCh) {
					currentCh = { ...ch }
				} else if (currentCh.endTime - currentCh.startTime < minDur) {
					currentCh.endTime = ch.endTime
					currentCh.text += ' ' + ch.text
				} else {
					chapters.push(currentCh)
					currentCh = { ...ch }
				}
			}
			if (currentCh) chapters.push(currentCh)

			segments = (chapters.length > 0 ? chapters : rawChapters).map((ch, idx) => ({
				label: `episode_${idx + 1}`,
				start: Math.round(ch.startTime * 100) / 100,
				end: Math.round(ch.endTime * 100) / 100,
				type: 'episode',
				title: ch.title || `Episode ${idx + 1}`,
			}))
		}

		const cutMap = {
			version: 1,
			source: url,
			aspectRatio: '16:9',
			segments,
		}

		const cutMapDocPath = this.$db.resolveSync(outputDir, 'cut-map')
		await this.$db.saveDocument(cutMapDocPath, cutMap)
		yield show(
			t(VideoPipelineCommand.UI.episodesGenerated, {
				count: segments.length,
				path: cutMapDocPath,
			}),
			'success'
		)

		// --- Instant Preview Frame Mode ---
		if (this.previewFrame !== undefined && this.previewFrame !== null) {
			const previewTime = Number(this.previewFrame) || 0
			const previewImgPath = this.$db.resolveSync(outputDir, `preview_${previewTime}s.jpg`)
			const activeScene = segments.find(s => previewTime >= s.start && previewTime <= s.end) || segments[0] || {}
			const slicer = new VideoSlicerPort()
			await slicer.captureFramePreview({
				source: url,
				time: previewTime,
				outputPath: previewImgPath,
				align: activeScene.align || 'center',
				offsetX: activeScene.offsetX,
				crop: activeScene.crop,
			})
			yield show(t(VideoPipelineCommand.UI.previewFrameDone, { path: previewImgPath }), 'success')
			return result({
				success: true,
				previewPath: previewImgPath,
				time: previewTime,
				scene: activeScene.label || 'scene',
			})
		}

		// --- Step 3: FFmpeg Slicing, Per-Episode Subtitles & Optional Shorts ---
		yield progress(
			t(VideoPipelineCommand.UI.stepSlicing, { count: segments.length }),
			75,
			{ id: 'pipeline', total: 100 }
		)
		const slicer = new VideoSlicerPort()
		let slicedResults = []
		try {
			slicedResults = await slicer.slice(cutMap, { outputDir })
			yield show(
				t(VideoPipelineCommand.UI.slicingComplete, {
					count: slicedResults.length,
					outputDir,
				}),
				'success'
			)
		} catch (err) {
			yield show(`Direct slicing: ${err.message}`, 'warn')
		}

		// Optional Stitch: concat director scenes into a single final video with xfade/acrossfade
		let stitchedResult = null
		if (this.stitch && slicedResults.length > 0) {
			const transition = this.transition || 'fade'
			const transitionDuration = Number(this.transitionDuration) || 0.5
			const acrossfade = this.acrossfade !== false
			const audioTransitionDuration = Number(this.audioTransitionDuration) || transitionDuration
			const stitchOutputPath = this.$db.resolveSync(outputDir, 'stitched.mp4')

			yield progress(
				t(VideoPipelineCommand.UI.stitchProgress, {
					count: slicedResults.length,
					transition,
					duration: transitionDuration,
				}),
				78,
				{ id: 'pipeline', total: 100 }
			)

			const clipsToStitch = segments.map((seg, idx) => ({
				path: slicedResults[idx]?.outputPath || this.$db.resolveSync(outputDir, `${seg.label}.mp4`),
				duration: seg.end - seg.start,
			}))

			try {
				stitchedResult = await slicer.stitch(clipsToStitch, {
					outputPath: stitchOutputPath,
					transition,
					transitionDuration,
					acrossfade,
					audioTransitionDuration,
				})
				yield show(
					t(VideoPipelineCommand.UI.stitchComplete, {
						path: stitchOutputPath,
						duration: stitchedResult.duration,
					}),
					'success'
				)
			} catch (err) {
				yield show(`Stitching scenes: ${err.message}`, 'warn')
			}
		}

		// Generate .srt and .vtt per episode with offset timestamps
		if (this.subtitles !== false && whisperJson) {
			const allWords = whisperJson?.segments?.flatMap((s) => s.words || []) || []
			for (const seg of segments) {
				const segWords = allWords.filter(
					(w) =>
						(w.start >= seg.start && w.end <= seg.end) || (w.start <= seg.end && w.end >= seg.start)
				)
				if (segWords.length > 0) {
					const blocks = chunkTranscript(segWords, { maxWords: 6 })
					const srtContent = blocksToSrt(blocks, { offset: seg.start })
					const vttContent = blocksToVtt(blocks, { offset: seg.start })

					const srtPath = this.$db.resolveSync(outputDir, `${seg.label}.srt`)
					const vttPath = this.$db.resolveSync(outputDir, `${seg.label}.vtt`)

					await this.$db.saveDocument(srtPath, srtContent)
					await this.$db.saveDocument(vttPath, vttContent)
				}
			}
			yield show(
				t(VideoPipelineCommand.UI.subtitlesGenerated, { outputDir }),
				'success'
			)
		}

		// Generate Overview, Articles & Social Kits via ArticlePipelineService
		yield* ArticlePipelineService.process({
			url,
			outputDir,
			segments,
			whisperJson,
			template: this.template || 'tech',
			language: this.language || 'auto',
			model: this.model,
			sources: this.sources,
			overview: this.overview !== false,
			article: this.article !== false,
			db: this.$db,
			t,
		})

		// Generate dynamic Shorts only if explicitly requested
		if (this.shorts) {
			yield progress(t(VideoPipelineCommand.UI.shortsProgress), 85, { id: 'pipeline', total: 100 })
			const shortsCmd = new ShortsGenerateCommand(
				{
					shortsYaml: cutMapPath,
					auto: !this.directorCut && !this.cutMap,
					transcriptPath,
					videoPath: url,
					autoDuration: Number(this.shortsDuration) || 45,
					useHardwareAcceleration: true,
					outputDir: this.$db.resolveSync(outputDir, 'shorts'),
				},
				this._
			)

			for await (const update of shortsCmd.run()) {
				if (update.type === 'log') {
					yield show(update.message, update.level || 'info')
				} else if (update.type === 'progress') {
					yield progress(update.message, 90, { id: 'pipeline', total: 100 })
				}
			}
		}

		// --- Step 4: Multi-Platform Publishing ---
		if (this.publish) {
			yield progress(t(VideoPipelineCommand.UI.stepPublishing, { platform: this.publish }), 95, {
				id: 'pipeline',
				total: 100,
			})
		}

		// --- Verification & Integrity Inspector ---
		const auditReport = PipelineAuditService.audit(outputDir, segments)

		if (auditReport.emptyFiles.length > 0) {
			yield show(
				t(VideoPipelineCommand.UI.auditEmptyWarning, { count: auditReport.emptyFiles.length }),
				'warning'
			)
		} else {
			yield show(
				t(VideoPipelineCommand.UI.auditSuccess, {
					videos: auditReport.videoSlices,
					subtitles: auditReport.subtitles,
					articles: auditReport.articles,
					social: auditReport.socialKits,
				}),
				'success'
			)
		}

		yield progress(t(VideoPipelineCommand.UI.pipelineComplete), 100, {
			id: 'pipeline',
			total: 100,
		})

		return result({
			success: true,
			outputDir,
			url,
			cutMapPath,
			transcriptPath,
			segments: slicedResults.length,
			stitchedPath: stitchedResult?.outputPath || null,
			audit: auditReport,
		})
	}
}
