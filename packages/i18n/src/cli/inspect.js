/**
 * 📡 Deterministic i18n Auditor (inspect) - Model-as-Schema v2 (MaSaA)
 *
 * 1. Scans domain/ for static help/label/UI* keys.
 * 2. Checks vocab file for existing translations.
 * 3. Scans ui/ for hardcoded t('literal') calls (disallowed).
 * 4. Scans utils/ for any t() usage (disallowed).
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { EXTRACT_FIELDS } from '../extract.js'
import { Alert, spinner } from '@nan0web/ui-cli'

const getReaders = (db, ROOT) => {
	if (db) {
		return {
			async findFiles(dir) {
				const files = []
				const relativeDir = relative(ROOT, dir) || '.'
				for await (const entry of db.findStream(relativeDir, { skipIndex: true })) {
					const path = entry.file?.path
					if (path && path.endsWith('.js')) {
						files.push(resolve(ROOT, path))
					}
				}
				return files
			},
			async readFile(file) {
				const relativePath = relative(ROOT, file)
				return db.loadDocument(relativePath)
			}
		}
	}
	return {
		async findFiles(dir) {
			const files = []
			async function traverse(currentDir) {
				try {
					const entries = await readdir(currentDir, { withFileTypes: true })
					for (const entry of entries) {
						const res = join(currentDir, entry.name)
						if (entry.isDirectory()) {
							await traverse(res)
						} else if (entry.name.endsWith('.js')) {
							files.push(res)
						}
					}
				} catch (e) {}
			}
			await traverse(dir)
			return files
		},
		async readFile(file) {
			return readFile(file, 'utf-8')
		}
	}
}

/**
 * @param {Object} args
 */
