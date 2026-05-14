// src/core/example.js
import AuthApp from '../src/AuthApp.js'
import AuthDB from '@nan0web/auth-node/src/AuthDB.js'
import TokenManager from '@nan0web/auth-node/src/TokenManager.js'
import TokenRotationRegistry from '@nan0web/auth-node/src/TokenRotationRegistry.js'

// Створення інстансу
const db = new AuthDB({ cwd: './auth-data', logger: console })
const tokenManager = new TokenManager()
const tokenRotationRegistry = new TokenRotationRegistry({
	db,
	maxAge: 30 * 24 * 60 * 60 * 1000,
})

const core = new AuthApp({
	db,
	tokenManager,
	logger: console,
	tokenRotationRegistry,
})

// Використання
async function runExample() {
	await core.init()

	const input = {
		action: 'sign-up',
		body: {
			email: 'test@example.com',
			username: 'testuser',
			password: 'password123',
		},
	}

	for await (const output of core.run(input)) {
		console.log('OUTPUT:', output.content)
	}
}

runExample()
