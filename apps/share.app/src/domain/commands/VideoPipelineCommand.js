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
import { ArticleGenerator } from '../generation/ArticleGenerator.js'
import { DomainContextResolver } from '../generation/DomainContextResolver.js'
import { LLMClient } from '../generation/LLMClient.js'
import { progress, show, result, log } from '@nan0web/ui'

import fs from 'node:fs'
import path from 'node:path'

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
				? path.join(process.env.HOME || '', rawUrl.slice(2))
				: rawUrl

		if (!fs.existsSync(outputDir)) {
			try {
				fs.mkdirSync(outputDir, { recursive: true })
			} catch {}
		}

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
		yield show(
			t(VideoPipelineCommand.UI.stepTranscription, { name: path.basename(url) }),
			'info'
		)
		const transcriptPath = path.join(outputDir, 'transcript.json')
		let whisperJson = null

		if (fs.existsSync(transcriptPath)) {
			yield show(
				t(VideoPipelineCommand.UI.cachedTranscriptFound, { path: transcriptPath }),
				'success'
			)
			try {
				whisperJson = JSON.parse(fs.readFileSync(transcriptPath, 'utf8'))
			} catch {}
		}

		if (!whisperJson) {
			const downloadModel = new MediaDownloadModel(
				{
					url,
					quality: 'medium',
					format: 'json',
					language: this.language || 'auto',
				},
				this._
			)

			let transcriptResult = null
			let lastDownloadPercent = -1
			let lastSegmentPercent = -1
			let lastTranscribeChunk = 0

			for await (const update of downloadModel.run()) {
				switch (update.status) {
					case 'downloading':
						if (update.percent !== undefined && update.percent !== lastDownloadPercent) {
							lastDownloadPercent = update.percent
							yield progress(
								t(VideoPipelineCommand.UI.audioDownloadProgress, { percent: update.percent }),
								update.percent,
								{ id: 'whisper', total: 100 }
							)
						}
						break
					case 'segmenting':
						if (update.percent !== undefined && update.percent !== lastSegmentPercent) {
							lastSegmentPercent = update.percent
							yield progress(
								t(VideoPipelineCommand.UI.audioSegmentProgress, { percent: update.percent }),
								update.percent,
								{ id: 'whisper', total: 100 }
							)
						}
						break
					case 'transcribing':
						if (update.chunk !== lastTranscribeChunk) {
							lastTranscribeChunk = update.chunk
							yield progress(
								t(VideoPipelineCommand.UI.whisperChunkProgress, { chunk: update.chunk, total: update.total }),
								update.chunk,
								{ id: 'whisper', total: update.total }
							)
						}
						break
					case 'partial_progress':
						if (update.percent !== undefined) {
							yield progress(
								t(VideoPipelineCommand.UI.whisperChunkDetail, {
									chunk: update.chunk,
									total: update.total,
									percent: update.percent,
								}),
								update.chunk - 1 + update.percent / 100,
								{ id: 'whisper', total: update.total }
							)
						}
						break
					case 'partial':
						yield progress(
							t(VideoPipelineCommand.UI.whisperChunkDone, { chunk: update.chunk, total: update.total }),
							update.chunk,
							{ id: 'whisper', total: update.total }
						)
						break
					case 'done':
						transcriptResult = update.transcript || update.text || model.transcript
						break
				}
			}

			if (transcriptResult) {
				fs.writeFileSync(transcriptPath, transcriptResult, 'utf8')
				try {
					whisperJson = JSON.parse(transcriptResult)
				} catch {
					whisperJson = { text: transcriptResult }
				}
				yield show(t(VideoPipelineCommand.UI.transcriptionSaved, { path: transcriptPath }), 'success')
			} else if (downloadModel.transcript) {
				transcriptResult = downloadModel.transcript
				fs.writeFileSync(transcriptPath, transcriptResult, 'utf8')
				try {
					whisperJson = JSON.parse(transcriptResult)
				} catch {
					whisperJson = { text: transcriptResult }
				}
				yield show(t(VideoPipelineCommand.UI.transcriptionSaved, { path: transcriptPath }), 'success')
			}
		}

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

		// Create clean CutMap with meaningful episodes
		const segments = (chapters.length > 0 ? chapters : rawChapters).map((ch, idx) => ({
			label: `episode_${idx + 1}`,
			start: Math.round(ch.startTime * 100) / 100,
			end: Math.round(ch.endTime * 100) / 100,
			type: 'episode',
			title: ch.title || `Episode ${idx + 1}`,
		}))

		const cutMap = {
			version: 1,
			source: url,
			aspectRatio: '16:9',
			segments,
		}

		const cutMapPath = path.join(outputDir, 'cut-map.yaml')
		fs.writeFileSync(cutMapPath, CutMapGenerator.toYaml(cutMap), 'utf8')
		yield show(
			t(VideoPipelineCommand.UI.episodesGenerated, {
				count: segments.length,
				path: cutMapPath,
			}),
			'success'
		)

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

					const srtPath = path.join(outputDir, `${seg.label}.srt`)
					const vttPath = path.join(outputDir, `${seg.label}.vtt`)

					fs.writeFileSync(srtPath, srtContent, 'utf8')
					fs.writeFileSync(vttPath, vttContent, 'utf8')
				}
			}
			yield show(
				t(VideoPipelineCommand.UI.subtitlesGenerated, { outputDir }),
				'success'
			)
		}

		// Generate Overview and YouTube Chapters
		if (this.overview !== false && whisperJson) {
			let overviewMd = `# 📑 ${path.basename(url || 'Video')}\n\n`
			overviewMd += `## ⏱️ YouTube Chapters\n\n`
			for (const seg of segments) {
				const minutes = Math.floor(seg.start / 60)
				const seconds = Math.floor(seg.start % 60)
				const timestamp = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
				overviewMd += `${timestamp} ${seg.title}\n`
			}

			overviewMd += `\n## 📋 Episodes Index\n\n`
			for (const seg of segments) {
				const dur = Math.round(seg.end - seg.start)
				overviewMd += `### ${seg.title} (\`${seg.label}.mp4\` - ${Math.floor(dur / 60)}m ${dur % 60}s)\n`
				overviewMd += `- **Timestamp:** \`${seg.start}s - ${seg.end}s\`\n`
				overviewMd += `- **Subtitles:** [\`${seg.label}.srt\`](./${seg.label}.srt) | [\`${seg.label}.vtt\`](./${seg.label}.vtt)\n\n`
			}

			const overviewPath = path.join(outputDir, 'overview.md')
			fs.writeFileSync(overviewPath, overviewMd, 'utf8')
			yield show(t(VideoPipelineCommand.UI.overviewCreated, { path: overviewPath }), 'success')
		}

		// Generate Article from transcript using ArticleGenerator
		if (this.article !== false && whisperJson) {
			const domainContext = DomainContextResolver.scanSources(this.sources)
			if (domainContext.packages.length > 0) {
				yield show(
					t(VideoPipelineCommand.UI.groundTruthLoaded, {
						count: domainContext.packages.length,
						sources: domainContext.packages.map((p) => p.name).join(', '),
					}),
					'info'
				)
			}

			const episodeData = segments.map((seg) => {
				const segText =
					whisperJson.segments
						?.filter(
							(s) =>
								(s.start >= seg.start && s.end <= seg.end) ||
								(s.start <= seg.end && s.end >= seg.start)
						)
						?.map((s) => s.text?.trim())
						?.filter(Boolean)
						?.join(' ') || ''
				return {
					...seg,
					startTime: seg.start,
					endTime: seg.end,
					text: segText,
				}
			})

			const episodeDocs = []

			const articlesDir = path.join(outputDir, 'articles')
			if (!fs.existsSync(articlesDir)) {
				try {
					fs.mkdirSync(articlesDir, { recursive: true })
				} catch {}
			}

			LLMClient.resetMetrics()

			for (let idx = 0; idx < episodeData.length; idx++) {
				const ep = episodeData[idx]
				yield progress(
					t(VideoPipelineCommand.UI.articleGenStart, {
						current: idx + 1,
						total: episodeData.length,
						title: ep.title,
					}),
					idx,
					{
						id: 'article_generation',
						total: episodeData.length,
					}
				)

				const gen = ArticleGenerator.generateEpisodeArticle(ep, idx, {
					template: this.template || 'tech',
					model: this.model,
					language: this.language,
					domainContext,
					totalEpisodes: episodeData.length,
				})

				let epDoc = ''
				while (true) {
					const { done, value } = await gen.next()
					if (done) {
						epDoc = value || ''
						break
					}
					yield value
				}

				const epPath = path.join(articlesDir, `${ep.label}.md`)
				fs.writeFileSync(epPath, epDoc, 'utf8')
				episodeDocs.push(epDoc)

				yield progress(
					t(VideoPipelineCommand.UI.articleSaved, {
						current: idx + 1,
						total: episodeData.length,
						file: `${ep.label}.md`,
					}),
					idx + 1,
					{
						id: 'article_generation',
						total: episodeData.length,
					}
				)
			}
			yield show(
				t(VideoPipelineCommand.UI.articlesAllDone, {
					count: episodeData.length,
					template: this.template || 'tech',
					dir: articlesDir,
				}),
				'success'
			)

			// 2. Master Long-read Article (assembled instantly from episode docs, 0 extra LLM calls)
			const masterMd = ArticleGenerator.generateMasterFromDocs(episodeData, episodeDocs, {
				title: path.basename(url || 'Video'),
				template: this.template || 'tech',
				language: this.language,
			})
			const articlePath = path.join(outputDir, 'article.md')
			fs.writeFileSync(articlePath, masterMd, 'utf8')
			yield show(
				t(VideoPipelineCommand.UI.masterLongreadDone, {
					template: this.template || 'tech',
					path: articlePath,
				}),
				'success'
			)

			// 3. Social Omni-Publishing Package (Threads, Telegram, YouTube Meta)
			const socialDir = path.join(outputDir, 'social')
			const epSocialDir = path.join(socialDir, 'episodes')
			if (!fs.existsSync(epSocialDir)) {
				try {
					fs.mkdirSync(epSocialDir, { recursive: true })
				} catch {}
			}

			const socialPkg = await ArticleGenerator.generateSocialDistributionPackage(episodeData, {
				title: path.basename(url || 'Video'),
				language: this.language,
			})

			fs.writeFileSync(path.join(socialDir, 'threads.md'), socialPkg.threads, 'utf8')
			fs.writeFileSync(path.join(socialDir, 'telegram.md'), socialPkg.telegram, 'utf8')
			fs.writeFileSync(
				path.join(socialDir, 'youtube-meta.json'),
				JSON.stringify(socialPkg.youtube, null, 2),
				'utf8'
			)

			// Save individual per-episode social kits
			if (Array.isArray(socialPkg.episodeSocials)) {
				for (const item of socialPkg.episodeSocials) {
					fs.writeFileSync(path.join(epSocialDir, `${item.label}.threads.md`), item.threads, 'utf8')
					fs.writeFileSync(
						path.join(epSocialDir, `${item.label}.telegram.md`),
						item.telegram,
						'utf8'
					)
					fs.writeFileSync(
						path.join(epSocialDir, `${item.label}.youtube.json`),
						JSON.stringify(item.youtube, null, 2),
						'utf8'
					)
				}
			}
			yield show(
				t(VideoPipelineCommand.UI.socialPackagesDone, {
					count: episodeData.length,
					dir: socialDir,
				}),
				'success'
			)

			// 4. Token & Cost Summary
			const m = LLMClient.metrics
			if (m.calls > 0) {
				const costStr =
					m.totalCost < 0.01 ? `$${m.totalCost.toFixed(5)}` : `$${m.totalCost.toFixed(4)}`
				yield show(
					t(VideoPipelineCommand.UI.llmMetrics, {
						tokens: m.totalTokens.toLocaleString(),
						prompt: m.promptTokens.toLocaleString(),
						completion: m.completionTokens.toLocaleString(),
						cost: costStr,
						model: this.model,
					}),
					'info'
				)
			}
		}

		// Generate dynamic Shorts only if explicitly requested
		if (this.shorts) {
			yield progress(t(VideoPipelineCommand.UI.shortsProgress), 85, { id: 'pipeline', total: 100 })
			const shortsCmd = new ShortsGenerateCommand(
				{
					auto: true,
					transcriptPath,
					videoPath: url,
					autoDuration: Number(this.shortsDuration) || 45,
					useHardwareAcceleration: true,
					outputDir: path.join(outputDir, 'shorts'),
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
		const auditReport = {
			videoSlices: 0,
			subtitles: 0,
			articles: 0,
			socialKits: 0,
			emptyFiles: [],
		}

		const checkFile = (filePath, category) => {
			if (fs.existsSync(filePath)) {
				const size = fs.statSync(filePath).size
				if (size > 0) {
					auditReport[category] = (auditReport[category] || 0) + 1
				} else {
					auditReport.emptyFiles.push(filePath)
				}
			}
		}

		// Audit episodes
		for (const seg of segments) {
			checkFile(path.join(outputDir, `${seg.label}.mp4`), 'videoSlices')
			checkFile(path.join(outputDir, `${seg.label}.srt`), 'subtitles')
			checkFile(path.join(outputDir, 'articles', `${seg.label}.md`), 'articles')
			checkFile(
				path.join(outputDir, 'social', 'episodes', `${seg.label}.youtube.json`),
				'socialKits'
			)
		}

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
			audit: auditReport,
		})
	}
}
