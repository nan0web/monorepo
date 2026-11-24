import { show, progress, result } from '@nan0web/ui'
import { ArticleGenerator } from './ArticleGenerator.js'
import { DomainContextResolver } from './DomainContextResolver.js'
import { LLMClient } from './LLMClient.js'

/**
 * ArticlePipelineService — handles generation of overview chapters, individual episode articles,
 * master long-read, and social distribution kits.
 */
export class ArticlePipelineService {
	/**
	 * @param {object} options
	 * @param {string} options.url
	 * @param {string} options.outputDir
	 * @param {Array<object>} options.segments
	 * @param {object} options.whisperJson
	 * @param {string} [options.template='tech']
	 * @param {string} [options.language='auto']
	 * @param {string} [options.model]
	 * @param {string} [options.sources]
	 * @param {boolean} [options.overview=true]
	 * @param {boolean} [options.article=true]
	 * @param {Function} options.t
	 * @param {import('@nan0web/db').DB} [options.db]
	 */
	static async *process(options) {
		const {
			url,
			outputDir,
			segments,
			whisperJson,
			template = 'tech',
			language = 'auto',
			model,
			sources,
			overview = true,
			article = true,
			t,
			db,
		} = options

		if (!whisperJson) return

		const resolvePath = (...parts) => {
			if (db && typeof db.resolveSync === 'function') {
				return parts.reduce((acc, p) => db.resolveSync(acc, p))
			}
			return parts.join('/')
		}
		const basename = (filePath) => {
			if (db && typeof db.basename === 'function') return db.basename(filePath)
			return (filePath || '').split('/').filter(Boolean).pop() || ''
		}
		const saveDoc = async (p, content) => {
			if (db && typeof db.saveDocument === 'function') {
				await db.saveDocument(p, content)
			}
		}

		// 1. Generate Overview and YouTube Chapters
		if (overview !== false) {
			let overviewMd = `# 📑 ${basename(url || 'Video')}\n\n`
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

			const overviewPath = resolvePath(outputDir, 'overview.md')
			await saveDoc(overviewPath, overviewMd)
			yield show(t('📄 Created overview & YouTube timestamps -> {path}', { path: overviewPath }), 'success')
		}

		// 2. Generate Articles and Social Kits
		if (article !== false) {
			const domainContext = await DomainContextResolver.scanSources(sources, db)
			if (domainContext.packages.length > 0) {
				yield show(
					t('🧩 Attached Ground Truth from {count} local sources: {sources}', {
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
			const articlesDir = resolvePath(outputDir, 'articles')

			LLMClient.resetMetrics()

			for (let idx = 0; idx < episodeData.length; idx++) {
				const ep = episodeData[idx]
				yield progress(
					t('✍️ [{current}/{total}] Generating article: {title}...', {
						current: idx + 1,
						total: episodeData.length,
						title: ep.title,
					}),
					idx,
					{ id: 'article_generation', total: episodeData.length }
				)

				const gen = ArticleGenerator.generateEpisodeArticle(ep, idx, {
					template,
					model,
					language,
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

				const epPath = resolvePath(articlesDir, `${ep.label}.md`)
				await saveDoc(epPath, epDoc)
				episodeDocs.push(epDoc)

				yield progress(
					t('✅ [{current}/{total}] Saved: {file}', {
						current: idx + 1,
						total: episodeData.length,
						file: `${ep.label}.md`,
					}),
					idx + 1,
					{ id: 'article_generation', total: episodeData.length }
				)
			}

			yield show(
				t('📚 Generated {count} publications ({template}) in {dir}/', {
					count: episodeData.length,
					template,
					dir: articlesDir,
				}),
				'success'
			)

			// Master Long-read
			const masterMd = ArticleGenerator.generateMasterFromDocs(episodeData, episodeDocs, {
				title: basename(url || 'Video'),
				template,
				language,
			})
			const articlePath = resolvePath(outputDir, 'article.md')
			await saveDoc(articlePath, masterMd)
			yield show(
				t('📖 Generated structured long-read ({template}) -> {path}', {
					template,
					path: articlePath,
				}),
				'success'
			)

			// Social Omni-Publishing Package
			const socialDir = resolvePath(outputDir, 'social')
			const epSocialDir = resolvePath(socialDir, 'episodes')

			const socialPkg = await ArticleGenerator.generateSocialDistributionPackage(episodeData, {
				title: basename(url || 'Video'),
				language,
			})

			await saveDoc(resolvePath(socialDir, 'threads.md'), socialPkg.threads)
			await saveDoc(resolvePath(socialDir, 'telegram.md'), socialPkg.telegram)
			await saveDoc(resolvePath(socialDir, 'youtube-meta.json'), JSON.stringify(socialPkg.youtube, null, 2))

			if (Array.isArray(socialPkg.episodeSocials)) {
				for (const item of socialPkg.episodeSocials) {
					await saveDoc(resolvePath(epSocialDir, `${item.label}.threads.md`), item.threads)
					await saveDoc(resolvePath(epSocialDir, `${item.label}.telegram.md`), item.telegram)
					await saveDoc(resolvePath(epSocialDir, `${item.label}.youtube.json`), JSON.stringify(item.youtube, null, 2))
				}
			}

			yield show(
				t('📱 Generated distribution packages for channel and {count} individual episodes -> {dir}/', {
					count: episodeData.length,
					dir: socialDir,
				}),
				'success'
			)

			// LLM Metrics
			const m = LLMClient.metrics
			if (m.calls > 0) {
				const costStr = m.totalCost < 0.01 ? `$${m.totalCost.toFixed(5)}` : `$${m.totalCost.toFixed(4)}`
				yield show(
					t('📊 LLM Usage: {tokens} tokens (Prompt: {prompt}, Completion: {completion}) | Cost: {cost} [{model}]', {
						tokens: m.totalTokens.toLocaleString(),
						prompt: m.promptTokens.toLocaleString(),
						completion: m.completionTokens.toLocaleString(),
						cost: costStr,
						model,
					}),
					'info'
				)
			}
		}
	}
}
