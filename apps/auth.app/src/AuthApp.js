import { OutputMessage } from '@nan0web/types'
import { ModelError, Model } from '@nan0web/types'
import { Membership } from '@nan0web/auth-core'
import {
	SignUpMessage,
	ConfirmSignUpMessage,
	LoginMessage,
	UpdateInfoMessage,
} from './messages/index.js'
import { UserAccount, AuthPolicy, AuthConfig } from './index.js'

/**
 * AuthApp - Authentication system core, integrated with existing infrastructure
 *
 * This agnostic core can work in Web, CLI, API, and test environments.
 * It uses your existing AuthDB, TokenManager, etc. classes without HTTP dependency.
 */
export default class AuthApp extends Model {
	/** @type {Object} */ #limiter = { tryAttempt: () => true }

	/**
	 * @param {AuthConfig|Object} [data] - System configuration (Data)
	 * @param {any} [options] - Infrastructure and Models (Register)
	 */
	constructor(data = {}, options = {}) {
		// If data is AuthConfig, Model will map its properties to 'this'
		const config = data instanceof AuthConfig ? data : new AuthConfig(data || {})
		super(config, options)

		// 🛡 Interface Welding: Models Registry
		this._.models = {
			UserAccount: options.models?.UserAccount || UserAccount,
			AuthPolicy: options.models?.AuthPolicy || AuthPolicy,
			AuthConfig: options.models?.AuthConfig || AuthConfig,
		}

		// Ensure core services are accessible even if passed in data (legacy support)
		const services = ['db', 'tokenManager', 'tokenRotationRegistry', 'emitter', 'logger']
		for (const key of services) {
			if (!this._[key] && data && data[key]) {
				this._[key] = data[key]
			}
		}
	}

	/** @returns {import('@nan0web/log').Logger} */
	get logger() {
		return this._.logger
	}

	/**
	 * Main pipeline dispatcher.
	 * Routes the incoming message to the corresponding method (e.g., SignUpMessage -> signUp).
	 * @param {any} msg - Incoming message
	 * @yields {OutputMessage}
	 */
	async *run(msg) {
		const actionRaw = msg.action || msg.constructor.name
		const action = actionRaw.replace(/Message$/, '')
		const camelAction = action.charAt(0).toLowerCase() + action.slice(1)

		if (typeof this[camelAction] === 'function') {
			yield* this[camelAction](msg)
		} else if (typeof this[action] === 'function') {
			yield* this[action](msg)
		} else {
			yield new OutputMessage(new Error(`Action not recognized: ${actionRaw}`))
		}
	}

	/**
	 * Initializes the core and registers actions
	 */
	async init() {
		this._.logger?.debug('AuthApp initializing')

		const emitter = this._.emitter
		if (!emitter) return

		emitter.on('user:created', (ctx) => {
			this._.logger?.info('User created:', ctx.data.email)
		})

		emitter.on('user:confirmed', (ctx) => {
			this._.logger?.info('User confirmed:', ctx.data.user?.email)
		})

		emitter.on('user:logged-in', (ctx) => {
			this._.logger?.info('User logged in:', ctx.data.user?.email)
		})
	}

	/**
	 * Registers a new user using existing classes
	 * @param {SignUpMessage} input - Sign up message with email, username and password
	 * @yields {OutputMessage} Registration result messages
	 */
	async *signUp(input) {
		const message = SignUpMessage.from(input)

		this._.logger?.debug('Sign-up attempt', message.body.email)

		if (!message.isValid) {
			this._.logger?.warn('Sign-up validation failed', message.body.email)
			yield new OutputMessage({
				error: new Error('Sign-up validation failed'),
				body: message.errors,
			})
			return
		}

		try {
			// Use AuthDB to check if user exists
			const existingUser = await this._.db.getUser(message.body.username)
			if (existingUser) {
				this.logger?.debug('Signup failed: User already exists:', message.body.username)
				yield new OutputMessage(new Error('User already exists'))
				return
			}

			const user = await this._.db.createUser(message)
			this._.emitter?.emit('user:created', { email: user.email || message.body.email, user })

			const flow = this?.verificationFlow || 'email-only'

			if (flow === 'admin-only') {
				user.approved = false
				user.verified = true // No email code required for identity
				await this._.db.saveUser(user)
				yield new OutputMessage([
					'Registration successful',
					'Your account is pending administrator approval',
				])
				return
			}

			// Flows requiring email verification
			const verificationCode = this._.tokenManager
				.getShortHash(Math.random().toString())
				.substring(0, 6)
				.toUpperCase()

			user.approved = flow === 'email-only'
			await this._.db.saveVerificationCode(user.email || message.body.email, verificationCode)

			yield new OutputMessage({
				type: OutputMessage.TYPES.INFO,
				content: ['Registration successful', 'Check your email to confirm registration'],
			})

			this._.logger?.info('Sign-up success', user.email || message.body.email)
		} catch (error) {
			this.logger?.error('Sign-up error', error)
			yield new OutputMessage(new Error('Registration failed'))
		}
	}

