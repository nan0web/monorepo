import AuthApp from '../AuthApp.js'
import { Router } from '@nan0web/http-node'

/**
 * API UI для аутентифікації
 *
 * Використання:
 * const api = new AuthAPI({ db, router })
 * api.setupRoutes()
 */

export default class AuthAPI {
	constructor({ db, router, tokenManager, logger, tokenRotationRegistry }) {
		this.db = db
		this.app = new AuthApp({ db, tokenManager, logger, tokenRotationRegistry })
		this.router = router || new Router()
	}

	/**
	 * Налаштовує маршрути для API
	 */
	setupRoutes() {
		this.router.post('/auth/signup', this.handleSignup.bind(this))
		this.router.post('/auth/confirm', this.handleConfirm.bind(this))
		this.router.post('/auth/login', this.handleLogin.bind(this))
		return this.router
	}

	/**
	 * Обробка запиту на реєстрацію
	 */
	async handleSignup(req, res) {
		try {
			const result = await this.processMessage('sign-up', {
				email: req.body.email,
				username: req.body.username,
				password: req.body.password,
			})

			this.sendResponse(res, result)
		} catch (error) {
			this.handleError(res, error)
		}
	}

	/**
	 * Обробка підтвердження реєстрації
	 */
	async handleConfirm(req, res) {
		try {
			const result = await this.processMessage('confirm-signup', {
				contact: req.body.contact,
				code: req.body.code,
			})

			this.sendResponse(res, result)
		} catch (error) {
			this.handleError(res, error)
		}
	}

	/**
	 * Обробка запиту на вхід
	 */
	async handleLogin(req, res) {
		try {
			const result = await this.processMessage('login', {
				identifier: req.body.identifier,
				password: req.body.password,
			})

			this.sendResponse(res, result)
		} catch (error) {
			this.handleError(res, error)
		}
	}

	/**
	 * Універсальна обробка повідомлень через додаток
	 * @returns {Promise<Array>}
	 */
	async processMessage(action, data) {
		const results = []
		// @ts-ignore: Action properties are dynamically validated
		const messageStream = this.app.run({ action, body: data })

		for await (const message of messageStream) {
			results.push(message)
		}

		return results
	}

	/**
	 * Відправляє відповідь з повідомленнями
	 */
	sendResponse(res, messages) {
		const lastMessage = messages[messages.length - 1]

		if (lastMessage && lastMessage.isError) {
			res.status(400).json({
				success: false,
				errors: lastMessage.content.map((msg) => ({
					code: typeof msg === 'object' && msg.key ? msg.key : 'error',
					message: typeof msg === 'object' && msg.message ? msg.message : String(msg),
					params: typeof msg === 'object' && msg.params ? msg.params : {},
				})),
			})
		} else {
			res.status(200).json({
				success: true,
				messages: messages
					.filter((m) => m.isInfo || m.isSuccess)
					.map((m) => ({
						type: m.type,
						content: m.content.map((content) =>
							typeof content === 'object' && content.key
								? { key: content.key, params: content.params }
								: String(content),
						),
					})),
			})
		}
	}

	/**
	 * Обробка помилок
	 */
	handleError(res, error) {
		console.error('API Error:', error)
		res.status(500).json({
			success: false,
			errors: [
				{
					code: 'server_error',
					message: 'Internal server error',
					original: process.env.NODE_ENV === 'development' ? String(error.message) : undefined,
				},
			],
		})
	}
}
