# @nan0web/auth-core v1.2.0 — Token & Compact Mesh

> **Місія**: Суверенний JWT-сумісний токен на Ed25519, compact signatures, isomorphic crypto.

---

## Scope

### AUTH-1: Token клас

JWT-сумісний токен, побудований на `Crypto.js` (Ed25519).

- `Token.create(payload, privateKey, options?)` → підписаний токен (string)
- `Token.verify(token, publicKey)` → `{ valid, payload, error? }`
- `Token.decode(token)` → payload без верифікації
- Формат: `base64url(header).base64url(payload).base64url(signature)`
- Header: `{ alg: 'EdDSA', typ: 'JWT' }`
- Payload підтримує: `sub`, `iss`, `iat`, `exp`, довільні claims
- `exp` — автоматичний із `TokenExpiryService` або явний
- Refresh: `Token.refresh(token, privateKey, options?)` — новий токен з оновленим `iat`/`exp`

### AUTH-2: Compact Signatures

- `Crypto.sign()` та `Crypto.verify()` підтримують `{ compact: true }` опцію
- Compact = raw 64-byte Ed25519 signature (hex), замість Base64 DER
- Для Bit-Sovereign mesh identity — мінімальний розмір сигнатури

### AUTH-3: Isomorphic Crypto

- `Crypto.generateKeyPair()`, `.sign()`, `.verify()` працюють у браузерах
- Fallback на `globalThis.crypto.subtle` (Web Crypto API)
- Визначення середовища: `typeof window !== 'undefined'` + `globalThis.crypto?.subtle`

---

## Architecture Audit

- [x] Прочитано Індекси екосистеми
- [x] Чи існують аналоги? — Ні, Token.js новий модуль. TokenExpiryService залишається для lifetime mgmt.
- [x] Джерела даних: немає YAML, чистий crypto модуль
- [x] UI-стандарт не застосовується (backend module)

## Definition of Done

1. Всі `it()` тести з `task.spec.js` зелені
2. `npm run test:all` проходить повністю
3. Жодних зовнішніх залежностей (zero-dependency)
4. JSDoc на кожному public API
