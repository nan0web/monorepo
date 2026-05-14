import { AI } from '@nan0web/ai'
import { Model } from '@nan0web/types'
import { searchWeb, readWebPage } from '../utils/webTools.js'

/**
 * Web Shopper Model - Autonomous B2B Agent to aggregate prices
 *
 * @property {string} query What needs to be bought (e.g. "шредер для гілок та електропила")
 * @property {boolean} quiet Quiet mode
 */
export class WebShopperModel extends Model {
	/**
	 * @param {Partial<WebShopperModel> | Record<string, any>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
	 */
	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, options)
		/** @type {any} Shopping query describing what to buy */ this.query
		/** @type {boolean} Quiet mode */ this.quiet
	}

	static query = {
		help: 'What needs to be bought (e.g. "шредер для гілок та електропила")',
		default: '',
		positional: true,
	}

	static quiet = {
		help: 'Quiet mode',
		default: false,
		type: 'boolean',
		alias: 'q',
	}

	static UI = {
		errorMissingQuery: 'Missing shopping query.',
		errorModelsFailed: 'All AI models failed to respond.',
		errorLoopLimit: 'Agent loop limit reached.',
		progressAnalysis: 'Analyzing shopping request: "{$query}"...',
		progressThinking: 'Analyzing data and planning actions (Step {$step}/15)...',
		progressSearching: 'Searching: {$query}...',
		progressReading: 'Reading: {$url}...',
		warnHallucination: 'AI attempted to fabricate prices. Forcing real search...',
	}

	async *run() {
		const { t = (/** @type {any} */ v) => v } = /** @type {any} */ (this._)
		if (!this.query) {
			yield { type: 'log', level: 'error', message: t(WebShopperModel.UI.errorMissingQuery) }
			return { success: false }
		}

		yield {
			type: 'progress',
			message: t(WebShopperModel.UI.progressAnalysis, { $query: this.query }),
		}

		const ai = /** @type {any} */ (this._)?.ai || new AI({ strategy: new AI.Strategy({ level: 'smart' }) })
		await ai.refreshModels()

		const systemPrompt = `Ти автономний B2B-закупівельник. Твоє завдання - дослідити інтернет, знайти товари на українських маркетплейсах і повернути порівняльну таблицю.
Запит: "${this.query}".

КРОК 1: ДЕКОМПОЗИЦІЯ ТА ПОШУК (ОБОВ'ЯЗКОВО!)
КАТЕГОРИЧНО ЗАБОРОНЕНО передавати весь запит користувача як один рядок пошуку! Ти ПОВИНЕН розбити запит на окремі товари і регіон (якщо вказаний).
!!! ЗАБОРОНЕНО ЗУПИНЯТИСЯ ПІСЛЯ ОДНОГО ПОШУКУ, ЯКЩО В ЗАПИТІ Є КІЛЬКА ТОВАРІВ !!!
Якщо користувач просить "шредер ТА електропила у Львові", ти РОБИШ ДВІ ОКРЕМІ ІТЕРАЦІЇ ПОШУКУ:
1. Спочатку відправ: {"tool": "SEARCH_WEB", "query": "шредер для гілок Львів"}
2. Дочекайся результатів, проаналізуй (прочитай через READ_PAGE якщо треба).
3. Потім ОБОВ'ЯЗКОВО відправ ДРУГИЙ пошук: {"tool": "SEARCH_WEB", "query": "електропила акумуляторна Львів"}
4. Дочекайся результатів. І ТІЛЬКИ КОЛИ ТИ ЗНАЙШОВ ВСІ ТОВАРИ — переходь до фіналу.

КРОК 2: ЗБІР ІНФОРМАЦІЇ НА ДОДАТКОВІ ІНСТРУМЕНТИ
Формула скорингу:
- Базовий Score = загальна сума (в грн).
- Якщо ВСІ товари можна купити в ОДНОМУ ТА ТОМУ Ж магазині (наприклад, все є на Rozetka або Epicentr), застосуй коефіцієнт: 0.9 (Score = Сума * 0.9).
- Якщо роздільно, коефіцієнт = 1.0 (Score = Сума).

Ти маєш 2 інструменти:
1. SEARCH_WEB (повертає результати Google/Yahoo).
2. READ_PAGE (читає текст вказаного сайту).

Щоб викликати інструмент, напиши ТОЧНО такий JSON на окремому рядку і БІЛЬШЕ НІЧОГО:
{"tool": "SEARCH_WEB", "query": "твій запит"}
або
{"tool": "READ_PAGE", "url": "https://..."}

УВАГА ЩОДО МАРКЕТПЛЕЙСІВ (Prom, Rozetka, Epicentr, OLX, тощо):
В результатахSEARCH_WEB ти побачиш посилання на сторінки загальних категорій. Сніпетах часто пише "у наявності 3000 товарів", "ціна від 100 грн". Це НЕ конкретний товар!
Ти ПОВИНЕН використати READ_PAGE на таке посилання, щоб дістати конкретну модель товару (наприклад "Einhell GC-RS 2540") та її ТОЧНУ ціну! Якщо ти не знайшов КОНКРЕТНОЇ моделі — шукай далі.

КРОК 3: ФІНАЛЬНИЙ ЗВІТ
ДОКИ ТИ ШУКАЄШ ДАНІ - ПИШИ ТІЛЬКИ JSON І БІЛЬШЕ ЖОДНОГО СЛОВА! Ніколи не розповідай свої плани текстом.
Робіть стільки пошуків, скільки товарів у запиті.

Як тільки ти зібрав ВСІ ціни та знайшов конкретні моделі, напиши слово ФІНАЛ: і далі свій звіт та Markdown ТАБЛИЦЮ (без JSON формату).
КАТЕГОРИЧНО ЗАБОРОНЕНО писати будь-які інструкції, команди або повторювати мій промпт! Твій вивід має бути ЛИШЕ готовим результатом для людини!
ТАБЛИЦЯ МАЄ БУТИ ТАКОЮ: | Магазин(и) | Товари з цінами (конкретні моделі) | Загальна сума | Score | Посилання |
Відсортуй таблицю за найменшим Score. Покажи спочатку варіанти "Все в одному магазині".
`
		let messages = [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: 'Починай роботу. Зроби перший пошук.' },
		]
		const executedSearches = new Set()

		for (let step = 0; step < 15; step++) {
			// Збільшив ліміт до 15 кроків для складних запитів
			let text = ''
			let usedModel = null
			yield {
				type: 'progress',
				message: t(WebShopperModel.UI.progressThinking, { $step: String(step + 1) }),
			}

			try {
				const estimatedTokens = JSON.stringify(messages).length / 4
				const initialModel = ai.strategy.findModel(ai.getModelsMap(), estimatedTokens, estimatedTokens + 5000) || ai.getModels()[0]
				const res = await ai.generateText(initialModel, messages)
				text = res.text
				usedModel = res.usedModel
			} catch (err) {
				// ai.generateText handles internal fallbacks; if it throws, all valid fallbacks failed
			}

			if (!text) {
				yield { type: 'log', level: 'error', message: t(WebShopperModel.UI.errorModelsFailed) }
				return { success: false }
			}

			let toolCall = null
			try {
				const jsonMatch = text.match(/\{[\s\S]*?"tool"\s*:\s*"[^"]+"[\s\S]*?\}/)
				if (jsonMatch) toolCall = JSON.parse(jsonMatch[0])
			} catch (e) {}

			if (toolCall && toolCall.tool === 'SEARCH_WEB') {
				const queryToken = toolCall.query.trim().toLowerCase()
				if (executedSearches.has(queryToken)) {
					messages.push({ role: 'assistant', content: text })
					messages.push({
						role: 'user',
						content: `🚨 ПОМИЛКА: Ти вже робив пошук за запитом "${toolCall.query}"! Тобі КАТЕГОРИЧНО заборонено його повторювати! Використай READ_PAGE на якомусь результаті або шукай ІНШИЙ товар.`,
					})
					continue
				}
				executedSearches.add(queryToken)

				yield {
					type: 'progress',
					message: t(WebShopperModel.UI.progressSearching, { $query: toolCall.query }),
				}
				const results = await searchWeb(toolCall.query)
				const info =
					results.length > 0
						? results
								.slice(0, 50)
								.map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\n${r.url}`)
								.join('\n\n')
						: 'Нічого не знайдено.'
				messages.push({ role: 'assistant', content: text })
				messages.push({
					role: 'user',
					content: `Результат SEARCH_WEB (Топ-50):\n${info}\nЯкщо потрібно, зроби ще пошук для інших товарів, прочитай конкретну сторінку через READ_PAGE, або напиши ФІНАЛ.`,
				})
			} else if (toolCall && toolCall.tool === 'READ_PAGE') {
				yield {
					type: 'progress',
					message: t(WebShopperModel.UI.progressReading, { $url: toolCall.url }),
				}
				const content = await readWebPage(toolCall.url)
				messages.push({ role: 'assistant', content: text })
				messages.push({
					role: 'user',
					content: `Результат READ_PAGE:\n${content.substring(0, 8000)}\nПовертайся до аналізу.`,
				})
			} else if (!toolCall && step === 0) {
				// Prevent immediate hallucination on first step
				messages.push({ role: 'assistant', content: text })
				messages.push({
					role: 'user',
					content: `🚨 ПОМИЛКА: Ти порушив інструкцію і видав текст БЕЗ пошуку! У тебе немає доступу до реальних актуальних цін у пам'яті. Ти ПОВИНЕН відправити JSON-виклик SEARCH_WEB на першому кроці!`,
				})
				yield {
					type: 'log',
					level: 'warn',
					message: t(WebShopperModel.UI.warnHallucination),
				}
				continue
			} else {
				// No more tool calls, this must be the final text
				yield {
					type: 'result',
					data: text
						.replace(/\{.*"tool".*\}/g, '')
						.replace('ФІНАЛ:', '')
						.trim(),
				}
				return { success: true }
			}
		}

		yield { type: 'log', level: 'warning', message: t(WebShopperModel.UI.errorLoopLimit) }
		return { success: false }
	}
}
