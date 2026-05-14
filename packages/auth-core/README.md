# @nan0web/auth-core

> 🇬🇧 [English](./README.md) | 🇺🇦 [Українська](./docs/uk/README.md)

<!-- %PACKAGE_STATUS% -->

Minimal authentication core providing:

- `User` – user model with role handling and token management
- `Role` – enumeration of user roles
- `Membership` – group based permission sets
- `AccessControl` – data-driven authorization resolver (parser + matcher)
- `Password` – secure password hashing (scrypt)
- `Session` – filesystem user persistence
- `TokenExpiryService` – simple token lifetime utilities
- `Token` – sovereign JWT-compatible token (Ed25519 signed)
- `Crypto` – Ed25519 key generation, signing, verification
- `Auth` – facade exporting the above

## Installation

How to install with npm?
```bash
npm install @nan0web/auth-core
```

How to install with pnpm?
```bash
pnpm add @nan0web/auth-core
```

How to install with yarn?
```bash
yarn add @nan0web/auth-core
```

## Basic usage – User

Create a user, assign roles and check role existence.

How to create a User and check roles?
```js
import { User, Role } from "@nan0web/auth-core"
const user = new User({
	name: 'Alice',
	email: 'alice@example.com',
	roles: ['admin', 'user'],
})
console.info(user.toString({ detailed: true, hideDate: true }))
// Alice <alice@example.com> admin, user
console.info(user.is('admin')) // ← true
console.info(user.is('guest')) // ← false
```
## Token handling

Manage tokens with `TokenExpiryService`.

How to create a token and validate its expiry?
```js
import { TokenExpiryService } from "@nan0web/auth-core"
const service = new TokenExpiryService(2000) // 2 seconds
const tokenTime = new Date()
console.info(service.isValid(tokenTime)) // ← true
// fast‑forward simulation
const past = new Date(Date.now() - 3000)
console.info(service.isValid(past)) // ← false
console.info(service.getExpiryDate(tokenTime).toISOString())
// the date in ISO format
```
## Membership – group permissions

Join a group, check permissions, mint daily coins and see admin bypass.

How to use Membership to manage group permissions?
```js
import { Membership, Role } from "@nan0web/auth-core"
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
```
## AccessControl

Universal parser and matcher for access rules (.access and .group files).
Three-level resolution: User → Group → Global (*).

How to check access using AccessControl?
```js
import { AccessControl } from "@nan0web/auth-core"
const ac = new AccessControl()
// Load raw content (usually from files)
ac.load(
	'* r /public\nadmin rwd /admin', // .access
	'admin sovr', // .group
)
console.info(ac.check('sovr', '/admin', 'w')) // ← true (via admin group)
console.info(ac.check('guest', '/public', 'r')) // ← true (via *)
console.info(ac.check('guest', '/admin', 'r')) // ← false
```
## Password

Scrypt-based hashing with timing-safe verification.

How to hash and verify passwords?
```js
import { Password } from "@nan0web/auth-core"
const hash = Password.hash('sovereign')
console.info(hash) // salt:hash string
console.info(Password.verify('sovereign', hash)) // ← true
console.info(Password.verify('wrong', hash)) // ← false
```
## Session

Save/load user identity (email) to a JSON file.

How to persist user session?
```js
import { Session } from "@nan0web/auth-core"
const session = new Session('./session.json')
session.save('sovr@yaro.page')
console.info(session.load()) // ← sovr@yaro.page
session.clear()
```
## Auth facade

Exported object provides easy access to core classes.

How to use the Auth facade?
```js
import { Auth } from "@nan0web/auth-core"
const user = new Auth.User({ name: 'Bob' })
// Showing user name with createdAt date-time
console.info(user.toString())
// Bob
// YYYY-MM-DD HH:mm:SS
```
## Token – Sovereign JWT

Create, verify, and refresh Ed25519-signed tokens.

How to create and verify a Token?
```js
import { Token, Crypto } from "@nan0web/auth-core"
const { publicKey, privateKey } = Crypto.generateKeyPair()
const token = Token.create({ sub: 'sovr@yaro.page' }, privateKey, { expiresIn: 3600 })
console.info(typeof token) // ← 'string'
const result = Token.verify(token, publicKey)
console.info(result.valid) // ← true
console.info(result.payload.sub) // ← 'sovr@yaro.page'
```
## API reference

### User

* **Properties**
  * `name` – string
  * `email` – string
  * `roles` – `Role[]`
  * `createdAt` – `Date`
  * `updatedAt` – `Date`

* **Methods**
  * `is(role)` – checks if the user has the specified role
  * `toObject()` – plain representation without private tokens

### Role

* **Static ROLES**
  * `admin` – `"a"`
  * `author` – `"r"`
  * `moderator` – `"m"`
  * `user` – `"u"`

* **Methods**
  * `toString()` – returns role value

### Membership

* **Properties**
  * `memberships` – `Map<string, { role: Role, perms: Set<string>, config: object }>`

* **Methods**
  * `join(key, roleValue, perms, config)` – add a group
  * `can(key, perm)` – permission check (admin role bypasses)
  * `mintDailyCoins(key)` – add daily coin amount from config (updates `wallet` in config)

### AccessControl

* **Methods**
  * `load(accessContent, groupContent)` – parse rules from strings
  * `check(username, path, level)` – true/false
  * `filterNav(items, username)` – filter menu items
  * `info(username)` – get effective rules and groups

### Password

* **Static Methods**
  * `hash(plain, projectSalt?)` – returns "salt:hash"
  * `verify(input, stored, projectSalt?)` – timing-safe check

### Session

* **Methods**
  * `save(email)`
  * `load()`
  * `clear()`

### TokenExpiryService

* **Constructor**
  * `new TokenExpiryService(lifetimeMs)`

* **Methods**
  * `isValid(creationDate, lifetime?)`
  * `getExpiryDate(issuedAt?, lifetime?)`
  * `extendLifetime(creationDate, extensionMs?, maxLifetime?)`

### Auth

Facade exporting `User`, `Role`, `TokenExpiryService`, `Membership`, `Token`, `Crypto`.

### Token

* **Static Methods**
  * `Token.create(payload, privateKey, options?)` – create signed token
  * `Token.verify(token, publicKey)` – verify and decode `{ valid, payload, error? }`
  * `Token.decode(token)` – decode without verification
  * `Token.refresh(token, privateKey, options?)` – re-sign with new iat/exp

### Crypto

* **Static Properties**
  * `isNode` – boolean, true in Node.js environment

* **Static Methods**
  * `generateKeyPair()` – Ed25519 key pair (Base64 DER)
  * `sign(privateKey, data, options?)` – sign data (Base64 or hex with `{ compact: true }`)
  * `verify(publicKey, data, signature, options?)` – verify signature

All exported classes should be available

## JavaScript

Types are described via JSDoc and the generated `.d.ts` files.

Uses `d.ts` for autocomplete

## Contributing

How to contribute? - [check here](./CONTRIBUTING.md)

## License

How to license ISC? - [check here](./LICENSE)
