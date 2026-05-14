# @nan0web/auth-core

> 🇺🇦 [Українська](./README.md) | 🇬🇧 [English](../../README.md)

<!-- %PACKAGE_STATUS% -->

Мінімальне ядро автентифікації:

- `User` – модель користувача з керуванням ролями та токенами
- `Role` – перелік ролей користувачів
- `Membership` – групові дозволи
- `AccessControl` – data-driven аутентифікаційний резолвер (парсер + матчер)
- `Password` – безпечне хешування паролів (scrypt)
- `Session` – збереження сесії у файловій системі
- `TokenExpiryService` – утиліти для керування часом життя токенів
- `Token` – суверенний JWT-сумісний токен (підпис Ed25519)
- `Crypto` – генерація ключів Ed25519, підпис, верифікація
- `Auth` – фасад, що експортує все вищезазначене

## Встановлення

Встановити через npm:

```bash
npm install @nan0web/auth-core
```

Встановити через pnpm:

```bash
pnpm add @nan0web/auth-core
```

Встановити через yarn:

```bash
yarn add @nan0web/auth-core
```

## Базове використання – User

Створення користувача, призначення ролей та перевірка їх наявності.

```js
import { User, Role } from '@nan0web/auth-core'
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

## Керування токенами

Керування токенами за допомогою `TokenExpiryService`.

```js
import { TokenExpiryService } from '@nan0web/auth-core'
const service = new TokenExpiryService(2000) // 2 секунди
const tokenTime = new Date()
console.info(service.isValid(tokenTime)) // ← true
// симуляція плину часу
const past = new Date(Date.now() - 3000)
console.info(service.isValid(past)) // ← false
console.info(service.getExpiryDate(tokenTime).toISOString())
// дата у форматі ISO
```

## Membership – групові дозволи

Приєднання до групи, перевірка дозволів, нарахування щоденних монет та обхід для адміна.

```js
import { Membership, Role } from '@nan0web/auth-core'
const mem = new Membership()
// звичайна група з явними дозволами
mem.join('lawyers', 'moderator', new Set(['r', 'w']), { dailyCoins: 10 })
console.info(mem.can('lawyers', 'r')) // ← true
console.info(mem.can('lawyers', 'd')) // ← false
mem.mintDailyCoins('lawyers')
const inner = mem.memberships.get('lawyers')
console.info(inner?.config.wallet === 10n) // ← true
// роль admin обходить усі перевірки дозволів
mem.join('admins', 'admin', new Set(), {})
console.info(mem.can('admins', '*')) // ← true
```

## AccessControl

Універсальний парсер і матчер правил доступу (файли .access та .group).
Трирівнева резолюція: Користувач → Група → Глобальний (\*).

```js
import { AccessControl } from '@nan0web/auth-core'
const ac = new AccessControl()
// Завантаження сирого контенту (зазвичай з файлів)
ac.load(
  '* r /public\nadmin rwd /admin', // .access
  'admin sovr', // .group
)
console.info(ac.check('sovr', '/admin', 'w')) // ← true (через групу admin)
console.info(ac.check('guest', '/public', 'r')) // ← true (через *)
console.info(ac.check('guest', '/admin', 'r')) // ← false
```

## Password

Хешування на основі scrypt з timing-safe верифікацією.

```js
import { Password } from '@nan0web/auth-core'
const hash = Password.hash('sovereign')
console.info(hash) // рядок salt:hash
console.info(Password.verify('sovereign', hash)) // ← true
console.info(Password.verify('wrong', hash)) // ← false
```

## Session

Збереження/завантаження ідентичності користувача (email) у JSON файл.

```js
import { Session } from '@nan0web/auth-core'
const session = new Session('./session.json')
session.save('sovr@yaro.page')
console.info(session.load()) // ← sovr@yaro.page
session.clear()
```

## Фасад Auth

Експортований об'єкт надає швидкий доступ до основних класів.

```js
import { Auth } from '@nan0web/auth-core'
const user = new Auth.User({ name: 'Bob' })
// Відображення імені з датою створення
console.info(user.toString())
// Bob
// YYYY-MM-DD HH:mm:SS
```

## Token – Суверенний JWT

Створення, верифікація та оновлення токенів з підписом Ed25519.

```js
import { Token, Crypto } from '@nan0web/auth-core'
const { publicKey, privateKey } = Crypto.generateKeyPair()
const token = Token.create({ sub: 'sovr@yaro.page' }, privateKey, { expiresIn: 3600 })
console.info(typeof token) // ← 'string'
const result = Token.verify(token, publicKey)
console.info(result.valid) // ← true
console.info(result.payload.sub) // ← 'sovr@yaro.page'
```

## Довідка API

### User

- **Властивості**
  - `name` – string
  - `email` – string
  - `roles` – `Role[]`
  - `createdAt` – `Date`
  - `updatedAt` – `Date`

- **Методи**
  - `is(role)` – перевірка наявності ролі
  - `toObject()` – представлення як plain object без приватних токенів

### Role

- **Статичні ROLES**
  - `admin` – `"a"`
  - `author` – `"r"`
  - `moderator` – `"m"`
  - `user` – `"u"`

- **Методи**
  - `toString()` – повертає значення ролі

### Membership

- **Властивості**
  - `memberships` – `Map<string, { role: Role, perms: Set<string>, config: object }>`

- **Методи**
  - `join(key, roleValue, perms, config)` – додати групу
  - `can(key, perm)` – перевірка дозволу (роль admin обходить)
  - `mintDailyCoins(key)` – нарахувати щоденну кількість монет із config (оновлює `wallet`)

### AccessControl

- **Методи**
  - `load(accessContent, groupContent)` – парсинг правил з рядків
  - `check(username, path, level)` – true/false
  - `filterNav(items, username)` – фільтрація пунктів меню
  - `info(username)` – отримати ефективні правила та групи

### Password

- **Статичні методи**
  - `hash(plain, projectSalt?)` – повертає "salt:hash"
  - `verify(input, stored, projectSalt?)` – timing-safe перевірка

### Session

- **Методи**
  - `save(email)`
  - `load()`
  - `clear()`

### TokenExpiryService

- **Конструктор**
  - `new TokenExpiryService(lifetimeMs)`

- **Методи**
  - `isValid(creationDate, lifetime?)`
  - `getExpiryDate(issuedAt?, lifetime?)`
  - `extendLifetime(creationDate, extensionMs?, maxLifetime?)`

### Auth

Фасад, що експортує `User`, `Role`, `TokenExpiryService`, `Membership`, `Token`, `Crypto`.

### Token

- **Статичні методи**
  - `Token.create(payload, privateKey, options?)` – створити підписаний токен
  - `Token.verify(token, publicKey)` – верифікувати та декодувати `{ valid, payload, error? }`
  - `Token.decode(token)` – декодувати без верифікації
  - `Token.refresh(token, privateKey, options?)` – перепідписати з новим iat/exp

### Crypto

- **Статичні властивості**
  - `isNode` – boolean, true в середовищі Node.js

- **Статичні методи**
  - `generateKeyPair()` – пара ключів Ed25519 (Base64 DER)
  - `sign(privateKey, data, options?)` – підписати дані (Base64 або hex з `{ compact: true }`)
  - `verify(publicKey, data, signature, options?)` – верифікувати підпис

## JavaScript

Типи описані за допомогою JSDoc та згенерованих файлів `.d.ts`.

## Внесок

Як зробити внесок? — [тут](../../CONTRIBUTING.md)

## Ліцензія

Ліцензія ISC — [тут](../../LICENSE)
