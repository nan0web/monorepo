import { exec } from 'node:child_process'
import readline from 'node:readline'
import { Engine } from '../src/index.js'
import { select } from '@nan0web/ui-cli'
import Logger from '@nan0web/log'

function speak(text, voice) {
	console.log('🗣️ ', text)
	if (process.platform === 'darwin') {
		// Remove quotes that might break bash command
		const cleanText = text.replace(/"/g, '').replace(/'/g, '')
		exec(`say -v ${voice} "${cleanText}"`)
	}
}

async function run() {
	console.log('🎙️ Booting Voice OS Engine...')

	const engine = new Engine()
	await engine.boot()

	// 1. Language Setup
	const langsDoc = await engine.dataDb.fetch('_/langs').catch(() => [])
	const langs = langsDoc.length
		? langsDoc
		: [
				{ locale: 'en', title: 'English', flag: '🇬🇧' },
				{ locale: 'uk', title: 'Ukrainian', flag: '🇺🇦' },
			]

	// 2. Translations Loader
	const tCache = {}
	const loadTranslations = async (locale) => {
		const uri = locale === 'en' ? '_/t' : `${locale}/_/t`
		try {
			const res = await engine.dataDb.fetch(uri)
			return res || {}
		} catch (e) {
			return {}
		}
	}

	// Headless override completely skips interactive
	const argDemo = process.argv.find((a) => a.startsWith('--demo='))
	if (argDemo || process.env.PLAY_VOICE_HEADLESS) {
		console.log('Snapshot mode (headless) active. Skipping interactive UI.')
		return
	}

	const log = new Logger({ level: 'info', icons: true, chromo: true })

	// Ask for Voice language if not explicitly provided
	const options = langs.map((l) => `${l.flag || ''} ${l.title}`.trim())
	const choice = await select({ title: 'Select Voice Interface Language:', options, console: log })
	const selectedLocale = langs[choice.index].locale

	const translations = await loadTranslations(selectedLocale)
	const t = (key) => translations[key] || key

	// Voice map
	const defaultVoiceGroup = {
		en: 'Samantha',
		uk: 'Lesya',
	}
	let currentVoice = process.env.PLAY_VOICE_NAME || defaultVoiceGroup[selectedLocale] || 'Samantha'

	console.log('\n======================================================')
	console.log(` 🎙️ Voice UI Active. Locale: [${selectedLocale}]. Current Voice: "${currentVoice}"`)
	console.log('------------------------------------------------------')
	if (selectedLocale === 'uk') {
		console.log(' ℹ️ Tip for Ukrainian (uk) Locale:')
		console.log('   The default macOS "Lesya" can sound robotic.')
		console.log('   For a real, high-quality voice, open macOS System:')
		console.log('   Settings > Accessibility > Spoken Content')
		console.log('   and download "Lesya (Enhanced)" (137 MB).')
	}
	console.log(` ⚙️ Change voice via env: PLAY_VOICE_NAME="Alex" pnpm run play:voice`)
	console.log('======================================================\n')

	const welcomeMsg = t('Welcome to {name}. What would you like to know?').replace(
		'{name}',
		engine.config.name || '0HCnAI Framework',
	)
	speak(welcomeMsg, currentVoice)

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	const askVoice = () => {
		rl.question(`\n🎤 (${t('Type your "voice" query or "exit"')}): `, async (query) => {
			if (query.toLowerCase() === 'exit' || query.toLowerCase() === t('exit')) {
				speak(t('Goodbye, Sovereign Master.'), currentVoice)
				rl.close()
				process.exit(0)
			}

			// Simulating Voice DB Search
			const docs = await engine.getDocumentation()
			const keys = Object.keys(docs)
			const foundKey = keys.find(
				(k) =>
					query.toLowerCase().includes(k.toLowerCase()) ||
					k.toLowerCase().includes(query.toLowerCase()),
			)

			if (foundKey) {
				const brief = docs[foundKey].substring(0, 150).replace(/\n/g, ' ') + '...'
				const msg = t('I found a document matching {doc}. Here is the summary: {brief}')
					.replace('{doc}', foundKey)
					.replace('{brief}', brief)
				speak(msg, currentVoice)
			} else {
				speak(
					t('I searched our content database, but could not find a match. How else can I assist?'),
					currentVoice,
				)
			}

			setTimeout(askVoice, 500)
		})
	}

	setTimeout(askVoice, 1000)
}

run().catch(console.error)
