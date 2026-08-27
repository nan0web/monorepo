import { LLMClient } from './LLMClient.js'
import { DomainContextResolver } from './DomainContextResolver.js'

/**
 * ArticleGenerator - transforms raw audio transcripts into clean, structured Markdown articles, SMM posts, TLDR digests, and social distribution packages via LLM.
 */
export class ArticleGenerator {
	/**
	 * Resolves ISO 639-1 language code and display name.
	 * @param {string} [lang]
	 * @param {string} [sampleText]
	 * @returns {{ code: string, name: string, isUk: boolean }}
	 */
	static resolveLanguage(lang, sampleText = '') {
		const raw = (lang || '').toLowerCase().trim()
		if (raw === 'uk' || raw === 'ua' || raw === 'ukrainian') {
			return { code: 'uk', name: 'Ukrainian', isUk: true }
		}
		if (raw === 'en' || raw === 'english') {
			return { code: 'en', name: 'English', isUk: false }
		}
		// Auto-detection based on Cyrillic presence in text
		if (sampleText && /[\u0400-\u04FF]/.test(sampleText)) {
			return { code: 'uk', name: 'Ukrainian', isUk: true }
		}
		return { code: 'en', name: 'English', isUk: false }
	}

	static getTemplates(langCode = 'en') {
		const isUk = langCode === 'uk'
		return {
			tech: {
				role: 'Senior Software Architect & Technical Writer',
				label: 'Technical Blog / Deep Dive',
				headingEmoji: '🛠️',
				system: isUk
					? 'You are a Senior Software Architect and Tech Blogger. Convert the given spoken coding transcript into a well-structured, engaging, high-quality technical markdown article in Ukrainian (with technical code/English schema terms intact). Ground all concepts in the provided real project repositories and plugins. Do NOT hallucinate fake package names or commands. Explain the problem, architecture decision, implementation steps, and key takeaways. Do NOT include filler words or verbatim transcript rambling.'
					: 'You are a Senior Software Architect and Tech Blogger. Convert the given spoken coding transcript into a well-structured, engaging, high-quality technical markdown article in English. Ground all concepts in the provided real project repositories and plugins. Do NOT hallucinate fake package names or commands. Explain the problem, architectural decisions, implementation steps, and key takeaways. Do NOT include filler words or verbatim transcript rambling.',
			},
			smm: {
				role: 'Tech Evangelist & Viral Content Creator',
				label: 'SMM Post / Social Longread (LinkedIn, Telegram, X)',
				headingEmoji: '🚀',
				system: isUk
					? 'You are a Tech Evangelist and SMM Content Creator. Create a viral, engaging, high-impact social media post in Ukrainian based on the transcript. Include a catchy hook, the main problem, 3 key takeaways with emojis, and a call to action to watch the episode video. Keep it punchy.'
					: 'You are a Tech Evangelist and SMM Content Creator. Create a viral, engaging, high-impact social media post in English based on the transcript. Include a catchy hook, the main problem, 3 key takeaways with emojis, and a call to action to watch the episode video. Keep it punchy.',
			},
			tldr: {
				role: 'Executive Tech Editor',
				label: 'TL;DR Digest / Quick Summary',
				headingEmoji: '⚡',
				system: isUk
					? 'You are an Executive Tech Editor. Create an ultra-concise TL;DR summary in Ukrainian. 3-4 bullet points highlighting only the essential technical actions and outcomes.'
					: 'You are an Executive Tech Editor. Create an ultra-concise TL;DR summary in English. 3-4 bullet points highlighting only the essential technical actions and outcomes.',
			},
		}
	}

	/**
	 * Cleans spoken filler words, stuttering, and raw transcription artifacts.
	 * @param {string} rawText
	 * @returns {string}
	 */
	static cleanSpokenText(rawText) {
		if (!rawText) return ''
		return DomainContextResolver.sanitizeTranscript(rawText)
			.replace(/\b(umm*|uhh*|like|you know|sort of|kind of|i mean|so basically|actually|right|yeah)\b/gi, '')
			.replace(/\s{2,}/g, ' ')
			.trim()
	}

