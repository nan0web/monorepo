import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fsNode from 'node:fs'
import { fileURLToPath } from 'node:url'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import {
	DatasetParser,
	DocsParser,
} from '@nan0web/test'
import { AuthPolicy, AuthApp, UserAccount, AuthConfig } from './index.js'

const fs = new FS()
let pkg

before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()
beforeEach(() => {
	console = new NoConsole()
})

function testRender() {
	/**
	 * @docs
	 * # @nan0web/auth.app
	 * <!-- %PACKAGE_STATUS% -->
	 * 
	 * ## Description
	 * Authorization application core for nan0web. Implementation of One Logic — Many UI (OLMUI) 
	 * for user management, identity verification, and rule-based access control.
	 *
	 * ## 🏁 Authorization Flow
	 * 
	 * ```mermaid
	 * graph TD
	 *     REQ["HTTP Request (urlPath)"] --> POLICY{"AuthPolicy.isProtected(urlPath)?"}
	 *     POLICY -->|No| PASS["✅ Pass through"]
	 *     POLICY -->|Yes| CHECK{"Token present?"}
	 *     CHECK -->|No| R401["401 Unauthorized"]
	 *     CHECK -->|Yes| VERIFY{"Token valid?"}
	 *     VERIFY -->|No| R403["403 Forbidden"]
	 *     VERIFY -->|Yes| PASS
	 * ```
	 *
	 * ## 🧬 Domain Models
	 * 
	 * ### AuthPolicy
	 * 
	 * | Property | Type | Default | Description |
	 * | :--- | :--- | :--- | :--- |
	 * | enabled | boolean | true | global auth toggle |
	 * | protectedPaths | string[] | ['/api/**'] | glob-patterns to guard |
	 * | publicPaths | string[] | ['/api/health'] | glob-overrides (public) |
	 * | strategy | enum | 'jwt' | jwt, session, or apikey |
	 *
	 * | username | string | Unique login identifier |
	 * | email | string | Primary contact (validated) |
	 * | soulId | string | Sovereign identity bridge |
	 * | verified | boolean | Identity confirmed (email/did) |
	 * | approved | boolean | Authorized for community access |
	 *
	 * ### AuthConfig
	 * 
	 * | Property | Type | Default | Description |
	 * | :--- | :--- | :--- | :--- |
	 * | verificationFlow | enum | 'email-only' | email-only, admin-only, email+admin |
	 * | clearTokensOnPasswordReset | boolean | true | security lifecycle |
	 * | passwordMinLength | number | 8 | validation rule |
	 *
	 * ## Installation
	 * ```bash
	 * npm install @nan0web/auth.app
	 * ```
	 */
	it('How to install?', () => {
		assert.equal(pkg.name, '@nan0web/auth.app')
	})

	/**
	 * @docs
	 * ## Usage
	 * 
	 * ### 🛡 URL Access Control (AuthPolicy)
	 * Define protection rules using glob patterns with automatic public overrides.
	 */
	it('How to check if a path is protected?', () => {
		//import { AuthPolicy } from '@nan0web/auth.app'
		const policy = new AuthPolicy({
			protectedPaths: ['/api/**'],
			publicPaths: ['/api/health']
		})

		assert.equal(policy.isProtected('/api/users'), true)
		assert.equal(policy.isProtected('/api/health'), false)
	})

	/**
	 * @docs
	 * ### 🛠 System Configuration (AuthConfig)
	 * Formalize system behavior using the AuthConfig model.
	 */
	it('How to configure the auth system?', () => {
		//import { AuthConfig } from '@nan0web/auth.app'
		
		const config = new AuthConfig({
			'password-min-length': 12,
			'token-expiry': '24h'
		})

		console.info(config.passwordMinLength)
		assert.equal(console.output()[0][1], 12)
		assert.equal(config.tokenExpiry, '24h')
	})

	/**
	 * @docs
	 * ### 👤 Extension via Inheritance
	 * Extend the base `UserAccount` to add specific fields for your application (e.g., coins, roles).
	 */
	it('How to extend UserAccount for your app?', () => {
		//import { UserAccount } from '@nan0web/auth.app'
		
		class SunAccount extends UserAccount {
			static dailyCoins = { type: 'number', default: 100 }
		}

		const user = new SunAccount({
			username: 'architechnomag',
			email: 'mag@nan0web.net',
			dailyCoins: 500
		})

		assert.equal(user.username, 'architechnomag')
		assert.equal(user.dailyCoins, 500)
	})

	/**
	 * @docs
	 * ### 🧩 Registration Strategies
	 * Configure how users join your community using the `verificationFlow` parameter.
	 * 
	 * | Strategy | Description | User State After Confirm |
	 * | :--- | :--- | :--- |
	 * | `email-only` | Standard auto-approval (Sovereign) | `verified: true`, `approved: true` |
	 * | `admin-only` | Manual approval by moderator | `verified: true`, `approved: false` |
	 * | `email+admin` | Dual verification (High Trust) | `verified: true`, `approved: false` |
	 *
	 * ### 🚀 Polymorphic Dispatcher (run)
	 * The `AuthApp` uses a generator-based pipeline to process any domain message.
	 * It automatically routes `[Action]Message` to the corresponding `[action]` method.
	 * 
	 * ```mermaid
	 * sequenceDiagram
	 *     Adapter->>AuthApp: run(SignUpMessage)
	 *     AuthApp->>Logic: dispatch to signUp()
	 *     Logic-->>AuthApp: yields OutputMessage
	 *     AuthApp-->>Adapter: streaming results
	 * ```
	 */
	it('How to run the signup flow?', async () => {
		//import { AuthApp, AuthConfig } from '@nan0web/auth.app'
		const config = new AuthConfig({ 'default-community-coins': 500 })
		
		const app = new AuthApp(config, {
			db: { 
				getUser: async () => null, 
				createUser: async () => ({ email: 'test@example.com', name: 'testuser' }),
				saveVerificationCode: async () => {},
				saveUser: async () => {}
			},
			tokenManager: { 
				getShortHash: (v) => 'hash-' + v.slice(0,6),
				createTokenPair: () => ({ accessToken: 'at', refreshToken: 'rt' })
			},
			tokenRotationRegistry: { registerToken: () => {} }
		})

		// 1. Using the polymorphic run() dispatcher
		const msg = SignUpMessage.from({
			body: { email: 'test@example.com', username: 'testuser', password: 'password123' }
		})

		const signupFlow = app.run(msg)

		for await (const output of signupFlow) {
			const label = Array.isArray(output.content) ? output.content[0] : output.body?.message || output.error?.message
			console.info(label)
		}

		assert.equal(console.output()[0][1], 'Registration successful')
	})

	/**
	 * @docs
	 * ### 🛡 Advanced Strategies: Email + Admin approval
	 * In this mode, the user confirms their email, but the account remains unapproved until an administrator takes action.
	 */
	it('How to use email+admin strategy?', async () => {
		const config = new AuthConfig({ 'verification-flow': 'email+admin' })
		const app = new AuthApp(config, {
			db: { 
				getUser: async () => null, 
				getUserByEmail: async () => ({ name: 'testuser', email: 'test@example.com', verified: false, approved: false, verificationCode: '123456' }),
				createUser: async () => ({ email: 'test@example.com', name: 'testuser' }),
				saveVerificationCode: async () => {},
				saveUser: async () => {}
			},
			tokenManager: { getShortHash: (v) => 'hash-' + v.slice(0,6) },
			tokenRotationRegistry: { registerToken: () => {} }
		})

		const confirmFlow = app.confirmSignUp({ body: { contact: 'test@example.com', code: '123456' } })
		
		for await (const output of confirmFlow) {
			const label = Array.isArray(output.content) ? output.content[0] : output.body?.message || output.error?.message
			if (label) console.info(label)
		}

		assert.equal(console.output()[0][1], 'Email verified successfully')
		assert.equal(console.output()[1][1], 'Your account now requires administrator approval before you can log in')
	})

	/**
	 * @docs
	 * ## API Reference (v1.1.0)
	 * 
	 * * **AuthApp**: business logic dispatcher.
	 * * **AuthPolicy**: URL access control rule manager.
	 * * **UserAccount**: identity domain model (extendable).
	 * * **AuthConfig**: system environment settings.
	 */
	it('API completeness check', () => {
		assert.ok(AuthApp)
		assert.ok(AuthPolicy)
		assert.ok(UserAccount)
		assert.ok(AuthConfig)
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	const parser = new DocsParser()
	const sourceCode = fsNode.readFileSync(fileURLToPath(import.meta.url), 'utf-8')
	const text = String(parser.decode(sourceCode))
	await fs.saveDocument('README.md', text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it('document is rendered in README.md', async () => {
		const content = fsNode.readFileSync('README.md', 'utf-8')
		assert.ok(content.includes('## Description'))
		assert.ok(content.includes('System Configuration'))
		assert.ok(content.includes('Extension via Inheritance'))
	})
})
