/**
 * @docs
 * # ApiRouter
 *
 * Маршрутизатор, що повністю базується на доменній моделі.
 *
 * ### Особливості
 * - [x] Не потребує жодних CLI-специфічних полів
 * - [x] Працює прямо з доменною моделлю
 */
export default class ApiRouter {
	#routes = new Map()

	/**
	 * @param {import('../AuthApp.js').default} app - Додаток для обробки запитів
	 */
	constructor(app) {
		this.app = app
	}

	/**
	 * Додає маршрути на основі доменної моделі
	 * @param {Function} Message - Клас доменного повідомлення
	 */
	add(Message, basePath = '/api') {
		this.#addRoutes(Message, basePath, [])
		return this
	}

	/**
	 * Повертає об'єкт маршрутів
	 */
	get routes() {
		return Object.fromEntries(this.#routes)
	}

	/**
	 * Додає маршрути для поточної та дочірніх команд
	 */
	#addRoutes(Message, basePath, path) {
		const fullPath = `${basePath}/${[...path, Message.name].filter(Boolean).join('/')}`
		const methods = this.#getAllowedMethods(Message)

		// Додаємо обробники для всіх дозволених методів
		for (const method of methods) {
			this.#addRoute(method, fullPath, Message)
		}

		// Обробляємо дочірні команди
		if (Message.Children) {
			for (const Child of Message.Children) {
				this.#addRoutes(Child, basePath, [...path, Message.name])
			}
		}
	}

	/**
	 * Визначає дозволені HTTP методи для команди
	 */
	#getAllowedMethods(Message) {
		// За замовчуванням всі команди - POST
		const methods = ['post']

		// Перевіряємо, чи можна використовувати GET
		if (this.#canUseGet(Message)) {
			methods.push('get')
		}

		return methods
	}

	/**
	 * Перевіряє, чи може команда використовувати GET метод
	 */
	#canUseGet(Message) {
		return true // Наразі для всіх, можна додати логіку
	}

	/**
	 * Додає обробник для конкретного шляху та методу
	 */
	#addRoute(method, path, Message) {
		const key = `${method.toLowerCase()}:${path}`

		this.#routes.set(key, async (req, res) => {
			try {
				// Створюємо тіло повідомлення з даних запиту
				let body

				if (method === 'get') {
					body = req.query
				} else {
					body = req.body
				}

				// Перетворюємо в доменне повідомлення
				const msg = Message.from({ body })

				// Валідація через доменну модель
				if (!msg.isValid) {
					const errors = msg.getErrors()
					return res.status(400).json({
						error: 'Validation failed',
						details: errors,
					})
				}

				// Обробка через доменну логіку
				const results = []
				for await (const output of this.app.run(msg)) {
					if (output.isError) throw new Error(String(output.content))
					results.push(output.content)
				}

				res.json({
					success: true,
					data: results.length === 1 ? results[0] : results,
				})
			} catch (error) {
				const err = /** @type {Error} */ (error)
				res.status(400).json({
					error: err.message,
				})
			}
		})
	}
}
