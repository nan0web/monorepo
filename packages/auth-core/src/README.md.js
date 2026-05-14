import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DocsParser, DatasetParser } from '@nan0web/test'

import {
	Auth,
	User,
	Role,
	Membership,
	TokenExpiryService,
	AccessControl,
	Password,
	Session,
	Crypto,
	Token,
} from './index.js'

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

/**
 * Core test suite that also serves as the source for README generation.
 *
 * Block comments inside each `it` are extracted to build the final README.md.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/auth-core
	 *
	 * > 🇬🇧 [English](./README.md) | 🇺🇦 [Українська](./docs/uk/README.md)
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * Minimal authentication core providing:
	 *
	 * - `User` – user model with role handling and token management
	 * - `Role` – enumeration of user roles
	 * - `Membership` – group based permission sets
	 * - `AccessControl` – data-driven authorization resolver (parser + matcher)
	 * - `Password` – secure password hashing (scrypt)
	 * - `Session` – filesystem user persistence
	 * - `TokenExpiryService` – simple token lifetime utilities
	 * - `Token` – sovereign JWT-compatible token (Ed25519 signed)
	 * - `Crypto` – Ed25519 key generation, signing, verification
	 * - `Auth` – facade exporting the above
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/auth-core
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/auth-core')
	})
	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/auth-core
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/auth-core')
	})
	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/auth-core
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/auth-core')
	})

	/**
	 * @docs
	 * ## Basic usage – User
	 *
	 * Create a user, assign roles and check role existence.
	 */
	it('How to create a User and check roles?', () => {
		//import { User, Role } from "@nan0web/auth-core"
		const user = new User({
			name: 'Alice',
			email: 'alice@example.com',
			roles: ['admin', 'user'],
		})
		console.info(user.toString({ detailed: true, hideDate: true }))
		// Alice <alice@example.com> admin, user
		console.info(user.is('admin')) // ← true
		console.info(user.is('guest')) // ← false
		assert.equal(console.output()[0][1], 'Alice\n<alice@example.com>\nadmin, user')
		assert.equal(console.output()[1][1], true)
		assert.equal(console.output()[2][1], false)
	})

	/**
	 * @docs
	 * ## Token handling
	 *
	 * Manage tokens with `TokenExpiryService`.
	 */
	it('How to create a token and validate its expiry?', () => {
		//import { TokenExpiryService } from "@nan0web/auth-core"
		const service = new TokenExpiryService(2000) // 2 seconds
		const tokenTime = new Date()
		console.info(service.isValid(tokenTime)) // ← true
		// fast‑forward simulation
		const past = new Date(Date.now() - 3000)
		console.info(service.isValid(past)) // ← false
		console.info(service.getExpiryDate(tokenTime).toISOString())
		// the date in ISO format
		assert.equal(console.output()[0][1], true)
		assert.equal(console.output()[1][1], false)
		assert.ok(console.output()[2][1].includes('Z'))
	})

	/**
	 * @docs
	 * ## Membership – group permissions
	 *
	 * Join a group, check permissions, mint daily coins and see admin bypass.
	 */
	it('How to use Membership to manage group permissions?', () => {
		//import { Membership, Role } from "@nan0web/auth-core"
		const mem = new Membership()
		// regular group with explicit permissions
		mem.join('lawyers', 'moderator', new Set(['r', 'w']), { dailyCoins: 10 })
		console.info(mem.can('lawyers', 'r')) // ← true
		console.info(mem.can('lawyers', 'd')) // ← false
		mem.mintDailyCoins('lawyers')
		const inner = mem.memberships.get('lawyers')
		console.info(inner?.config.wallet === 10n) // ← true
		// admin role bypasses all permission checks
		mem.join('admins', 'admin', new Set(), {})
		console.info(mem.can('admins', '*')) // ← true
		assert.equal(console.output()[0][1], true)
		assert.equal(console.output()[1][1], false)
		assert.equal(console.output()[2][1], true)
		assert.equal(console.output()[3][1], true)
	})

	/**
	 * @docs
	 * ## AccessControl
	 *
	 * Universal parser and matcher for access rules (.access and .group files).
	 * Three-level resolution: User → Group → Global (*).
	 */
	it('How to check access using AccessControl?', () => {
		//import { AccessControl } from "@nan0web/auth-core"
		const ac = new AccessControl()
		// Load raw content (usually from files)
		ac.load(
			'* r /public\nadmin rwd /admin', // .access
			'admin sovr', // .group
		)
		console.info(ac.check('sovr', '/admin', 'w')) // ← true (via admin group)
		console.info(ac.check('guest', '/public', 'r')) // ← true (via *)
		console.info(ac.check('guest', '/admin', 'r')) // ← false
		assert.equal(console.output()[0][1], true)
		assert.equal(console.output()[1][1], true)
		assert.equal(console.output()[2][1], false)
	})

	/**
	 * @docs
	 * ## Password
	 *
	 * Scrypt-based hashing with timing-safe verification.
	 */
	it('How to hash and verify passwords?', () => {
		//import { Password } from "@nan0web/auth-core"
		const hash = Password.hash('sovereign')
		console.info(hash) // salt:hash string
		console.info(Password.verify('sovereign', hash)) // ← true
		console.info(Password.verify('wrong', hash)) // ← false
		assert.ok(hash.includes(':'))
		assert.equal(console.output()[1][1], true)
		assert.equal(console.output()[2][1], false)
	})

	/**
	 * @docs
	 * ## Session
	 *
	 * Save/load user identity (email) to a JSON file.
	 */
	it('How to persist user session?', () => {
		//import { Session } from "@nan0web/auth-core"
		const session = new Session('./session.json')
		session.save('sovr@yaro.page')
		console.info(session.load()) // ← sovr@yaro.page
		session.clear()
		assert.ok(session)
		assert.equal(console.output()[0][1], 'sovr@yaro.page')
	})

	/**
	 * @docs
	 * ## Auth facade

	 *
	 * Exported object provides easy access to core classes.
	 */
	it('How to use the Auth facade?', () => {
		//import { Auth } from "@nan0web/auth-core"
		const user = new Auth.User({ name: 'Bob' })
		// Showing user name with createdAt date-time
		console.info(user.toString())
		// Bob
		// YYYY-MM-DD HH:mm:SS
		assert.ok(Auth.User)
		assert.ok(Auth.Role)
		assert.ok(Auth.TokenExpiryService)
		assert.equal(console.output()[0][1].split('\n')[0], 'Bob')
	})

	/**
	 * @docs
	 * ## Token – Sovereign JWT
	 *
	 * Create, verify, and refresh Ed25519-signed tokens.
	 */
	it('How to create and verify a Token?', () => {
		//import { Token, Crypto } from "@nan0web/auth-core"
		const { publicKey, privateKey } = Crypto.generateKeyPair()
		const token = Token.create({ sub: 'sovr@yaro.page' }, privateKey, { expiresIn: 3600 })
		console.info(typeof token) // ← 'string'
		const result = Token.verify(token, publicKey)
		console.info(result.valid) // ← true
		console.info(result.payload.sub) // ← 'sovr@yaro.page'
		assert.equal(console.output()[0][1], 'string')
		assert.equal(console.output()[1][1], true)
		assert.equal(console.output()[2][1], 'sovr@yaro.page')
	})

	/**
	 * @docs
	 * ## API reference
	 *
	 * ### User
	 *
	 * * **Properties**
	 *   * `name` – string
	 *   * `email` – string
	 *   * `roles` – `Role[]`
	 *   * `createdAt` – `Date`
	 *   * `updatedAt` – `Date`
	 *
	 * * **Methods**
	 *   * `is(role)` – checks if the user has the specified role
	 *   * `toObject()` – plain representation without private tokens
	 *
	 * ### Role
	 *
	 * * **Static ROLES**
	 *   * `admin` – `"a"`
	 *   * `author` – `"r"`
	 *   * `moderator` – `"m"`
	 *   * `user` – `"u"`
	 *
	 * * **Methods**
	 *   * `toString()` – returns role value
	 *
	 * ### Membership
	 *
	 * * **Properties**
	 *   * `memberships` – `Map<string, { role: Role, perms: Set<string>, config: object }>`
	 *
	 * * **Methods**
	 *   * `join(key, roleValue, perms, config)` – add a group
	 *   * `can(key, perm)` – permission check (admin role bypasses)
	 *   * `mintDailyCoins(key)` – add daily coin amount from config (updates `wallet` in config)
	 *
	 * ### AccessControl
	 *
	 * * **Methods**
	 *   * `load(accessContent, groupContent)` – parse rules from strings
	 *   * `check(username, path, level)` – true/false
	 *   * `filterNav(items, username)` – filter menu items
	 *   * `info(username)` – get effective rules and groups
	 *
	 * ### Password
	 *
	 * * **Static Methods**
	 *   * `hash(plain, projectSalt?)` – returns "salt:hash"
	 *   * `verify(input, stored, projectSalt?)` – timing-safe check
	 *
	 * ### Session
	 *
	 * * **Methods**
	 *   * `save(email)`
	 *   * `load()`
	 *   * `clear()`
	 *
	 * ### TokenExpiryService
	 *
	 * * **Constructor**
	 *   * `new TokenExpiryService(lifetimeMs)`
	 *
	 * * **Methods**
	 *   * `isValid(creationDate, lifetime?)`
	 *   * `getExpiryDate(issuedAt?, lifetime?)`
	 *   * `extendLifetime(creationDate, extensionMs?, maxLifetime?)`
	 *
	 * ### Auth
	 *
	 * Facade exporting `User`, `Role`, `TokenExpiryService`, `Membership`, `Token`, `Crypto`.
	 *
	 * ### Token
	 *
	 * * **Static Methods**
	 *   * `Token.create(payload, privateKey, options?)` – create signed token
	 *   * `Token.verify(token, publicKey)` – verify and decode `{ valid, payload, error? }`
	 *   * `Token.decode(token)` – decode without verification
	 *   * `Token.refresh(token, privateKey, options?)` – re-sign with new iat/exp
	 *
	 * ### Crypto
	 *
	 * * **Static Properties**
	 *   * `isNode` – boolean, true in Node.js environment
	 *
	 * * **Static Methods**
	 *   * `generateKeyPair()` – Ed25519 key pair (Base64 DER)
	 *   * `sign(privateKey, data, options?)` – sign data (Base64 or hex with `{ compact: true }`)
	 *   * `verify(publicKey, data, signature, options?)` – verify signature
	 */
	it('All exported classes should be available', () => {
		assert.ok(User)
		assert.ok(Role)
		assert.ok(Membership)
		assert.ok(TokenExpiryService)
		assert.ok(Token)
		assert.ok(Crypto)
		assert.ok(Auth)
	})

	/**
	 * @docs
	 * ## JavaScript
	 *
	 * Types are described via JSDoc and the generated `.d.ts` files.
	 */
	it('Uses `d.ts` for autocomplete', () => {
		assert.equal(pkg.types, 'types/index.d.ts')
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to contribute? - [check here](./CONTRIBUTING.md)', async () => {
		assert.equal(pkg.scripts?.precommit, 'npm test')
		assert.equal(pkg.scripts?.prepush, 'npm test')
		assert.equal(pkg.scripts?.prepare, 'husky')
		const text = await fs.loadDocument('CONTRIBUTING.md')
		const str = text?.content ?? String(text)
		assert.ok(str.includes('# Contributing'))
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license ISC? - [check here](./LICENSE)', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(text.toString().includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	let text = ''
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument('README.md', text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const txt = await fs.loadDocument('README.md')
		const str = txt?.content ?? String(txt)
		assert.ok(str.includes('## API reference'))
	})
})
