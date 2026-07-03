import { ModelAsApp, result, show } from '@nan0web/ui'
import { ChatSessionModel } from '../../app/ChatSessionModel.js'

/**
 * Ensures that the value is parsed into a clean array of strings.
 * Handles YAML frontmatter stringified array fallbacks like "[a, b]".
 * @param {any} val
 * @returns {string[]}
 */
function ensureArray(val) {
	if (Array.isArray(val)) return val
	if (typeof val === 'string') {
		const cleaned = val.replace(/^\[|\]$/g, '').trim()
		if (!cleaned) return []
		return cleaned.split(',').map((x) => x.trim()).filter(Boolean)
	}
	return []
}

export class AppPipelineModel extends ModelAsApp {
	static alias = 'app'

	static UI = {
		title: '🚀 Running App Pipeline',
	}

	static task = {
		help: 'Task description',
		default: '',
	}

	static autoVerify = {
		help: 'Auto verify',
		type: 'boolean',
		default: true,
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.task
		/** @type {boolean} */ this.autoVerify
		/** @type {string[]} */ this._positionals = data.positionals || data._positionals || []
	}

	/**
	 * @param {string} phase
	 * @param {any} db
	 */
	async loadPhaseConfig(phase, db) {
		try {
			const config = await db.loadDocument('@data/uk/pipelines/app')
			if (config?.phases?.[phase]) {
				return {
					workflows: ensureArray(config.phases[phase].workflows),
					inspectors: ensureArray(config.phases[phase].inspectors),
					instructions: config.phases[phase].instructions || ''
				}
			}
		} catch (e) {}
		return { workflows: [], inspectors: ['phase'], instructions: '' }
	}

	async *run() {
		const fsMod = await import('node:fs')
		const fsPromises = await import('node:fs/promises')
		const pathMod = await import('node:path')
		const cwd = process.cwd()

		// 1. Detect language preference from langs.nan0 or directory structure
		let detectedLang = 'en'
		const langsPath = fsMod.existsSync(pathMod.join(cwd, 'data/_/langs.nan0'))
			? pathMod.join(cwd, 'data/_/langs.nan0')
			: pathMod.join(cwd, 'data/_/langs.yaml')
		if (fsMod.existsSync(langsPath)) {
			try {
				const content = fsMod.readFileSync(langsPath, 'utf8').trim()
				if (content.includes(':') || content.startsWith('{') || content.startsWith('[')) {
					const YAML = (await import('yaml')).default
					const parsed = YAML.parse(content)
					if (Array.isArray(parsed)) {
						detectedLang = parsed[0]?.locale || parsed[0]?.code || parsed[0] || 'en'
					} else if (parsed && typeof parsed === 'object') {
						const list = parsed.languages || parsed.locales || Object.keys(parsed)
						if (Array.isArray(list)) {
							detectedLang = list[0]?.locale || list[0]?.code || list[0] || 'en'
						} else if (typeof list === 'string') {
							detectedLang = list.split(/[\s,]+/)[0] || 'en'
						}
					}
				} else {
					const parts = content.split(/[\s,]+/).filter(Boolean)
					if (parts.length > 0) {
						detectedLang = parts[0]
					}
				}
			} catch (e) {}
		} else if (fsMod.existsSync(pathMod.join(cwd, 'data/uk'))) {
			detectedLang = 'uk'
		}

		let lastSavedFiles = []
		let totalIterations = 0
		const maxIterations = 9 // Safe guard against infinite cycles

		while (totalIterations < maxIterations) {
			totalIterations++

			// 2. Detect current project phase
			const currentPhase = await this.detectCurrentPhase(cwd, fsMod, fsPromises, pathMod)
			const phaseConfig = await this.loadPhaseConfig(currentPhase, this._.db)

			// Option 1: Load dynamic frontmatter from the registered workflows
			try {
				const chatModel = new ChatSessionModel({}, this._)
				const registry = await chatModel.getPlatformRegistry()
				for (const wfName of phaseConfig.workflows) {
					const absPath = registry?.workflows?.[wfName]
					if (absPath && fsMod.existsSync(absPath)) {
						const content = fsMod.readFileSync(absPath, 'utf8')
						if (content.startsWith('---')) {
							const endIdx = content.indexOf('---', 3)
							if (endIdx !== -1) {
								const yamlPart = content.substring(3, endIdx).trim()
								const YAML = (await import('yaml')).default
								const meta = YAML.parse(yamlPart)
								if (meta && typeof meta === 'object') {
									// Dynamic override instructions and inspectors/workflows
									if (meta.instructions) {
										const localizedInstr = meta.instructions[detectedLang] || meta.instructions.en || meta.instructions
										if (typeof localizedInstr === 'string') {
											phaseConfig.instructions = localizedInstr
										}
									}
									if (meta.workflows) {
										phaseConfig.workflows = ensureArray(meta.workflows)
									}
									if (meta.inspectors) {
										phaseConfig.inspectors = ensureArray(meta.inspectors)
									}
								}
							}
						}
					}
				}
			} catch (e) {
				// Fail silently, fallback to hardcoded configs
			}

			// 3. Prepare chat inputs and options override
			const positionals = [...(this._positionals || [])]
			try {
				const filesInCwd = fsMod.readdirSync(cwd)
				for (const f of filesInCwd) {
					const lowerF = f.toLowerCase()
					if (
						(f.endsWith('.md') || f.endsWith('.yaml') || f.endsWith('.yml')) &&
						(lowerF.includes('project') ||
							lowerF.includes('plan') ||
							lowerF.includes('release') ||
							lowerF.includes('task') ||
							lowerF.includes('seed') ||
							lowerF.includes('roadmap') ||
							lowerF.includes('next') ||
							lowerF.includes('specs') ||
							lowerF.includes('spec.'))
					) {
						const fullPath = pathMod.join(cwd, f)
						if (!positionals.includes(fullPath) && !positionals.includes(f)) {
							positionals.push(fullPath)
						}
					}
				}
			} catch (err) {}

			const chatData = {
				input: `${this.task || ''}\n\n[PHASE INSTRUCTIONS]\nYou are currently in Phase: ${currentPhase.toUpperCase()}.\n${phaseConfig.instructions}`,
				_positionals: positionals
			}

			const chatOpts = {
				...this._,
				autoVerify: this.autoVerify,
				pipelinePhase: currentPhase,
				pipelineWorkflows: phaseConfig.workflows
			}

			// 4. Run model
			const chatModel = new ChatSessionModel(chatData, chatOpts)
			const lastVal = yield* chatModel.run()

			const lastValRaw = lastVal?.data || lastVal
			const savedFiles = lastValRaw?.savedFiles || []
			const ok = lastValRaw?.status === 'ok' || lastValRaw?.ok === true || lastValRaw?.success === true

			if (!ok) {
				return result({
					ok: false,
					phase: currentPhase,
					savedFiles: lastSavedFiles
				})
			}

			lastSavedFiles = [...lastSavedFiles, ...savedFiles]

			// 5. Post-Phase Inspector Execution
			let inspectorsPassed = true
			if (this.autoVerify !== false) {
				const phaseInspectors = phaseConfig.inspectors || []
				for (const auditorName of phaseInspectors) {
					try {
						const InspectorApp = (await import('@nan0web/inspect/ui/cli')).default
						const inspector = new InspectorApp(
							// @ts-ignore
							{ command: auditorName, dir: cwd },
							chatOpts
						)
						const res = yield* inspector.run()
						const d = res.data || res
						if (d.ok !== true && d.success !== true) {
							inspectorsPassed = false
						}
					} catch (/** @type {any} */ e) {
						yield show(`Failed to run auditor "${auditorName}": ${e.message}`, 'error')
						inspectorsPassed = false
					}
				}
			}

			if (!inspectorsPassed) {
				return result({
					ok: false,
					phase: currentPhase,
					savedFiles: lastSavedFiles
				})
			}

			if (currentPhase === '9-qa') {
				break
			}

			// Check if phase progressed after saved changes
			const nextPhase = await this.detectCurrentPhase(cwd, fsMod, fsPromises, pathMod)
			if (nextPhase === currentPhase) {
				break
			}
		}

		return result({
			ok: true,
			savedFiles: lastSavedFiles
		})
	}