	/**
	 * Formats a single episode into a standalone publication-ready article based on template.
	 * Async generator yielding OLMUI progress intents during token streaming.
	 * @param {object} episode
	 * @param {number} episodeIndex
	 * @param {object} [options]
	 * @returns {AsyncGenerator<import('@nan0web/ui').ProgressIntent, string, void>}
	 */
	static async *generateEpisodeArticle(episode, episodeIndex, options = {}) {
		const rawText = episode.text || ''
		const cleanedText = this.cleanSpokenText(rawText)
		const langInfo = this.resolveLanguage(options.language, cleanedText)
		const templates = this.getTemplates(langInfo.code)
		const templateKey = (options.template || 'tech').toLowerCase()
		const template = templates[templateKey] || templates.tech

		const durationMin = Math.floor((episode.endTime - episode.startTime) / 60)
		const durationSec = Math.round((episode.endTime - episode.startTime) % 60)
		const totalEpisodes = options.totalEpisodes || (episodeIndex + 1)

		const contextSummary = options.domainContext?.summary
			? langInfo.isUk
				? `\n\nДжерела та реальні пакети кодової бази (Ground Truth):\n"""\n${options.domainContext.summary}\n"""\n`
				: `\n\nCodebase Ground Truth & Real Packages:\n"""\n${options.domainContext.summary}\n"""\n`
			: ''

		// 1. Prompt based on resolved language
		const prompt = langInfo.isUk
			? `Епізод ${episodeIndex + 1} (${durationMin}хв ${durationSec}с). Таймкод: ${Math.round(episode.startTime)}s - ${Math.round(episode.endTime)}s.${contextSummary}\n\nТранскрипт аудіодоріжки:\n"""\n${cleanedText.slice(0, 4000)}\n"""\n\nНапиши готову статтю у форматі Markdown з чіткими заголовками, тезами, архітектурними рішеннями та висновками українською мовою. Обов'язково використовуй точні назви реальних пакетів та плагінів із наданого контексту джерел.`
			: `Episode ${episodeIndex + 1} (${durationMin}m ${durationSec}s). Timestamps: ${Math.round(episode.startTime)}s - ${Math.round(episode.endTime)}s.${contextSummary}\n\nAudio Transcript:\n"""\n${cleanedText.slice(0, 4000)}\n"""\n\nWrite a complete publication-ready article in Markdown with clear headings, architectural decisions, technical solutions, and actionable takeaways in English. Always use the exact names of the real packages and plugins from the provided context.`

		let queue = []
		const onToken = (chunk, fullTextSoFar) => {
			const lastLine = fullTextSoFar.split('\n').filter(l => l.trim()).pop() || ''
			const shortLine = lastLine.length > 70 ? `${lastLine.slice(0, 67)}...` : lastLine
			if (shortLine) {
				queue.push(shortLine)
			}
		}

		// Run LLM in parallel with streaming yielding
		const llmPromise = LLMClient.complete(prompt, {
			system: template.system,
			temperature: 0.4,
			model: options.model,
			onToken,
		})

		while (true) {
			const isDone = await Promise.race([
				llmPromise.then(() => true),
				new Promise(res => setTimeout(() => res(false), 50)),
			])

			while (queue.length > 0) {
				const line = queue.shift()
				const { progress } = await import('@nan0web/ui')
				yield progress(`✍️ [${episodeIndex + 1}/${totalEpisodes}] ${line}`, episodeIndex + 0.5, {
					id: 'article_generation',
					total: totalEpisodes,
				})
			}

			if (isDone) break
		}

		const llmResult = await llmPromise

		if (llmResult) {
			let doc = llmResult.trim()
			doc += `\n\n---\n`
			if (langInfo.isUk) {
				doc += `*🎬 Відео епізоду: [\`episode_${episodeIndex + 1}.mp4\`](./episode_${episodeIndex + 1}.mp4) (Таймкод: \`${Math.round(episode.startTime)}s - ${Math.round(episode.endTime)}s\`)*\n`
				doc += `*💬 Субтитри: [\`.srt\`](./episode_${episodeIndex + 1}.srt) | [\`.vtt\`](./episode_${episodeIndex + 1}.vtt)*\n`
			} else {
				doc += `*🎬 Episode Video: [\`episode_${episodeIndex + 1}.mp4\`](./episode_${episodeIndex + 1}.mp4) (Timestamps: \`${Math.round(episode.startTime)}s - ${Math.round(episode.endTime)}s\`)*\n`
				doc += `*💬 Subtitles: [\`.srt\`](./episode_${episodeIndex + 1}.srt) | [\`.vtt\`](./episode_${episodeIndex + 1}.vtt)*\n`
			}
			return doc
		}

		// Fallback if LLM is unavailable: structured template
		const title = episode.title || `Episode ${episodeIndex + 1}`
		let doc = `# ${template.headingEmoji} ${title}\n\n`
		if (langInfo.isUk) {
			doc += `> **Тривалість:** ${durationMin} хв ${durationSec} с | **Таймкод:** \`${Math.round(episode.startTime)}s - ${Math.round(episode.endTime)}s\`\n\n`
			doc += `## 🎯 1. Огляд теми\n\n${cleanedText.slice(0, 300)}...\n\n`
			doc += `## 📖 2. Деталі\n\n${cleanedText}\n\n`
			doc += `---\n`
			doc += `*🎬 Відео: [\`episode_${episodeIndex + 1}.mp4\`](./episode_${episodeIndex + 1}.mp4) | Субтитри: [\`.srt\`](./episode_${episodeIndex + 1}.srt)*\n`
		} else {
			doc += `> **Duration:** ${durationMin}m ${durationSec}s | **Timestamps:** \`${Math.round(episode.startTime)}s - ${Math.round(episode.endTime)}s\`\n\n`
			doc += `## 🎯 1. Topic Overview\n\n${cleanedText.slice(0, 300)}...\n\n`
			doc += `## 📖 2. Details\n\n${cleanedText}\n\n`
			doc += `---\n`
			doc += `*🎬 Video: [\`episode_${episodeIndex + 1}.mp4\`](./episode_${episodeIndex + 1}.mp4) | Subtitles: [\`.srt\`](./episode_${episodeIndex + 1}.srt)*\n`
		}
		return doc
	}

