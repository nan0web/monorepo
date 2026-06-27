import { ChatSessionModel } from '../../app/ChatSessionModel.js'

export class AppPipeline {
	/**
	 * @param {any} context
	 */
	constructor(context) {
		this.context = context
	}

	/**
	 * @param {string} task
	 * @param {any} options
	 * @returns {AsyncGenerator<any, { ok: boolean; phase: string; savedFiles: string[] }, any>}
	 */
	async *execute(task, options) {
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

		// 2. Detect current project phase
		const currentPhase = await this.detectCurrentPhase(cwd, fsMod, fsPromises, pathMod)
		let phaseConfig = this.getPhaseConfig(currentPhase, detectedLang)

		// Option 1: Load dynamic frontmatter from the registered workflows
		try {
			const chatModel = new ChatSessionModel({}, this.context)
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
								if (Array.isArray(meta.workflows)) {
									phaseConfig.workflows = meta.workflows
								}
								if (Array.isArray(meta.inspectors)) {
									phaseConfig.inspectors = meta.inspectors
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
		const positionals = [...(options.positionals || [])]
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
			input: `${task}\n\n[PHASE INSTRUCTIONS]\nYou are currently in Phase: ${currentPhase.toUpperCase()}.\n${phaseConfig.instructions}`,
			_positionals: positionals
		}

		const chatOpts = {
			...this.context,
			autoVerify: options.autoVerify,
			maxRetries: options.maxRetries,
			pipelinePhase: currentPhase,
			pipelineWorkflows: phaseConfig.workflows
		}

		// 4. Run model
		const chatModel = new ChatSessionModel(chatData, chatOpts)
		const lastVal = yield* chatModel.run()

		return {
			ok: lastVal?.ok ?? false,
			phase: currentPhase,
			savedFiles: lastVal?.savedFiles || []
		}
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

	/**
	 * @param {string} phase
	 * @param {string} lang
	 */
	getPhaseConfig(phase, lang) {
		const isUk = lang === 'uk'
		const configs = {
			'1-seed': {
				workflows: ['init-project', 'pipeline-no1-seed'],
				instructions: isUk 
					? `Ви перебуваєте у Фазі 1 (SEED). Ви ПОВИННІ генерувати ВИКЛЮЧНО файли: 'data/_/langs.nan0' (або 'langs.yaml'), 'releases/1/0/v1.0.0/release.md' (або 'data/uk/project.md', 'data/en/project.md') та 'package.json' (якщо він відсутній у папці проекту). НЕ пишіть жодного JavaScript-коду моделей, адаптерів чи тестів!\nУсі описи вимог, специфікації та релізи мають бути написані виключно УКРАЇНСЬКОЮ МОВОЮ.\nУВАГА: Специфікація 'releases/1/0/v1.0.0/release.md' має бути ПОВНІСТЮ заповнена (опис проекту, мета фази SEED, детальні цілі та плани на наступні кроки). НЕ залишайте порожніх секцій чи плейсхолдерів!\nУВАГА: Файл 'package.json' має бути прописаний з базовими полями (name, version, type: module), залежностями ("dependencies": {"@nan0web/db": "workspace:*", "@nan0web/types": "workspace:*", "@nan0web/ui": "workspace:*"}, "devDependencies": {"@nan0web/test": "workspace:*"}) та скриптами 'test' і 'test:all' для запуску тестувальника (наприклад, "test": "node --test --test-timeout=3333 'src/**/*.test.js'", "test:all": "npm run test").\nУВАГА: Файл конфігурації мов має містити виключно список доступних мов додатку (наприклад, YAML-список мовних об'єктів з locale/code):\n\`\`\`yaml\n- title: English\n  locale: en\n  code: en\n- title: Українська\n  locale: uk\n  code: uk\n\`\`\`\nНЕ пишіть туди словники перекладів та ключі на кшталт 'divideByZero'! Усі ключі перекладів мають бути у camelCase без крапок і реєструватися тільки у файлах 'data/{locale}/_/t.yaml' за допомогою інспектора i18n.`
					: `You are in Phase 1 (SEED). You MUST only generate: 'data/_/langs.nan0' (or 'langs.yaml'), 'releases/1/0/v1.0.0/release.md' (or data/uk/project.md / data/en/project.md) and 'package.json' (if missing in project folder). DO NOT write any JavaScript models, adapters, UIs, or tests!\nAll specifications and release files must be in English.\nWARNING: The specification 'releases/1/0/v1.0.0/release.md' must be FULLY completed (project overview, SEED phase goals, future roadmap). DO NOT leave any empty sections or placeholders!\nWARNING: The 'package.json' file must contain basic fields (name, version, type: module), dependencies ("dependencies": {"@nan0web/db": "workspace:*", "@nan0web/types": "workspace:*", "@nan0web/ui": "workspace:*"}, "devDependencies": {"@nan0web/test": "workspace:*"}) and scripts 'test' and 'test:all' to run node tests (e.g. "test": "node --test --test-timeout=3333 'src/**/*.test.js'", "test:all": "npm run test").\nWARNING: The language config file must only specify the list of available languages (e.g. YAML list of locale/code objects):\n\`\`\`yaml\n- title: English\n  locale: en\n  code: en\n- title: Українська\n  locale: uk\n  code: uk\n\`\`\`\nDO NOT write translation dictionaries or functional keys there! All translation keys must be camelCase without dots and registered only in 'data/{locale}/_/t.yaml' files via i18n inspector.`
			},
			'2-model': {
				workflows: ['pipeline-no2-model'],
				instructions: isUk
					? `Ви перебуваєте у Фазі 2 (MODEL). Ви ПОВИННІ написати виключно доменний клас моделі в директорії 'src/domain/', який розширює 'ModelAsApp' або 'Model'. НЕ пишіть тести або UI-адаптери!\nКоментарі та документація в коді JSDoc мають бути написані УКРАЇНСЬКОЮ МОВОЮ.\nУсі властивості класу мають бути в camelCase.`
					: `You are in Phase 2 (MODEL). You MUST only write the domain model class under 'src/domain/' extending 'ModelAsApp' or 'Model'. DO NOT write tests or UI adapters yet!\nComments and JSDoc documentation must be in English.\nAll class properties must be in camelCase.`
			},
			'3-contract': {
				workflows: ['pipeline-no3-contract'],
				instructions: isUk
					? `Ви перебуваєте у Фазі 3 (CONTRACT). Ви ПОВИННІ писати виключно контрактні юніт-тести (наприклад, '.test.js' або '.spec.js') для вашої доменної моделі. НЕ змінюйте доменну модель або UI, якщо це не потрібно для виправлення помилок.\nОписи тестів та повідомлення про помилки мають бути УКРАЇНСЬКОЮ МОВОЮ.`
					: `You are in Phase 3 (CONTRACT). You MUST only write unit/contract tests (e.g. '.test.js' or '.spec.js') for your domain model. DO NOT modify model logic or UI scripts unless fixing failures.\nTest descriptions and assertion messages must be in English.`
			},
			'4-adapter': {
				workflows: ['pipeline-no4-adapter'],
				instructions: isUk
					? `Ви перебуваєте у Фазі 4 (ADAPTER). Напишіть UI Адаптер, який пов'язує доменні моделі з компонентами UI. НЕ пишіть неструктуровані CLI скрипти! Якщо адаптер не є обов'язковим через використання стандартних компонентів UI, перейдіть до наступної фази.\nДокументація та JSDoc мають бути УКРАЇНСЬКОЮ МОВОЮ.`
					: `You are in Phase 4 (ADAPTER). Write the UI Adapter that connects domain models with UI views. DO NOT write flat/unstructured CLI scripts! If the adapter is not strictly required due to using standard UI components directly, proceed to the next phase.\nDocumentation and JSDocs must be in English.`
			},
			'5-ui-cli': {
				workflows: ['pipeline-no5-ui-cli'],
				instructions: isUk
					? `Ви перебуваєте у Фазі 5 (UI-CLI). Створіть консольний CLI інтерфейс для додатку в 'src/ui/cli/', використовуючи 'bootstrapApp'.\nПовідомлення та інтерфейс користувача мають бути УКРАЇНСЬКОЮ МОВОЮ.`
					: `You are in Phase 5 (UI-CLI). Build the CLI interface for the application under 'src/ui/cli/' using bootstrapApp.\nTerminal outputs and UI text must be in English.`
			},
			'6-ui-chat': {
				workflows: ['pipeline-no6-ui-chat'],
				instructions: isUk
					? `Ви перебуваєте у Фазі 6 (UI-CHAT). Створіть інтерактивний Chat-інтерфейс у 'src/ui/chat/'.\nУсі тексти повідомлень та діалогів мають бути УКРАЇНСЬКОЮ МОВОЮ.`
					: `You are in Phase 6 (UI-CHAT). Build the interactive Chat interface under 'src/ui/chat/'.\nAll dialogues and messages must be in English.`
			},
			'7-ui-web': {
				workflows: ['pipeline-no7-ui-web'],
				instructions: isUk
					? `Ви перебуваєте у Фазі 7 (UI-WEB). Створіть веб-інтерфейс у 'src/ui/web/'.\nКнопки, форми та повідомлення мають бути УКРАЇНСЬКОЮ МОВОЮ.`
					: `You are in Phase 7 (UI-WEB). Build the Web interface under 'src/ui/web/'.\nLabels, forms and messages must be in English.`
			},
			'8-ui-mobile': {
				workflows: ['pipeline-no8-ui-mobile'],
				instructions: isUk
					? `Ви перебуваєте у Фазі 8 (UI-MOBILE). Створіть мобільний інтерфейс у 'src/ui/mobile/'.\nУсі тексти мають бути УКРАЇНСЬКОЮ МОВОЮ.`
					: `You are in Phase 8 (UI-MOBILE). Build the Mobile interface under 'src/ui/mobile/'.\nAll texts must be in English.`
			},
			'9-qa': {
				workflows: ['pipeline-no9-qa'],
				instructions: isUk
					? `Ви перебуваєте у Фазі 9 (QA). Виконайте форматування коду (prettier), перевірку лінтером (eslint), аудит knip та перевірку покриття тестами.`
					: `You are in Phase 9 (QA). Run final formatting, prettier, ESLint, knip audits, and verify code coverage.`
			}
		}
		return configs[phase] || configs['1-seed']
	}
}