	/**
	 * Confirms registration using existing services
	 * @param {ConfirmSignUpMessage} input - Confirmation message with contact and code
	 * @yields {OutputMessage} Confirmation result messages
	 */
	async *confirmSignUp(input) {
		const message = ConfirmSignUpMessage.from(input)

		this._.logger?.debug('Handling confirm signup for:', message.body.contact)

		const user = await this._.db.getUserByEmail(message.body.contact)
		if (!user) {
			this.logger?.debug('Signup confirmation failed: User not found:', message.body.contact)
			yield new OutputMessage(new Error('User not found'))
			return
		}

		if (user.verified) {
			this._.logger?.debug(
				'Signup confirmation failed: User already verified:',
				message.body.contact,
			)
			yield new OutputMessage(new Error('User already verified'))
			return
		}

		if (user.verificationCode !== message.body.code) {
			this.logger?.debug(
				'Signup confirmation failed: Invalid verification code for:',
				message.body.contact,
			)
			yield new OutputMessage(new Error('Invalid confirmation code'))
			return
		}

		// Update user through AuthDB
		user.verified = true
		user.verificationCode = null
		user.updatedAt = new Date()

		const flow = this?.verificationFlow
		if (flow === 'email+admin' && !user.approved) {
			await this._.db.saveUser(user)
			yield new OutputMessage([
				'Email verified successfully',
				'Your account now requires administrator approval before you can log in',
			])
			return
		}

		user.approved = true // Ensure approved for email-only flow
		await this._.db.saveUser(user)

		// Use TokenManager to generate tokens
		const tokenPair = this._.tokenManager.createTokenPair(user.name)
		await this._.db.updateTokens(user.name, tokenPair)
		this._.tokenRotationRegistry.registerToken(tokenPair.refreshToken, user.name)

		this._.logger?.info('User account verified:', user.name)

		yield new OutputMessage(['Account verified successfully', 'You are now part of our community'])

		// Optionally return tokens if UI needs them
		yield new OutputMessage({
			type: OutputMessage.TYPES.SUCCESS,
			body: {
				message: 'Token generated',
				accessToken: tokenPair.accessToken,
				refreshToken: tokenPair.refreshToken,
			},
		})
	}

	/**
	 * User login
	 * @param {LoginMessage} input - Login message with identifier and password
	 * @yields {OutputMessage} Login result messages
	 */
	async *login(input) {
		const message = LoginMessage.from(input)
		this._.logger?.debug('Handling signin for:', message.body.identifier)

		const user = await this._.db.getUser(message.body.identifier)
		if (!user) {
			this.logger?.debug('Signin failed: User not found:', message.body.identifier)
			yield new OutputMessage(new Error('Invalid credentials'))
			return
		}

		if (!user.verified) {
			this.logger?.debug('Signin failed: Account not verified:', message.body.identifier)
			yield new OutputMessage(new Error('Account not verified'))
			return
		}

		const isApprovalRequired = this?.verificationFlow === 'admin-only' || this?.verificationFlow === 'email+admin'
		const isApproved = user.approved !== undefined ? user.approved : !isApprovalRequired

		if (!isApproved) {
			this.logger?.debug('Signin failed: Account not approved:', message.body.identifier)
			yield new OutputMessage(new Error('Account pending administrator approval'))
			return
		}

		// Hash password as in AuthServer
		const inputPasswordHash = this.getShortHash(message.body.password)
		if (user.passwordHash !== inputPasswordHash) {
			this.logger?.debug('Signin failed: Invalid password for user:', message.body.identifier)
			yield new OutputMessage(new Error('Invalid credentials'))
			return
		}

		const tokenPair = this._.tokenManager.createTokenPair(user.name)
		await this._.db.updateTokens(user.name, tokenPair)
		this._.tokenRotationRegistry.registerToken(tokenPair.refreshToken, user.name)
		await this._.tokenRotationRegistry.save() // Save changes

		this._.logger?.info('User signin successful:', user.name)

		yield new OutputMessage({
			content: ['Welcome!', 'You have been successfully logged in'],
		})

		// Return tokens
		yield new OutputMessage({
			type: OutputMessage.TYPES.SUCCESS,
			body: {
				message: 'Token generated',
				accessToken: tokenPair.accessToken,
				refreshToken: tokenPair.refreshToken,
			},
		})
	}

