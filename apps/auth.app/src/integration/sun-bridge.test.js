import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import AuthApp from '../AuthApp.js'
import { SignUpMessage } from '../messages/index.js'
import DB from '@nan0web/db'

describe('Sun.app Bridge Integration', () => {
	let app
	let db
	let tokenManager

	beforeEach(async () => {
		db = new DB()
		// Mock db methods
		const users = new Map()
		db.getUser = async (username) => users.get(username) || null
		db.createUser = async (message) => {
			const user = {
				username: message.body.username,
				email: message.body.email,
				passwordHash: message.body.password, // In real app this is hashed
				verified: false,
				name: message.body.username,
			}
			users.set(user.username, user)
			return user
		}
		db.saveUser = async (user) => {
			users.set(user.username, user)
		}
		db.saveVerificationCode = async () => {}

		tokenManager = {
			getShortHash: (v) => v,
			createTokenPair: () => ({ accessToken: 'access', refreshToken: 'refresh' }),
		}

		app = new AuthApp({
			db,
			tokenManager,
			logger: { debug: () => {}, info: () => {}, error: () => {}, warn: () => {} },
		})
		await app.init()
	})

	it('should link soul ID to existing user', async () => {
		// 1. Create user
		const signUp = new SignUpMessage({
			body: { username: 'sun_user', email: 'sun@example.com', password: 'password123' },
		})
		for await (const _ of app.signUp(signUp)) {
		}

		// 2. Link Soul ID
		const linkInput = { body: { username: 'sun_user', soulId: 'soul-id-123' } }
		const outputs = []
		for await (const output of app.linkSoulId(linkInput)) {
			outputs.push(output)
		}

		assert.ok(outputs[0].content.includes('Soul ID linked successfully'))

		// 3. Verify in DB
		const user = await db.getUser('sun_user')
		assert.strictEqual(user.soulId, 'soul-id-123')
	})

	it('should register user and create membership with soul ID', async () => {
		const input = new SignUpMessage({
			body: {
				username: 'new_sun_user',
				email: 'new_sun@example.com',
				password: 'password123',
				soulId: 'soul-id-456',
			},
		})

		// 1. Register for community
		const outputs = []
		for await (const output of app.registerForCommunity(input)) {
			outputs.push(output)
		}

		// 2. Verify success
		const successMsg = outputs.find(
			(o) => o.content && o.content.includes('Community membership activated'),
		)
		assert.ok(successMsg, 'Should return membership activation message')

		// 3. Verify User state
		const user = await db.getUser('new_sun_user')
		assert.strictEqual(user.soulId, 'soul-id-456')
		// Check membership props (Membership puts them on user object)
		assert.ok(Array.isArray(user.memberships), 'Should have memberships array')
		const willni = user.memberships.find((m) => m.key === 'willni')
		assert.ok(willni, 'Should have willni membership')
		// Role is serialized to object or string in toObject?
		// Role.toString() returns string. Role object in membership.
		// Membership.toObject maps entries to { key, role, perms, config }
		// Role object is there.
		assert.ok(willni.role, 'Should have role')
		assert.strictEqual(willni.role.toString(), 'u', 'Default role should be user')
	})
})