	/**
	 * Generates master structured long-read article consolidating all chapters (reuses per-episode results).
	 * @param {Array<object>} episodes
	 * @param {Array<string>} [episodeDocs]
	 * @param {object} [options]
	 * @returns {string}
	 */
	static generateMasterFromDocs(episodes, episodeDocs = [], options = {}) {
		const isUk = this.resolveLanguage(options.language).isUk
		const videoTitle = options.title || (isUk ? 'Огляд сесії розробки' : 'Development Session Deep Dive')
		const totalDuration = episodes.reduce((acc, e) => acc + (e.endTime - e.startTime), 0)
		const totalMin = Math.floor(totalDuration / 60)

		let master = `# 🚀 ${videoTitle}\n\n`
		if (isUk) {
			master += `> **Повний огляд сесії розробки** • **Тривалість:** ~${totalMin} хв • **Розділів:** ${episodes.length}\n\n`
			master += `## 📑 Зміст (Table of Contents)\n\n`
		} else {
			master += `> **Full Development Session Overview** • **Duration:** ~${totalMin} mins • **Chapters:** ${episodes.length}\n\n`
			master += `## 📑 Table of Contents\n\n`
		}

		episodes.forEach((ep, idx) => {
			const startMin = Math.floor(ep.startTime / 60)
			const startSec = Math.floor(ep.startTime % 60)
			const timeStr = `${String(startMin).padStart(2, '0')}:${String(startSec).padStart(2, '0')}`
			const chapterLabel = isUk ? `Розділ ${idx + 1}` : `Chapter ${idx + 1}`
			master += `${idx + 1}. [${chapterLabel}: ${ep.title || `Episode ${idx + 1}`}](#-${chapterLabel.toLowerCase().replace(/\s+/g, '-')}) — \`${timeStr}\`\n`
		})
		master += `\n---\n\n`

		episodeDocs.forEach((doc, index) => {
			const chapterLabel = isUk ? `Розділ ${index + 1}` : `Chapter ${index + 1}`
			master += `## 🔹 ${chapterLabel}\n\n`
			master += `${doc}\n\n`
			master += `---\n\n`
		})

		return master
	}

