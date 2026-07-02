#!/usr/bin/env node

/**
 * script-generator.js
 * JavaScript port of automated YouTube Shorts script & AI prompt generator.
 * Priority: Cerebras gpt-oss-120b first, fallback to OpenRouter (Gemini 2.5 Flash) / OpenAI.
 * Reads language settings and character settings from config.yaml / share.config.yaml.
 */

import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'
import { AI } from '@nan0web/ai'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function parseArgs() {
	const args = {
		videoId: '',
		season: 1,
		episode: 1,
		start: '00:00:00.000',
		end: '00:00:10.000',
		title: 'Default Short',
		root: ''
	}
	const argv = process.argv
	for (let i = 2; i < argv.length; i++) {
		const arg = argv[i]
		if (arg === '--video-id' || arg === '-v') args.videoId = argv[++i]
		else if (arg === '--season' || arg === '-s') args.season = parseInt(argv[++i], 10)
		else if (arg === '--episode' || arg === '-e') args.episode = parseInt(argv[++i], 10)
		else if (arg === '--start') args.start = argv[++i]
		else if (arg === '--end') args.end = argv[++i]
		else if (arg === '--title' || arg === '-t') args.title = argv[++i]
		else if (arg === '--root' || arg === '-r') args.root = argv[++i]
	}
	return args
}

function getLatestPublishTime(vlogDir) {
	let latestTime = null
	if (!fs.existsSync(vlogDir)) return null
	const seasons = fs.readdirSync(vlogDir).filter(s => s.startsWith('season_'))
	for (const season of seasons) {
		const seasonPath = path.join(vlogDir, season)
		if (!fs.statSync(seasonPath).isDirectory()) continue
		const episodes = fs.readdirSync(seasonPath).filter(e => e.startsWith('episode_'))
		for (const episode of episodes) {
			const episodePath = path.join(seasonPath, episode)
			if (!fs.statSync(episodePath).isDirectory()) continue
			const files = fs.readdirSync(episodePath).filter(f => f.startsWith('shorts_') && f.endsWith('.md'))
			for (const file of files) {
				try {
					const content = fs.readFileSync(path.join(episodePath, file), 'utf-8')
					const match = content.match(/publish_time:\s*['"]?([^'"\n]+)['"]?/)
					if (match) {
						const date = new Date(match[1])
						if (!isNaN(date.getTime())) {
							if (!latestTime || date > latestTime) {
								latestTime = date
							}
						}
					}
				} catch (err) {
					// Skip
				}
			}
		}
	}
	return latestTime
}

