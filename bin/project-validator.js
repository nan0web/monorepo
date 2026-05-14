#!/usr/bin/env node

/**
 * Project Architecture Validator & Extractor (Project-as-Data)
 * 
 * 1. Validates project.md against the Universal Template.
 * 2. Extracts structured data (Phases, Tasks, Progress, Content blocks).
 * 3. Saves the structure to project.yaml.
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import Logger from '@nan0web/log'
import { ProjectModel } from '@nan0web/types'

const logger = new Logger()

function parseYamlValue(val) {
	if (!val) return ''
	const clean = val.trim()
	if (clean.startsWith('[') && clean.endsWith(']')) {
		return clean
			.slice(1, -1)
			.split(',')
			.map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
			.filter(Boolean)
	}
	if (clean === 'true') return true
	if (clean === 'false') return false
	return clean.replace(/^['"]|['"]$/g, '')
}

function parseProjectMarkdown(fileContent) {
	const errors = []
	const lines = fileContent.split('\n')

	let isYaml = false
	let yamlLines = []

	const metadata = {}
	const sections = []
	let currentSection = null
	let currentTask = null
	let stats = { totalTasks: 0, completedTasks: 0, progress: 0 }

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		const tline = line.trim()
		const lineNum = i + 1

		// 1. YAML Frontmatter
		if (i === 0 && tline === '---') {
			isYaml = true
			continue
		}
		if (isYaml) {
			if (tline === '---') {
				isYaml = false
				for (let j = 0; j < yamlLines.length; j++) {
					const yline = yamlLines[j].content
					if (!yline.trim() || yline.trim().startsWith('#')) continue

					// Handled in parent nested object
					if (yline.match(/^\s+[a-zA-Z0-9_]+:/)) continue

					const match = yline.match(/^([a-zA-Z0-9_]+):(.*)/)
					if (match) {
						const key = match[1]
						let val = match[2].trim()
						if (!val) {
							let obj = {}
							let k = j + 1
							while (k < yamlLines.length && yamlLines[k].content.match(/^\s+[a-zA-Z0-9_]+:/)) {
								let subMatch = yamlLines[k].content.trim().match(/^([a-zA-Z0-9_]+):(.*)/)
								if (subMatch) {
									obj[subMatch[1]] = parseYamlValue(subMatch[2])
								}
								k++
							}
							metadata[key] = obj
							j = k - 1 // skip nested items
						} else {
							metadata[key] = parseYamlValue(val)
						}
					} else {
						errors.push({ line: yamlLines[j].line, message: `Invalid YAML property: ${yline}` })
					}
				}
				continue
			}
			yamlLines.push({ content: line, line: lineNum })
			continue
		}

		// Document body
		if (!tline) continue // Skip empty lines

		// Ignore H1 and blockquotes indicator but extract text
		if (tline.startsWith('# ')) continue

		// 2. Sections (H2)
		if (tline.startsWith('## ')) {
			currentSection = {
				title: tline.slice(3).trim(),
				content: [], // text blocks
				tasks: [],
			}
			sections.push(currentSection)
			currentTask = null
			continue
		}

		// 3. Tasks (H3)
		if (tline.startsWith('### ')) {
			if (!currentSection) {
				currentSection = { title: 'General', content: [], tasks: [] }
				sections.push(currentSection)
			}
			currentTask = {
				title: tline.slice(4).trim(),
				content: [],
				items: [],
				total: 0,
				completed: 0,
			}
			currentSection.tasks.push(currentTask)
			continue
		}

		// 4. Progress Items
		if (tline.match(/^[\-\*]\s+\[[ xX]\]/)) {
			const completed = tline.includes('[x]') || tline.includes('[X]')
			let text = tline.replace(/.*\[[ xX]\]/, '').trim()

			stats.totalTasks++
			if (completed) stats.completedTasks++

			// Proof of status: Extract URLs/Links
			const links = []
			const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
			let match
			while ((match = linkRegex.exec(text)) !== null) {
				links.push({ label: match[1], url: match[2] })
			}

			// Clean the text from being a raw markdown link if needed, but keeping text is fine
			const itemData = { text, completed, links }

			if (currentTask) {
				currentTask.total++
				if (completed) currentTask.completed++
				currentTask.items.push(itemData)
			} else {
				if (!currentSection) {
					currentSection = { title: 'General', content: [], tasks: [] }
					sections.push(currentSection)
				}
				if (currentSection.tasks.length === 0 || currentSection.tasks[0].title !== 'General') {
					currentSection.tasks.unshift({
						title: 'General',
						content: [],
						items: [],
						total: 0,
						completed: 0,
					})
				}
				const genTask = currentSection.tasks[0]
				genTask.total++
				if (completed) genTask.completed++
				genTask.items.push(itemData)
			}
			continue
		}

		// 5. Content Paragraphs
		// Remove blockquote prefix if exists, treat as normal text paragraph
		let paragraph = tline.startsWith('> ') ? tline.slice(2).trim() : tline
		if (currentTask) {
			currentTask.content.push(paragraph)
		} else if (currentSection) {
			currentSection.content.push(paragraph)
		}
	}

	if (stats.totalTasks > 0) {
		stats.progress = Math.round((stats.completedTasks / stats.totalTasks) * 100)
	}

	const model = new ProjectModel({ metadata, sections, stats })

	// Validations mapping to Sages rules
	if (!model.description)
		errors.push({ line: 1, message: 'Missing "description" in YAML frontmatter.' })
	if (!model.tags || model.tags.length === 0)
		errors.push({ line: 1, message: 'Missing "tags" array in YAML frontmatter.' })
	if (!model.locale) errors.push({ line: 1, message: 'Missing "locale" in YAML frontmatter.' })

	const hasSection = (str) => model.sections.some((s) => s.title.includes(str))

	const phases = [
		['Фаза 1:', 'Філософія та Абстракція / The Seed'],
		['Фаза 2:', 'Доменне Моделювання / Data-Driven Models'],
		['Фаза 3:', 'Верифікація Логіки / CLI-First'],
		['Фаза 4:', 'Sovereign Workbench / The Master IDE'],
		['Фаза 5:', 'Тематизація та Інтерфейси / Theming'],
		['Фаза 6:', 'Якість та Дистрибуція / Quality & Distribution'],
		['Фаза 7:', 'Цінність та Економіка / Value & Economy'],
		['Фаза 8:', 'Децентралізація та Суверенітет / Sovereignty'],
		['Фаза 9:', 'Місія та Вплив / World Impact'],
	]
	for (const [key, label] of phases) {
		if (!hasSection(key))
			errors.push({ line: 0, message: `Missing Phase ${key.slice(-2, -1)} (${label})` })
	}
	if (!hasSection('Чек-лист готовності') && !hasSection('Definition of Done')) {
		errors.push({ line: 0, message: 'Missing Definition of Done (DoD) Section' })
	}

	return { model, errors }
}

function projectToYAML(model) {
	let yaml = '---\n'
	yaml += 'metadata:\n'
	yaml += `  description: "${model.description.replace(/"/g, '\\"')}"\n`
	yaml += `  tags: [${model.tags.join(', ')}]\n`
	yaml += `  status: ${model.status}\n`
	yaml += `  locale: ${model.locale}\n`
	if (Object.keys(model.i18n).length > 0) {
		yaml += `  i18n:\n`
		for (const [k, v] of Object.entries(model.i18n)) {
			yaml += `    ${k}: ${v}\n`
		}
	}
	yaml += 'sections:\n'
	for (const s of model.sections) {
		yaml += `  - title: "${s.title.replace(/"/g, '\\"')}"\n`
		if (s.content && s.content.length > 0) {
			yaml += `    content:\n`
			for (const c of s.content) {
				yaml += `      - "${c.replace(/"/g, '\\"')}"\n`
			}
		} else {
			yaml += `    content: []\n`
		}
		if (s.tasks && s.tasks.length > 0) {
			yaml += `    tasks:\n`
			for (const t of s.tasks) {
				yaml += `      - title: "${t.title.replace(/"/g, '\\"')}"\n`
				if (t.content && t.content.length > 0) {
					yaml += `        content:\n`
					for (const c of t.content) {
						yaml += `          - "${c.replace(/"/g, '\\"')}"\n`
					}
				} else {
					yaml += `        content: []\n`
				}
				if (t.items && t.items.length > 0) {
					yaml += `        items:\n`
					for (const item of t.items) {
						yaml += `          - text: "${item.text.replace(/"/g, '\\"')}"\n`
						yaml += `            completed: ${item.completed}\n`
						if (item.links && item.links.length > 0) {
							yaml += `            links:\n`
							for (const link of item.links) {
								yaml += `              - label: "${link.label.replace(/"/g, '\\"')}"\n`
								yaml += `                url: "${link.url}"\n`
							}
						}
					}
				} else {
					yaml += `        items: []\n`
				}
				yaml += `        total: ${t.total}\n`
				yaml += `        completed: ${t.completed}\n`
			}
		} else {
			yaml += `    tasks: []\n`
		}
	}
	yaml += `stats:\n`
	yaml += `  totalTasks: ${model.stats.totalTasks}\n`
	yaml += `  completedTasks: ${model.stats.completedTasks}\n`
	yaml += `  progress: ${model.stats.progress}\n`
	return yaml
}

async function processProject(filePath) {
	try {
		const fileContent = await readFile(filePath, 'utf-8')
		const { model, errors } = parseProjectMarkdown(fileContent)

		const yamlOutput = projectToYAML(model)
		const yamlPath = path.join(path.dirname(filePath), 'project.yaml')
		await writeFile(yamlPath, yamlOutput)

		return { errors, data: model, yamlPath }
	} catch (e) {
		throw new Error(`Critical failure processing ${filePath}: ${e.message}`)
	}
}

// CLI Mode
if (process.argv[1] === path.resolve(process.argv[1])) {
	const filePath = process.argv[2]
	if (!filePath) {
		console.error('Usage: node bin/project-validator.js <path-to-project.md>')
		process.exit(1)
	}

	processProject(path.resolve(filePath)).then(res => {
		if (res.errors.length === 0) {
			logger.success(`VALID: ${path.basename(filePath)} adheres to architecture standards.`)
			logger.info(`  📄 Data exported to: ${res.yamlPath} (${res.data.stats.progress}% complete)`)
			process.exit(0)
		} else {
			logger.error(`INVALID: ${path.basename(filePath)} has errors:`)
			res.errors.forEach(err => {
				const prefix = err.line ? `[L${err.line}] ` : '';
				logger.info(`  - ${prefix}${err.message}`);
			})
			logger.warn(`  ⚠️ project.yaml was still generated with current state for debugging.`)
			process.exit(1)
		}
	}).catch(e => {
		logger.error(e.message)
		process.exit(1)
	})
}