	/**
	 * Generates a full social multi-platform distribution package:
	 * - Per-episode posts: `social/episodes/episode_N.{threads.md, telegram.md, youtube.json}`
	 * - Channel master digest: `social/threads.md`, `social/telegram.md`, `social/youtube-meta.json`
	 *
	 * @param {Array<object>} episodes
	 * @param {object} [options]
	 * @returns {Promise<{ threads: string, telegram: string, youtube: object, episodeSocials: Array<{ label: string, index: number, threads: string, telegram: string, youtube: object }> }>}
	 */
	static async generateSocialDistributionPackage(episodes, options = {}) {
		const isUk = this.resolveLanguage(options.language).isUk
		const videoTitle = options.title || 'Development Walkthrough'

		// 1. YouTube metadata with chapters
		const youtubeChapters = episodes.map((ep, idx) => {
			const startMin = Math.floor(ep.startTime / 60)
			const startSec = Math.floor(ep.startTime % 60)
			const timeStr = `${String(startMin).padStart(2, '0')}:${String(startSec).padStart(2, '0')}`
			return `${timeStr} ${ep.title || `Chapter ${idx + 1}`}`
		}).join('\n')

		const youtubeDescription = `${videoTitle}\n\nTimestamps:\n${youtubeChapters}\n\n#SoftwareEngineering #WebDev #OpenSource`

		const youtubeMeta = {
			title: videoTitle,
			description: youtubeDescription,
			tags: ['programming', 'software architecture', 'tutorial', 'webdev', 'opensource'],
			episodes: episodes.map((ep, idx) => ({
				index: idx + 1,
				file: `${ep.label}.mp4`,
				title: ep.title,
				timestamps: `${Math.round(ep.startTime)}s - ${Math.round(ep.endTime)}s`,
			})),
		}

		// 2. Master Telegram & Twitter Thread
		let telegramPost = `🚀 <b>${videoTitle}</b>\n\n`
		telegramPost += isUk ? `Ось головні моменти та розбір ключових архітектурних тем:\n\n` : `Key highlights and architecture breakdown:\n\n`

		episodes.forEach((ep, idx) => {
			telegramPost += `🔹 <b>${idx + 1}. ${ep.title || `Епізод ${idx + 1}`}</b>\n`
			if (ep.text) {
				const shortDesc = this.cleanSpokenText(ep.text).slice(0, 140)
				telegramPost += `   ${shortDesc}...\n\n`
			}
		})

		let threads = `🧵 1/${episodes.length + 1} 🚀 Deep Dive: ${videoTitle}\n\n`
		threads += isUk
			? `Розбираємо повну сесію та найважливіші технічні рішення. Детальний тред 👇\n\n---\n\n`
			: `Breaking down the complete session and key architectural patterns. Full thread below 👇\n\n---\n\n`

		episodes.forEach((ep, idx) => {
			threads += `🧵 ${idx + 2}/${episodes.length + 1} 🔹 ${ep.title || `Episode ${idx + 1}`}\n\n`
			if (ep.text) {
				const shortDesc = this.cleanSpokenText(ep.text).slice(0, 200)
				threads += `${shortDesc}...\n\n`
			}
			threads += `🎬 Watch: episode_${idx + 1}.mp4\n\n---\n\n`
		})

		// 3. Per-Episode Individual Social Media Kits
		const episodeSocials = episodes.map((ep, idx) => {
			const epTitle = ep.title || (isUk ? `Епізод ${idx + 1}` : `Episode ${idx + 1}`)
			const durationMin = Math.floor((ep.endTime - ep.startTime) / 60)
			const durationSec = Math.round((ep.endTime - ep.startTime) % 60)
			const cleaned = this.cleanSpokenText(ep.text || '')
			const summary = cleaned.slice(0, 250)

			// Individual YouTube Upload Meta
			const epYoutube = {
				title: `${epTitle} | ${videoTitle}`,
				description: `${summary}\n\n⏱️ Duration: ${durationMin}m ${durationSec}s\n📁 Source: ${ep.label}.mp4\n\n#SoftwareEngineering #Coding #Tutorial`,
				tags: ['coding', 'software development', 'tutorial', 'architecture'],
				videoFile: `${ep.label}.mp4`,
				subtitlesSrt: `${ep.label}.srt`,
				subtitlesVtt: `${ep.label}.vtt`,
			}

			// Individual Telegram Post
			let epTelegram = `🎬 <b>${epTitle}</b> (${durationMin}m ${durationSec}s)\n\n`
			epTelegram += `${summary}...\n\n`
			epTelegram += `▶️ <b>Відео епізоду:</b> <code>${ep.label}.mp4</code>\n`
			epTelegram += `💬 <b>Субтитри:</b> <code>${ep.label}.srt</code> | <code>${ep.label}.vtt</code>\n`
			epTelegram += `📖 <b>Стаття:</b> <a href="./articles/${ep.label}.md">Читати повністю</a>`

			// Individual Twitter / X Thread (2-3 tweets)
			let epThreads = `1/2 🚀 ${epTitle}\n\n${summary.slice(0, 220)}...\n\n👇\n\n---\n\n`
			epThreads += `2/2 🎬 Watch full slice: ${ep.label}.mp4\n📄 Article & Notes: ./articles/${ep.label}.md\n\n#DevLife #TechDeepDive`

			return {
				label: ep.label,
				index: idx + 1,
				threads: epThreads,
				telegram: epTelegram,
				youtube: epYoutube,
			}
		})

		return {
			threads,
			telegram: telegramPost,
			youtube: youtubeMeta,
			episodeSocials,
		}
	}
}

