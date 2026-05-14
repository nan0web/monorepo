import { OutputMessage } from '@nan0web/types'
import { UiForm as UIForm } from '@nan0web/ui'
import { CLI, CLiInputAdapter as CLIInputAdapter } from '@nan0web/ui-cli'
import AuthApp from '../AuthApp.js'
import { SignUpMessage, ConfirmSignUpMessage, LoginMessage } from '../messages/index.js'

/**
 * CLI UI for authentication using @nan0web/ui-cli
 *
 * Usage:
 * const cli = new AuthCLI({ db });
 * await cli.signup();
 */
export default class AuthCLI {
	constructor({ db, tokenManager, logger, tokenRotationRegistry }) {
		this.db = db
		this.app = new AuthApp({ db, tokenManager, logger, tokenRotationRegistry, config: {} })
		this.adapter = new CLIInputAdapter()
		this.logger = logger || {
			error: console.error,
			info: console.log,
			success: console.log,
		}
		this.commands = {
			signup: { title: 'Registration', fn: this.app.signUp.bind(this.app) },
			confirm: { title: 'Confirm registration', fn: this.app.confirmSignUp.bind(this.app) },
			login: { title: 'Log in', fn: this.app.login.bind(this.app) },
			forgot: { title: 'Forgot password', fn: this.app.forgotPassword.bind(this.app) },
			reset: { title: 'Reset password', fn: this.app.resetPassword.bind(this.app) },
			info: { title: 'Update info', fn: this.app.updateInfo.bind(this.app) },
			refresh: { title: 'Refresh token', fn: this.app.refreshToken.bind(this.app) },
		}
	}

	async signup() {
		return this._handleInteractive(SignUpMessage)
	}

	async confirmSignup() {
		return this._handleInteractive(ConfirmSignUpMessage)
	}

	async login() {
		return this._handleInteractive(LoginMessage)
	}

	async _handleInteractive(MessageClass) {
		try {
			const instance = new MessageClass()
			const bodyShape = instance.body || {}

			const fields = Object.keys(bodyShape).map((name) => {
				const typeMap = { password: 'password', email: 'email', username: 'text' }
				return {
					name,
					label: this.adapter.t(instance[`${name}Label`] || name),
					placeholder: this.adapter.t(instance[`${name}Placeholder`] || ''),
					help: this.adapter.t(instance[`${name}Help`] || ''),
					type: typeMap[name] || 'text',
					required: true,
				}
			})

			const formSpec = UIForm.from({
				title: this.adapter.t(MessageClass.help || MessageClass.name),
				id: `form-${MessageClass.name}`,
				fields,
				state: {},
				validateValue: (name, value) => {
					// Simple fallback validation for text UI inputs
					return { isValid: !!value, errors: value ? {} : { [name]: 'Required field' } }
				},
				validate: (state) => {
					const msgInstance = new MessageClass({ body: state })
					const errors = msgInstance.errors || []
					const isValid = errors.length === 0
					const formattedErrors = errors.reduce((acc, err) => {
						acc.general = Array.isArray(err) ? err[0] : err
						return acc
					}, {})
					return { isValid, errors: formattedErrors }
				},
			})

			const response = await this.adapter.requestForm(formSpec, { silent: false })
			const body = response.form?.state || response

			const action = MessageClass.name
			const msg = MessageClass.from({ body, action })
			if (action && !msg.action) {
				msg.action = action
			}

			const messages = []
			let success = true

			for await (const output of this.app.run(msg)) {
				this._renderMessage(output)
				messages.push(output)
				if (output.isError) success = false
			}

			return { success, messages }
		} catch (/** @type {any} */ error) {
			if (error.name === 'CancelError' || error.constructor.name === 'CancelError') {
				return { cancelled: true }
			}
			throw error
		}
	}

	async run() {
		// @todo get all the object methods.
		function getAllMethods(obj) {
			let methods = []
			let proto = Object.getPrototypeOf(obj)

			while (proto && proto !== Object.prototype) {
				methods = methods.concat(
					Object.getOwnPropertyNames(proto).filter(
						(method) => typeof obj[method] === 'function' && method !== 'constructor',
					),
				)
				proto = Object.getPrototypeOf(proto)
			}

			return [...new Set(methods)] // Remove duplicates
		}
		const arr = getAllMethods(this.app)
		const x = 9
	}

	/**
	 * Displays message in terminal
	 * @param {OutputMessage} message - Message object with isError, isInfo, isSuccess properties and content array
	 * @private
	 */
	_renderMessage(message) {
		if (message.isError) {
			this.logger.error('Error')
			if (Array.isArray(message.content)) {
				message.content.forEach((line) => {
					this.logger.error(
						` • ${typeof line === 'object' ? line.message || line.key || line : line}`,
					)
				})
			}
		} else if (message.isInfo) {
			if (Array.isArray(message.content)) {
				message.content.forEach((line) => {
					if (typeof line === 'object' && line.key) {
						this.logger.success(` • ${line.key}`)
					} else {
						this.logger.info(` • ${line}`)
					}
				})
			}
		} else {
			if (Array.isArray(message.content)) {
				message.content.forEach((line) => {
					if (typeof line === 'object' && line.key) {
						this.logger.success(` • ${line.key}`)
					} else {
						this.logger.info(` • ${line}`)
					}
				})
			}
		}
	}
}