	/**
	 * Forgot password - sends reset code
	 * @param {{ body: { username: string } }} input - Input with username
	 * @yields {OutputMessage} Forgot password result message
	 */
	async *forgotPassword(input) {
		const { username } = input.body
		this._.logger?.debug('Handling forgot password for:', username)

		const user = await this._.db.getUser(username)
		if (!user) {
			this.logger?.debug('Forgot password failed: User not found:', username)
			yield new OutputMessage(new Error('User not found'))
			return
		}

		// Generate reset code
		const resetCode = this._.tokenManager
			.getShortHash(Math.random().toString())
			.substring(0, 6)
			.toUpperCase()

		user.resetCode = resetCode
		user.updatedAt = new Date()
		await this._.db.saveUser(user)

		this._.logger?.info('Password reset code sent for user:', username)

		yield new OutputMessage({
			content: ['Password reset code sent'],
		})
	}

	/**
	 * Reset password with code
	 * @param {{ body: { username: string, code: string, password: string } }} input - Input with username, code and new password
	 * @yields {OutputMessage} Reset password result messages
	 */
	async *resetPassword(input) {
		const { username, code, password } = input.body
		this._.logger?.debug('Handling password reset for:', username)

		const user = await this._.db.getUser(username)
		if (!user) {
			this.logger?.debug('Password reset failed: User not found:', username)
			yield new OutputMessage(new Error('User not found'))
			return
		}

		if (user.resetCode !== code) {
			this.logger?.debug('Password reset failed: Invalid reset code for user:', username)
			yield new OutputMessage(new Error('Invalid reset code'))
			return
		}

		user.passwordHash = this.getShortHash(password)
		user.resetCode = null
		user.updatedAt = new Date()

		await this._.db.saveUser(user)
		this._.logger?.info('Password reset successful for user:', username)

		if (this?.clearTokensOnPasswordReset) {
			await this._.db.clearTokens(user.name)
			this._.tokenRotationRegistry.clearUserTokens(user.name)
			this._.logger?.debug('Previous tokens cleared for user:', username)
		}

		const tokenPair = this._.tokenManager.createTokenPair(username)
		await this._.db.updateTokens(username, tokenPair)
		this._.tokenRotationRegistry.registerToken(tokenPair.refreshToken, username)
		await this._.tokenRotationRegistry.save() // Save changes

		yield new OutputMessage({
			content: ['Password reset successful'],
		})

		// Return new tokens
		yield new OutputMessage({
			type: OutputMessage.TYPES.SUCCESS,
			body: {
				message: 'New token generated',
				accessToken: tokenPair.accessToken,
				refreshToken: tokenPair.refreshToken,
			},
		})
	}

	/**
	 * Updates user information
	 * @param {UpdateInfoMessage} input - Update info message with user data and authorization header
	 * @yields {OutputMessage} Update info result message
	 */
	async *updateInfo(input) {
		const message = UpdateInfoMessage.from(input)
		const user = await this.authenticate(message.head.authorization)

		if (!user || user.name !== message.body.username) {
			yield new OutputMessage(new Error('Unauthorized'))
			return
		}

		// Update user
		Object.assign(user, message.body)
		user.updatedAt = new Date()

		await this._.db.saveUser(user)
		this._.logger?.info('User info updated:', user.name)

		yield new OutputMessage('User information updated')
	}

	/**
	 * Authenticates user by token
	 * @param {string} token - Authorization token
	 * @returns {Promise<Object|null>} User object or null if authentication fails
	 */
	async authenticate(token) {
		if (!token) return null

		const authToken = token.replace(/^Bearer\s+/, '')
		if (this._.db.auth) {
			return await this._.db.auth(authToken)
		}
		return null
	}

	/**
	 * Hashes a value (as in AuthServer)
	 * @param {string} value - Value to hash
	 * @returns {string} Short hash of the value
	 */
	getShortHash(value) {
		return this._.tokenManager.getShortHash(value)
	}

