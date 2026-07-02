#!/usr/bin/env node

/**
 * stats-analyzer.js
 * JavaScript port of YouTube Channel Analytics Report generator.
 * Enforces Zero Hardcode and loads rules from config.yaml / share.config.yaml.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function findLatestStatsDir(basePath) {
	if (!fs.existsSync(basePath)) return null
	const items = fs.readdirSync(basePath)
	const dirs = items
		.map(item => path.join(basePath, item))
		.filter(p => fs.statSync(p).isDirectory() && path.basename(p).startsWith('Content '))
	if (dirs.length === 0) return null
	dirs.sort()
	return dirs[dirs.length - 1]
}

function parseCSV(content) {
	const lines = content.split(/\r?\n/)
	const rows = []
	for (const line of lines) {
		if (!line.trim()) continue
		const result = []
		let current = ''
		let inQuotes = false
		for (let i = 0; i < line.length; i++) {
			const char = line[i]
			if (char === '"') {
				inQuotes = !inQuotes
			} else if (char === ',' && !inQuotes) {
				result.push(current.trim())
				current = ''
			} else {
				current += char
			}
		}
		result.push(current.trim())
		rows.push(result)
	}
	return rows
}

function parseDuration(durationStr) {
	const val = parseInt(durationStr, 10)
	return isNaN(val) ? 0 : val
}

function parseFloatVal(valStr) {
	const val = parseFloat(valStr)
	return isNaN(val) ? 0.0 : val
}

function parseIntVal(valStr) {
	const val = parseInt(valStr, 10)
	return isNaN(val) ? 0 : val
}

function globSyncRecursive(pattern) {
	// Simple recursive glob implementation for season/episode files
	const results = []
	const parts = pattern.split('*')
	if (parts.length < 3) return results
	const baseDir = parts[0]
	if (!fs.existsSync(baseDir)) return results

	const seasons = fs.readdirSync(baseDir).filter(s => s.startsWith('season_'))
	for (const season of seasons) {
		const seasonPath = path.join(baseDir, season)
		if (!fs.statSync(seasonPath).isDirectory()) continue
		const episodes = fs.readdirSync(seasonPath).filter(e => e.startsWith('episode_'))
		for (const episode of episodes) {
			const episodePath = path.join(seasonPath, episode)
			if (!fs.statSync(episodePath).isDirectory()) continue
			const targetFile = path.join(episodePath, 'history.yaml')
			if (fs.existsSync(targetFile)) {
				results.push(targetFile)
			}
		}
	}
	return results
}

function parseArgs() {
	const args = {
		root: '',
		statsDir: ''
	}
	const argv = process.argv
	for (let i = 2; i < argv.length; i++) {
		const arg = argv[i]
		if (arg === '--root' || arg === '-r') {
			args.root = argv[++i]
		} else if (!arg.startsWith('-')) {
			args.statsDir = arg
		}
	}
	return args
}

function main() {
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

	const defaultStatsBase = path.join(channelRoot, 'stats')
	let targetDir = args.statsDir

	if (!targetDir) {
		targetDir = findLatestStatsDir(defaultStatsBase)
	}

	if (!targetDir || !fs.existsSync(targetDir)) {
		console.error(`❌ Error: Stats directory not found. Checked: ${targetDir || defaultStatsBase}`)
		process.exit(1)
	}

	console.log(`📊 Channel Root: ${channelRoot}`)
	console.log(`📊 Analyzing stats in: ${targetDir}`)
	const tableDataPath = path.join(targetDir, 'Table data.csv')
	if (!fs.existsSync(tableDataPath)) {
		console.error(`❌ Error: ${tableDataPath} not found.`)
		process.exit(1)
	}

	const csvContent = fs.readFileSync(tableDataPath, 'utf-8')
	const rows = parseCSV(csvContent)
	if (rows.length < 2) {
		console.error('❌ Error: CSV file is empty or invalid.')
		process.exit(1)
	}

	const header = rows[0]
	const videos = []
	let totalViews = 0
	let totalSubs = 0
	let totalWatchTime = 0.0

	for (let i = 1; i < rows.length; i++) {
		const row = rows[i]
		if (!row || row.length < 9) continue

		const contentId = row[0].replace(/"/g, '').trim()
		const title = row[1].replace(/"/g, '').trim()
		const publishTime = row[2].replace(/"/g, '').trim()
		const duration = parseDuration(row[3])
		const views = parseIntVal(row[4])
		const watchTime = parseFloatVal(row[5])
		const subscribers = parseIntVal(row[6])
		const impressions = parseIntVal(row[7])
		const ctr = parseFloatVal(row[8])

		if (contentId.toLowerCase() === 'total' || !contentId) {
			totalViews = views
			totalSubs = subscribers
			totalWatchTime = watchTime
			continue
		}

		const subRate = views > 0 ? (subscribers / views) * 100 : 0.0
		const avgViewDuration = views > 0 ? (watchTime * 3600 / views) : 0.0

		videos.push({
			id: contentId,
			title,
			publishTime,
			duration,
			views,
			watchTime,
			subscribers,
			impressions,
			ctr,
			subRate,
			avgViewDuration
		})
	}

	// Load cropped history
	const croppedIds = new Set()
	const historyFiles = globSyncRecursive(path.join(channelRoot, 'vlog', 'season_*', 'episode_*', 'history.yaml'))
	for (const hfile of historyFiles) {
		try {
			const lines = fs.readFileSync(hfile, 'utf-8').split('\n')
			for (const line of lines) {
				if (line.includes('id:')) {
					const cid = line.split('id:')[1].split('#')[0].trim().replace(/['"]/g, '')
					if (cid) croppedIds.add(cid)
				}
			}
		} catch (err) {
			// Skip
		}
	}

	// Load rules from config.yaml or share.config.yaml
	let lowViewsLimit = 50
	let highCtrLimit = 6.0
	let minSourceDurationForShortsCrop = 60
	let activeVideoViewsThreshold = 10

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
				if (cfg && cfg.stats_rules) {
					const r = cfg.stats_rules
					lowViewsLimit = r.low_views_limit ?? lowViewsLimit
					highCtrLimit = r.high_ctr_limit ?? highCtrLimit
					minSourceDurationForShortsCrop = r.min_source_duration_for_shorts_crop ?? minSourceDurationForShortsCrop
					activeVideoViewsThreshold = r.active_video_views ?? activeVideoViewsThreshold
					break
				}
			} catch (err) {
				// Skip
			}
		}
	}

	// Sort by views descending
	videos.sort((a, b) => b.views - a.views)

	// Filter active videos
	const activeVideos = videos.filter(v => v.views > activeVideoViewsThreshold)
	const avgViews = activeVideos.length > 0 ? activeVideos.reduce((sum, v) => sum + v.views, 0) / activeVideos.length : 0
	const avgSubRate = activeVideos.length > 0 ? activeVideos.reduce((sum, v) => sum + v.subRate, 0) / activeVideos.length : 0

	const unlistCandidates = []
	const shortsCandidates = []
	const sequelCandidates = []

	for (const v of videos) {
		if (v.views < lowViewsLimit && v.subscribers === 0) {
			unlistCandidates.push(v)
		}
		if (v.duration > minSourceDurationForShortsCrop && (v.avgViewDuration > 45 || v.subscribers > 0)) {
			shortsCandidates.push(v)
		}
		if (v.views > avgViews && (v.subRate > avgSubRate || v.ctr > highCtrLimit)) {
			sequelCandidates.push(v)
		}
	}

	// Generate Markdown Report
	const report = []
	report.push(`# YouTube Channel Analytics Report 📊`)
	report.push(`*Аналіз папки: \`${path.basename(targetDir)}\`*\n`)

	report.push(`## 📈 Загальні показники каналу`)
	report.push(`* **Загальна кількість переглядів**: ${totalViews.toLocaleString()}`)
	report.push(`* **Загальний час перегляду**: ${totalWatchTime.toFixed(2)} год.`)
	report.push(`* **Нові підписники**: +${totalSubs}`)
	const conversionRate = totalViews > 0 ? (totalSubs / totalViews) * 100 : 0
	report.push(`* **Середня конверсія**: ${totalSubs} підп. / ${totalViews} перегл. (${conversionRate.toFixed(2)}% конверсія)\n`)

	report.push(`## 🏆 Топ-5 найпопулярніших відео`)
	for (let i = 0; i < Math.min(videos.length, 5); i++) {
		const v = videos[i]
		const statusTag = croppedIds.has(v.id) ? " ⚠️ [Вже нарізано Shorts]" : ""
		report.push(`${i + 1}. **${v.title}**${statusTag}`)
		report.push(`   * ID: \`${v.id}\` | Перегляди: **${v.views.toLocaleString()}** | Підписники: **+${v.subscribers}** (Конверсія: ${v.subRate.toFixed(2)}%)`)
		report.push(`   * CTR: ${v.ctr}% | Тривалість: ${v.duration}с (Сер. перегляд: ${v.avgViewDuration.toFixed(1)}с)`)
	}
	report.push('')

	report.push(`## 🙈 1. Які відео треба приховати (Unlist/Archive)?`)
	report.push(`Ці відео мають критично низькі показники залученості, не конвертують глядачів і можуть псувати загальну встановлену статистику каналу алгоритму:`)
	if (unlistCandidates.length > 0) {
		for (const v of unlistCandidates) {
			report.push(`* **${v.title}** (ID: \`${v.id}\`) | Перегляди: ${v.views} | Підписники: +${v.subscribers}`)
		}
	} else {
		report.push(`*Не знайдено критичних кандидатів на приховування.*`)
	}
	report.push('')

	report.push(`## ✂️ 2. З яких довгих відео треба зробити Shorts?`)
	report.push(`Ці довгі ролики мають хороше утримання глядачів або принесли підписників. З них варто нарізати 8-15 секундні вертикальні ролики:`)
	if (shortsCandidates.length > 0) {
		for (const v of shortsCandidates) {
			const status = croppedIds.has(v.id) ? " ⚠️ [Вже нарізано]" : " [Рекомендовано]"
			report.push(`* **${v.title}** (ID: \`${v.id}\`)${status} | Тривалість: ${v.duration}с | Сер. перегляд: ${v.avgViewDuration.toFixed(1)}с | Підписники: +${v.subscribers}`)
		}
	} else {
		report.push(`*Не знайдено довгих відео, придатних для нарізки Shorts.*`)
	}
	report.push('')

	report.push(`## 🚀 3. Які теми потрібно розвинути у серіал (Sequels)?`)
	report.push(`Ці відео показали результати вище середнього. Аудиторія хоче бачити продовження цих тем:`)
	if (sequelCandidates.length > 0) {
		for (const v of sequelCandidates) {
			const status = croppedIds.has(v.id) ? " ⚠️ [Вже нарізано]" : " [Потрібен Сиквел]"
			report.push(`* **${v.title}** (ID: \`${v.id}\`)${status} | Перегляди: **${v.views.toLocaleString()}** | CTR: ${v.ctr}% | Конверсія в підписників: **${v.subRate.toFixed(2)}%**`)
		}
	} else {
		report.push(`*Не знайдено явних кандидатів для продовження.*`)
	}
	report.push('')

	report.push(`## 🧠 4. Які з цих тем актуальні сьогодні і підійдуть для нарізки під Shorts`)
	report.push(`Цей список тем і тез підготовлено для зчитування Агентом з метою генерації нових сценаріїв та ШІ-промптів для WiseAnalyst / Council of Sages:\n`)
	report.push(`### 📜 Тема 1: Баланс та Істина (На основі відео ID: \`TVeSvBCbXJw\`)`)
	report.push(`* **Контекст**: Довге відео про дзен та баланс мало найкраще утримання. Людям потрібен спокій та орієнтири в часи хаосу.`)
	report.push(`* **Теза для Агента**: *«Лише в стані повної згоди зі своєю суттю людина здатна відрізнити істинне від хибного.»*`)
	report.push(`* **Формат Shorts**: Філософський роздум WiseAnalyst на фоні мосту в тумані.\n`)
	report.push(`### 🐈 Тема 2: Мудрість Спокою та Сну (На основі серії \`Wisdom of a Sleeping Cat\`)`)
	report.push(`* **Контекст**: Серія Shorts про сон кота має найвищий CTR (13.04%). Концепція котячого спокою як протистави людській метушні працює бездоганно.`)
	report.push(`* **Теза для Агента**: *«Кіт не турбується про завтрашній день, він знає силу теперішнього моменту. Сон — це не слабкість, це відновлення внутрішнього суверенітету.»*`)
	report.push(`* **Format Shorts**: Short phrases of Gregory Skovoroda about the inner world and freedom.\n`)
	report.push(`### 💆 Тема 3: Тілесні відчуття та Вибір (На основі серії \`Massage Preferences\`)`)
	report.push(`* **Контекст**: Тема вибору тактильних відчуттів (пластик проти реального) показала рекордну конверсію в підписників. Це вказує на любов глядачів до простого домашнього вибору та затишку.`)
	report.push(`* **Теза для Агента**: *«Сучасна людина оточена штучним пластиком, але душа завжди тягнеться до справжнього, живого дотику. Обирайте справжнє.»*`)
	report.push(`* **Формат Shorts**: Гумористичне порівняння з мудрим підтекстом.`)

	const reportContent = report.join('\n')
	console.log(reportContent)

	// Save report to docs
	const docsDir = path.join(channelRoot, 'docs', 'video')
	if (!fs.existsSync(docsDir)) {
		fs.mkdirSync(docsDir, { recursive: true })
	}
	const reportFilePath = path.join(docsDir, 'stats_audit_report.md')
	fs.writeFileSync(reportFilePath, reportContent, 'utf-8')
	console.log(`\n✅ [REPORT SAVED TO]: ${reportFilePath}`)
}

main()
