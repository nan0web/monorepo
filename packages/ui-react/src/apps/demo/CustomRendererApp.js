import { AppCore } from '@nan0web/core'
/** @typedef {import('@nan0web/db/types').DB} DBTypes */

/**
 * UI-Agnostic Custom Renderer App: run() повертає дані без JSX.
 * Замість JSX у Renderer, повертаємо специфікацію для динамічного рендерингу:
 * - requiresInput: схема для форми (якщо потрібно)
 * - compute: функція для обчислень на основі input
 * - content: базовий статичний контент (fallback або частина UI)
 *
 * @example
 * result = await app.run() // { content: [...], requiresInput: {fields}, compute: fn }
 * Renderer використовує type для динамічного JSX.
 */
export default class CustomRendererApp extends AppCore {
	/**
	 * @param {Object} input
	 * @param {import('@nan0web/db-browser').default} input.db
	 * @param {string} [input.title='Demo']
	 * @param {string} [input.uri='index.html']
	 * @param {string} [input.locale='en']
	 */
	constructor(input) {
		const { db, ...rest } = input
		const safeDb = db && typeof db.fetch === 'function' ? db : undefined
		super({ ...rest, db: safeDb })
		if (db) this.db = db
		const { title = 'Demo', uri = 'index.html' } = input
		this.title = title
		this.uri = uri
	}

	/**
	 * @override
	 * @returns {Promise<Object>} — { type: 'interactive', content: базовий, requiresInput: схема, compute: fn }
	 */
	async run() {
		const baseContent = {
			content: [
				{
					Typography: [`Custom Interactive App: ${this.title}`],
					$variant: 'h3',
					$className: 'text-lg font-medium mb-2',
				},
				{
					p: [`URI: ${this.uri}. Обчислення потребує input (клік counter).`],
					$className: 'mb-4',
				},
			],
		}

		const requiresInput = {
			fields: [
				{
					name: 'count',
					type: 'number',
					label: 'Initial Count',
					defaultValue: 0,
					min: 0,
				},
			],
			onSubmit: 'action:computeCustom',
		}

		const compute = (inputData) => {
			const { count = 0 } = inputData || {}
			const result = count * 2
			return {
				$title: `Result: ${result}`,
				message: `Computed from ${count} → ${result}`,
				updatedContent: [
					{
						p: [`Dynamic Result: ${result}`],
						$className: 'text-green-600 font-bold',
					},
				],
			}
		}

		return {
			type: 'interactive',
			...baseContent,
			requiresInput,
			compute,
		}
	}

	static from(input) {
		if (input instanceof CustomRendererApp) return input
		return new CustomRendererApp(input)
	}
}