async function generateAiContent(titleContext, startTime, endTime, language = 'en', character = 'Zhorik the Wise Cat') {
	const langName = language === 'en' ? 'English' : 'Ukrainian'
	const prompt = `
    You are generating content for a YouTube Shorts vlog featuring "${character}".
    The video topic is: "${titleContext}" (segment: ${startTime} - ${endTime}).
    
    Generate a JSON object with the following fields:
    {
      "title": "A creative catchy title for the Shorts in ${langName} (max 50 chars)",
      "text1": "Scenario line 1 (Hook statement in ${langName}, max 35 chars)",
      "text2": "Scenario line 2 (Development / intrigue in ${langName}, max 35 chars)",
      "text3": "Scenario line 3 (Philosophical conclusion in ${langName}, max 35 chars)",
      "veo_prompt": "A highly detailed text-to-video prompt for Veo generator (8s loop, visual style: cozy warm cinematic lighting, character ${character}, ancient Ukrainian rustic house or zen garden background)",
      "audio_style_prompt": "A music generation prompt for Suno/Udio (e.g. Calm lofi background beat with acoustic guitar, peaceful, 90 bpm)"
    }
    
    Ensure text1, text2, and text3 create a cohesive story flow where each phrase takes about 3-4 seconds to say.
    Return ONLY clean JSON, no markdown formatting.
    `

	const ai = new AI()
	await ai.refreshModels()

	// 1. Try Cerebras gpt-oss-120b
	const cerebrasModel = ai.findModel('gpt-oss-120b')
	if (cerebrasModel && process.env.CEREBRAS_API_KEY) {
		try {
			console.log('🚀 Calling Cerebras (gpt-oss-120b)...')
			const { text } = await ai.generateText(cerebrasModel, [
				{ role: 'system', content: 'You are a creative production assistant. Output ONLY valid JSON.' },
				{ role: 'user', content: prompt }
			])
			let clean = text.trim()
			if (clean.startsWith('```')) {
				clean = clean.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '')
			}
			return JSON.parse(clean)
		} catch (err) {
			console.error(`⚠️ Cerebras failed: ${err.message}. Trying fallbacks...`)
		}
	}

	// 2. Fallback to OpenRouter (Gemini 2.5 Flash) or OpenAI (GPT-4o-mini)
	const fallbackModel = ai.findModel('gemini-2.5-flash') || ai.findModel('gpt-4o-mini')
	if (fallbackModel) {
		try {
			console.log(`🔄 Fallback: calling ${fallbackModel.id} via ${fallbackModel.provider}...`)
			const { text } = await ai.generateText(fallbackModel, [
				{ role: 'system', content: 'You are a creative production assistant. Output ONLY valid JSON.' },
				{ role: 'user', content: prompt }
			])
			let clean = text.trim()
			if (clean.startsWith('```')) {
				clean = clean.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '')
			}
			return JSON.parse(clean)
		} catch (err) {
			console.error(`⚠️ Fallback failed: ${err.message}`)
		}
	}

	return null
}

