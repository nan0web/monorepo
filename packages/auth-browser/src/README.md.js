import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fsNode from 'node:fs'
import { fileURLToPath } from 'node:url'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser, mockFetch } from '@nan0web/test'
import AuthClient from './index.js'

const fs = new FS()
const pkg = JSON.parse(fsNode.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'))

let console = new NoConsole()
beforeEach(() => {
	console = new NoConsole()
})

function createMockFetch(mocks) {
	return mockFetch(mocks, 'http://localhost')
}

function testRender() {
	/**
	 * @docs
	 * # @nan0web/auth-browser
	 * <!-- %PACKAGE_STATUS% -->
	 * 
	 * Authentication browser client with password and social sign-in support.
	 * 
	 * ## Features
	 * 
	 * - **Password Authentication**: Username/password registration, sign-in, and password reset.
	 * - **Social Sign-in**: Google, Facebook, LinkedIn authentication support.
	 * - **Token Management**: Automatic token handling and refresh functionality.
	 * - **User Operations**: User data retrieval and account management.
	 * - **Security**: Built-in token expiry service and protected route access control.
	 * - **DX Transparency**: Fully covered with tests, zero-dependency, pure JavaScript with JSDoc.
	 * 
	 * ## Installation
	 * 
	 * ```bash
	 * npm install @nan0web/auth-browser
	 * ```
	 * 
	 * ## Usage
	 * ### Browser Client
	 * Auto-detects current window location or uses custom config.
	 */
	it('How to initialize AuthClient?', async () => {
		//import AuthClient from '@nan0web/auth-browser'

		const auth = await AuthClient.create({
			cwd: 'http://localhost',
			root: '/api/auth/',
			fetchFn: createMockFetch([])
		})

		console.info('Auth client created')
		assert.ok(auth instanceof AuthClient)
	})

	/**
	 * @docs
	 * ### Password Authentication
	 * Register a new user and sign in with credentials.
	 */
	it('How to register and sign in?', async () => {
		//import AuthClient from '@nan0web/auth-browser'

		const auth = await AuthClient.create({
			cwd: 'http://localhost',
			fetchFn: createMockFetch([
				['POST /auth/signup.json', { message: 'Verification code sent' }],
				['POST /auth/signin/user.json', { token: 'mock-jwt-token' }]
			])
		})

		// Register new account
		const signup = await auth.register({ username: 'user', password: 'pass' })
		console.info(signup.message) // ← Verification code sent

		// Sign in
		const signin = await auth.signIn('user', 'pass')
		console.info('Token received') // ← Token received

		assert.equal(signup.message, 'Verification code sent')
		if ('token' in signin) {
			assert.equal(signin.token, 'mock-jwt-token')
		}
	})

	/**
	 * @docs
	 * ### Social Authentication
	 * Authentication with third-party providers (Google, Facebook, etc).
	 */
	it('How to use social providers?', async () => {
		//import AuthClient from '@nan0web/auth-browser'

		const auth = await AuthClient.create({
			cwd: 'http://localhost',
			fetchFn: createMockFetch([
				['POST /auth/google.json', { token: 'google-jwt-token' }]
			])
		})

		const google = await auth.authWithProvider('google', 'google-token')
		console.info('Social auth successful')

		if ('token' in google) {
			assert.equal(google.token, 'google-jwt-token')
		}
	})

	/**
	 * @docs
	 * ### User Operations
	 * Manage user data and list available profiles.
	 */
	it('How to manage user profile?', async () => {
		//import AuthClient from '@nan0web/auth-browser'

		const auth = await AuthClient.create({
			cwd: 'http://localhost',
			fetchFn: createMockFetch([
				['GET /auth/signin/user1.json', { name: 'John Doe', email: 'john@example.com' }],
				['GET /auth/info.json', [200, ['user1', 'user2']]]
			])
		})

		// Get user data
		const user = await auth.getUser('user1')
		console.info(user.name) // ← John Doe

		// List all usernames
		const users = await auth.listUsers()
		console.info(`Found ${users.length} users`) // ← Found 2 users

		assert.equal(user.email, 'john@example.com')
		assert.deepStrictEqual(users, ['user1', 'user2'])
	})

	/**
	 * @docs
	 * ### Token Management
	 * Refresh authentication token using existing one.
	 */
	it('How to refresh tokens?', async () => {
		//import AuthClient from '@nan0web/auth-browser'

		const auth = await AuthClient.create({
			cwd: 'http://localhost',
			token: 'old-token',
			fetchFn: createMockFetch([
				['PUT /auth/refresh/old-token.json', { token: 'new-mock-token' }]
			])
		})

		const refresh = await auth.refreshToken()
		console.info('Token refreshed')

		if ('token' in refresh) {
			assert.equal(refresh.token, 'new-mock-token')
		}
	})

	/**
	 * @docs
	 * ## Contributing
	 * Please read our [contributing guidelines](./CONTRIBUTING.md).
	 * 
	 * ## License
	 * [ISC License](./LICENSE) - Copyright (c) 2025, ЯRаСлав (YaRaSlove)
	 */
	it('All exported classes should pass basic test', () => {
		assert.ok(AuthClient)
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	const parser = new DocsParser()
	const sourceCode = fsNode.readFileSync(fileURLToPath(import.meta.url), 'utf-8')
	const text = String(parser.decode(sourceCode))
	
	fsNode.writeFileSync('README.md', text)
	
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it('document is rendered in README.md', async () => {
		const content = fsNode.readFileSync('README.md', 'utf-8')
		assert.ok(content.includes('## License'))
	})
})