	/**
	 * @param {string} cwd
	 * @param {any} fsMod
	 * @param {any} fsPromises
	 * @param {any} pathMod
	 */
	async detectCurrentPhase(cwd, fsMod, fsPromises, pathMod) {
		const hasDescription =
			fsMod.existsSync(pathMod.join(cwd, 'project.md')) ||
			fsMod.existsSync(pathMod.join(cwd, 'project.yaml')) ||
			fsMod.existsSync(pathMod.join(cwd, 'data/uk/project.md')) ||
			fsMod.existsSync(pathMod.join(cwd, 'data/en/project.md')) ||
			fsMod.existsSync(pathMod.join(cwd, 'releases/1/0/v1.0.0/release.md'))

		if (!hasDescription) return '1-seed'

		const domainDir = pathMod.join(cwd, 'src/domain')
		let hasModel = false
		let hasTests = false
		if (fsMod.existsSync(domainDir)) {
			try {
				const domainFiles = await fsPromises.readdir(domainDir)
				hasModel = domainFiles.some(f => f.endsWith('.js') && !f.endsWith('.test.js') && !f.endsWith('.spec.js'))
				hasTests = domainFiles.some(f => f.endsWith('.test.js') || f.endsWith('.spec.js'))
			} catch (e) {}
		}

		if (!hasModel) return '2-model'
		if (!hasTests) return '3-contract'

		const hasAdapter = fsMod.existsSync(pathMod.join(cwd, 'src/ui/adapter')) ||
			fsMod.existsSync(pathMod.join(cwd, 'src/domain/ui')) ||
			(fsMod.existsSync(pathMod.join(cwd, 'src/ui')) && fsMod.readdirSync(pathMod.join(cwd, 'src/ui')).some(f => f.toLowerCase().includes('adapter')))

		if (!hasAdapter) return '4-adapter'

		const hasCli = fsMod.existsSync(pathMod.join(cwd, 'src/ui/cli')) ||
			fsMod.existsSync(pathMod.join(cwd, 'src/ui/cli/index.js')) ||
			fsMod.existsSync(pathMod.join(cwd, 'bin/index.js'))

		if (!hasCli) return '5-ui-cli'

		const hasChat = fsMod.existsSync(pathMod.join(cwd, 'src/ui/chat')) ||
			fsMod.existsSync(pathMod.join(cwd, 'src/ui/chat/index.js'))

		if (!hasChat) return '6-ui-chat'

		const hasWeb = fsMod.existsSync(pathMod.join(cwd, 'src/ui/web')) ||
			fsMod.existsSync(pathMod.join(cwd, 'index.html')) ||
			fsMod.existsSync(pathMod.join(cwd, 'web/index.html'))

		if (!hasWeb) return '7-ui-web'

		const hasMobile = fsMod.existsSync(pathMod.join(cwd, 'src/ui/mobile')) ||
			fsMod.existsSync(pathMod.join(cwd, 'src/ui/mobile/index.js'))

		if (!hasMobile) return '8-ui-mobile'

		return '9-qa'
	}
}