async function main() {
	const args = parseArgs()
	
	// Determine channel root directory
	let channelRoot = args.root
	if (!channelRoot) {
		if (fs.existsSync(path.join(process.cwd(), 'config.yaml')) || fs.existsSync(path.join(process.cwd(), 'share.config.yaml'))) {
			channelRoot = process.cwd()
		} else {
			channelRoot = '/Users/i/src/apps/family/zhorik'
		}
	}

	const episodeDir = path.join(channelRoot, 'vlog', `season_${args.season}`, `episode_${args.episode}`)

	if (!fs.existsSync(episodeDir)) {
		fs.mkdirSync(episodeDir, { recursive: true })
	}

	// 1. Find local video or download audio via yt-dlp
	const mediaDir = path.join(channelRoot, 'vlog', 'media', `season_${args.season}`, `episode_${args.episode}`)
	let localVideoPath = null
	if (fs.existsSync(mediaDir)) {
		const files = fs.readdirSync(mediaDir)
		for (const file of files) {
			if (['.mp4', '.mov', '.mkv'].includes(path.extname(file).toLowerCase())) {
				localVideoPath = path.join(mediaDir, file)
				break
			}
		}
	}

	if (localVideoPath) {
		console.log(`✅ Local video found: ${path.basename(localVideoPath)}`)
	} else {
		console.log('⚠️ Local video not found. Downloading audio track via yt-dlp...')
		const ytUrl = `https://www.youtube.com/watch?v=${args.videoId}`
		const audioOutput = path.join(episodeDir, 'source_audio.wav')
		
		if (fs.existsSync(audioOutput)) {
			console.log(`ℹ️ Audio track already downloaded: ${audioOutput}`)
		} else {
			const cmd = `yt-dlp -x --audio-format wav -o "${audioOutput}" "${ytUrl}"`
			console.log(`Running: ${cmd}`)
			await execAsync(cmd)
			console.log(`✅ Audio downloaded: ${audioOutput}`)
		}
	}

	// 2. Schedule publishing time
	let nextPub
	const latestPub = getLatestPublishTime(path.join(channelRoot, 'vlog'))
	if (latestPub) {
		nextPub = new Date(latestPub.getTime() + 2 * 24 * 60 * 60 * 1000)
	} else {
		const tomorrow = new Date()
		tomorrow.setDate(tomorrow.getDate() + 1)
		tomorrow.setHours(18, 0, 0, 0)
		nextPub = tomorrow
	}

	// Simple ISO timezone adjustment (+03:00)
	const publishTimeStr = nextPub.toISOString().replace(/\.\d+Z$/, '+03:00')

	// 3. Next index calculation
	const existingShorts = fs.readdirSync(episodeDir).filter(f => f.startsWith('shorts_') && f.endsWith('.md'))
	let nextNum = 1
	if (existingShorts.length > 0) {
		const indices = []
		for (const es of existingShorts) {
			const m = es.match(/shorts_(\d+)\.md$/)
			if (m) indices.push(parseInt(m[1], 10))
		}
		if (indices.length > 0) {
			nextNum = Math.max(...indices) + 1
		}
	}

	const shortFilename = path.join(episodeDir, `shorts_${nextNum}.md`)

	// 4. Load config settings
	let language = 'en'
	let character = 'Zhorik the Wise Cat'
	const configPaths = [
		path.join(channelRoot, 'config.yaml'),
		path.join(channelRoot, 'share.config.yaml'),
		path.join(__dirname, '..', 'share.config.yaml')
	]

	for (const cp of configPaths) {
		if (fs.existsSync(cp)) {
			try {
				const cfgContent = fs.readFileSync(cp, 'utf-8')
				const cfg = YAML.parse(cfgContent)
				if (cfg && cfg.content_settings) {
					language = cfg.content_settings.language ?? language
					character = cfg.content_settings.character ?? character
					console.log(`⚙️ Loaded settings: language='${language}', character='${character}'`)
					break
				}
			} catch (err) {
				// Skip
			}
		}
	}

	// 5. Generate content via AI
	console.log(`🤖 Contacting AI for scenario generation (character: "${character}")...`)
	const aiData = await generateAiContent(args.title, args.start, args.end, language, character)

	let title, text1, text2, text3, veoPrompt, audioPrompt
	if (aiData) {
		title = aiData.title || args.title
		text1 = aiData.text1 || 'Hook line'
		text2 = aiData.text2 || 'Body line'
		text3 = aiData.text3 || 'Outro line'
		veoPrompt = aiData.veo_prompt || `${character} cinematic`
		audioPrompt = aiData.audio_style_prompt || 'lo-fi acoustic'
	} else {
		title = args.title
		text1 = 'Scenario line 1 (Title overlay)'
		text2 = 'Scenario line 2 (Subtitle line 1)'
		text3 = 'Scenario line 3 (Subtitle line 2)'
		veoPrompt = `Cozy warm cinematic lighting, 8k, character "${character}" performing actions related to '${args.title}'`
		audioPrompt = 'Calm lo-fi background beat, positive acoustic guitar chords, relax vlog vibe, 90 bpm'
	}

	// 6. Write Markdown file
	const frontmatter = {
		id: `short_${nextNum}`,
		source_video_id: args.videoId,
		source_video_url: `https://www.youtube.com/watch?v=${args.videoId}`,
		status: 'pending',
		publish_time: publishTimeStr,
		alignment: 'center',
		time_start: args.start,
		time_end: args.end,
		ai_generation: {
			veo_prompt: veoPrompt,
			audio_style_prompt: audioPrompt
		}
	}

	const fileContent = `---
${YAML.stringify(frontmatter)}---
# ${title}

${text1}
${text2}
${text3}
`

	fs.writeFileSync(shortFilename, fileContent, 'utf-8')
	console.log(`\n🎉 Shorts file successfully generated with AI context:`)
	console.log(`📂 Path: ${shortFilename}`)
	console.log(`📅 Published: ${publishTimeStr}`)
	console.log(`📝 Title: ${title}`)
}

main().catch(err => {
	console.error('❌ Critical script failure:', err)
	process.exit(1)
})