export default async function inspect(args = {}) {
	const ROOT = resolve(process.cwd())
	const DOMAIN_DIR = resolve(ROOT, args.domain || 'src/domain')
	const UI_SRC_DIR = resolve(ROOT, args.ui || 'src/ui')
	const UTILS_DIR = resolve(ROOT, 'src/utils')
	const COMPONENTS_DIR = resolve(ROOT, args.components || 'src/components')
	const VOCAB_FILE = resolve(ROOT, args.vocab || 'play/data/uk/_/t.nan0')

	const readers = getReaders(args.db, ROOT)

	const fieldPatterns = EXTRACT_FIELDS.map((f) => f.replace('*', '[a-zA-Z0-9_]*')).join('|')

	// Regex: static (help|label|UI) = '...' OR static (help|label|UI) = { ... }
	const DOMAIN_STATIC_REGEX = new RegExp(
		`static\\s+(${fieldPatterns}|[uU][iI][a-zA-Z0-9_]*)\\s*=\\s*['"\`](.*?)['"\`]`,
		'g',
	)

	// Regex: static field = { help: '...' }
	const DOMAIN_NESTED_REGEX = new RegExp(
		`\\b(${fieldPatterns}|[uU][iI][a-zA-Z0-9_]*)\\s*:\\s*['"\`](.*?)['"\`]`,
		'g',
	)

	// Regex: static UI = { key: 'value' } or static uiText = { key: 'value' }
	// Handles simple flat objects.
	const UI_BLOCK_REGEX = /static\s+[uU][iI][^=]*\s*=\s*{([\s\S]*?)}/g
	const QUOTED_STRING_REGEX = /['"\`](.*?)['"\`]/g

	// Regex: t('literal') - finds literals in t() calls
	const T_LITERAL_REGEX = /\bt\(['"\`]([^'"`\)]+)['"\`]\)/g
	// Regex: any t() call
	const ANY_T_REGEX = /\bt\(/g

	let s = spinner(`Scanning Domain: ${relative(ROOT, DOMAIN_DIR)} for i18n keys...`)

	const domainFiles = await readers.findFiles(DOMAIN_DIR)
	const domainKeys = new Set()

	for (const file of domainFiles) {
		const content = await readers.readFile(file)
		if (typeof content !== 'string') continue
		let match

		// 1. Direct static properties
		while ((match = DOMAIN_STATIC_REGEX.exec(content)) !== null) {
			domainKeys.add(match[2])
		}

		// 2. Nested properties within objects (e.g. static field = { help: '...' })
		while ((match = DOMAIN_NESTED_REGEX.exec(content)) !== null) {
			domainKeys.add(match[2])
		}

		// 3. UI/ui* block extraction
		let uiMatch
		while ((uiMatch = UI_BLOCK_REGEX.exec(content)) !== null) {
			const block = uiMatch[1]
			let strMatch
			while ((strMatch = QUOTED_STRING_REGEX.exec(block)) !== null) {
				domainKeys.add(strMatch[1])
			}
		}
	}

	s.stop()

	console.log(
		Alert({
			variant: 'info',
			title: `Found ${domainKeys.size} keys in domain models`,
			children: [...domainKeys].map((k) => ` - ${k}`).join('\n'),
		}),
	)

	s = spinner(`Validating translations in: ${relative(ROOT, VOCAB_FILE)}...`)
	let vocabContent = ''
	try {
		vocabContent = await readers.readFile(VOCAB_FILE)
		if (typeof vocabContent !== 'string') vocabContent = ''
	} catch (e) {
		s.stop()
		console.log(
			Alert({
				variant: 'warning',
				title: 'Missing vocab file',
				children: relative(ROOT, VOCAB_FILE),
			}),
		)
	}

	const missing = []
	for (const key of domainKeys) {
		// Escape key for regex to check in vocab
		const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const keyRegex = new RegExp(`(['"\`]${escaped}['"\`]|\\b${escaped})\\s*:`, 'i')
		if (!keyRegex.test(vocabContent)) {
			missing.push(key)
		}
	}

	s.stop()

	if (missing.length > 0) {
		console.log(
			Alert({
				variant: 'error',
				title: 'Missing translations for keys',
				children: missing.map((k) => ` - ${k}`).join('\n'),
			}),
		)
	} else {
		console.log(
			Alert({
				variant: 'success',
				title: 'Translations Intact',
				children: 'All domain keys translated in vocabulary.',
			}),
		)
	}

	s = spinner(`Scanning UI (${relative(ROOT, UI_SRC_DIR)}) for hardcoded t() calls...`)
	const uiFiles = await readers.findFiles(UI_SRC_DIR)
	const componentsFiles = await readers.findFiles(COMPONENTS_DIR)
	const allUiFiles = [...uiFiles, ...componentsFiles]

	let hardcodedCount = 0
	let hardcodedMessages = []
	for (const file of allUiFiles) {
		const content = await readers.readFile(file)
		if (typeof content !== 'string') continue
		let match
		while ((match = T_LITERAL_REGEX.exec(content)) !== null) {
			const key = match[1]
			hardcodedMessages.push(`t('${key}') in: ${relative(ROOT, file)}`)
			hardcodedCount++
		}
	}
	s.stop()

	s = spinner(`Scanning Utils (${relative(ROOT, UTILS_DIR)}) for t() usage (forbidden)...`)
	const utilsFiles = await readers.findFiles(UTILS_DIR)
	let utilsTCount = 0
	let utilsMessages = []
	for (const file of utilsFiles) {
		const content = await readers.readFile(file)
		if (typeof content !== 'string') continue
		if (ANY_T_REGEX.test(content)) {
			utilsMessages.push(`t() usage in utils: ${relative(ROOT, file)}`)
			utilsTCount++
		}
	}
	s.stop()

	if (hardcodedCount > 0 || utilsTCount > 0) {
		console.log(
			Alert({
				variant: 'error',
				title: `Found ${hardcodedCount + utilsTCount} architectural violations in UI/Utils.`,
				children: [...hardcodedMessages, ...utilsMessages].join('\n'),
			}),
		)
	} else {
		console.log(
			Alert({
				variant: 'success',
				title: 'Architectural Compliance',
				children: '0 Hardcoded t() or forbidden t() usage found. Compliant.',
			}),
		)
	}

	if (missing.length === 0 && hardcodedCount === 0 && utilsTCount === 0) {
		console.log(
			Alert({
				variant: 'success',
				title: 'i18n Assessment',
				children: '100% MaSaA v2 compliant.',
			}),
		)
	} else {
		if (args.throwOnError) {
			throw new Error('i18n Assessment failed')
		}
		process.exit(1)
	}
}
