#!/usr/bin/env node

import { Contact, Language } from '../src/index.js'
import { pressAnyKey } from './simple-demos.js'

export async function runLanguageDemo(console) {
	console.clear()
	console.success('Language Demo')

	// Create language instances
	const languages = [
		new Language({ code: 'en', name: 'English', locale: 'en-US', icon: '🇬🇧' }),
		new Language({ code: 'es', name: 'Español', locale: 'es-ES', icon: '🇪🇸' }),
		new Language({ code: 'fr', name: 'Français', locale: 'fr-FR', icon: '🇫🇷' }),
		new Language({ code: 'de', name: 'Deutsch', locale: 'de-DE', icon: '🇩🇪' }),
		new Language({ code: 'ja', name: '日本語', locale: 'ja-JP', icon: '🇯🇵' }),
		new Language({ code: 'zh', name: '中文', locale: 'zh-CN', icon: '🇨🇳' }),
		new Language({ code: 'uk', name: 'Українська', locale: 'uk-UA', icon: '🇺🇦' }),
	]

	// Display languages as a table
	console.info('Supported languages:')
	const tableData = languages.map((lang) => [lang.icon, lang.name, lang.code, lang.locale])
	const tableHeaders = ['Icon', 'Name', 'Code', 'Locale']
	const tableConfig = {
		padding: 3,
		aligns: ['center', 'left', 'center', 'center'],
	}

	const tableRows = console.table(tableData, tableHeaders, tableConfig)
	for (const row of tableRows) {
		console.info(row)
	}

	await pressAnyKey(console)

	// Auto-detection example
	console.info('\nAuto-detection from strings:')
	const inputs = [
		'test@example.com',
		'+380123456789',
		'https://nan0web.org',
		'123 Main Street, Universe',
	]

	for (const input of inputs) {
		const contact = Contact.parse(input)
		console.info(`${input} → ${contact.type} ${contact.value}`)
		await pressAnyKey(console)
	}

	console.success('\nLanguage demo complete! 🌍')
}