	/**
	 * Refreshes user access token
	 * @param {{ body: { refreshToken: string } }} input - Input with refresh token
	 * @yields {OutputMessage} Refresh token result messages
	 */
	async *refreshToken(input) {
		const { refreshToken } = input.body
		this._.logger?.debug('Handling token refresh')

		// Check if refresh token exists and is valid
		const username = this._.tokenRotationRegistry.validateToken(refreshToken)
		if (!username) {
			this.logger?.debug('Token refresh failed: Invalid refresh token')
			yield new OutputMessage(new Error('Invalid refresh token'))
			return
		}

		// Get user from database
		const user = await this._.db.getUser(username)
		if (!user) {
			this.logger?.debug('Token refresh failed: User not found:', username)
			yield new OutputMessage(new Error('User not found'))
			return
		}

		// Create new token pair
		const tokenPair = this._.tokenManager.createTokenPair(username)

		// Update tokens in database
		await this._.db.updateTokens(username, tokenPair)

		// Register new refresh token
		this._.tokenRotationRegistry.registerToken(tokenPair.refreshToken, username)

		// Revoke old refresh token
		this._.tokenRotationRegistry.revokeToken(refreshToken)

		// Save registry changes
		await this._.tokenRotationRegistry.save()

		this._.logger?.info('Token refresh successful for user:', username)

		// Return new tokens
		yield new OutputMessage({
			type: OutputMessage.TYPES.SUCCESS,
			body: {
				message: 'Token refreshed',
				accessToken: tokenPair.accessToken,
				refreshToken: tokenPair.refreshToken,
			},
		})
	}
	/**
	 * Links a sovereign Soul ID to an existing user account.
	 * @param {{ body: { username: string, soulId: string } }} input
	 * @yields {OutputMessage} Link result
	 */
	async *linkSoulId(input) {
		const { username, soulId } = input.body
		this._.logger?.debug('Linking Soul ID to user:', username)

		if (!this._.db) {
			yield new OutputMessage(new Error('Database service not available'))
			return
		}

		const user = await this._.db.getUser(username)
		if (!user) {
			yield new OutputMessage(new Error('User not found'))
			return
		}

		user.soulId = soulId
		user.updatedAt = new Date()
		await this._.db.saveUser(user)

		this._.logger?.info('Soul ID linked:', username, '→', soulId)
		yield new OutputMessage({ content: ['Soul ID linked successfully'] })
	}

	/**
	 * Registers a new user with community membership.
	 * @param {Object} input - SignUpMessage + soulId + membership config
	 * @yields {OutputMessage} Registration result
	 */
	async *registerForCommunity(input) {
		// 1. Standard signUp flow
		let userCreated = false
		for await (const output of this.signUp(input)) {
			// Check if signup successful
			if (output.isError) {
				yield output
				return // Abort if signup failed
			}
			// Look for success signal (e.g. 'Registration successful')
			if (output.content && output.content.includes('Registration successful')) {
				userCreated = true
			}
			yield output // Forward output
		}

		if (!userCreated) return

		// 2. Create Membership and link Soul ID
		const { username, soulId } = input.body
		// Wait a bit or assume user is in DB immediately (DB is usually sync or fast enough locally)
		const user = await this._.db.getUser(username)

		if (user) {
			try {
				const membership = Membership.from(user)
				// Default to 'seeker' (user) role for new registrations
				membership.join('willni', 'user', new Set(['r', 'w']), {
					dailyCoins: BigInt(this?.defaultCommunityCoins || 0), // Use BigInt from config
					registeredAt: new Date().toISOString(),
				})

				// Link Soul ID
				if (soulId) {
					user.soulId = soulId
				}

				// Merge membership data back to user object before saving
				Object.assign(user, membership.toObject())

				await this._.db.saveUser(user)
				this._.logger?.info('Community membership created for:', username)

				yield new OutputMessage({
					content: ['Community membership activated'],
				})
			} catch (e) {
				this._.logger?.error('Failed to create membership:', e)
				// Don't fail the whole registration, just log? Or yield error?
				yield new OutputMessage(new Error('Membership creation failed'))
			}
		}
	}

	/**
	 * Approves a user account (Admin action)
	 * @param {string} username - Username to approve
	 * @yields {OutputMessage} Approval result
	 */
	async *approveUser(username) {
		this._.logger?.info('Approving user:', username)
		const user = await this._.db.getUser(username)
		if (!user) {
			yield new OutputMessage(new Error('User not found'))
			return
		}
		user.approved = true
		await this._.db.saveUser(user)
		yield new OutputMessage(`User ${username} approved successfully`)
	}
}
