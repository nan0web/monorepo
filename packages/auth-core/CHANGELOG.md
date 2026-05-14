# Changelog

All notable changes to `@nan0web/auth-core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] — 2026-02-25

### Fixed

- **`#matchAccess`** — fixed root path permission matching. When `target` was `/` or `/*`, it previously resulted in `//` matching false. Now correctly allows root access (`* rwd /`).

## [1.1.1] — 2026-02-25

### Fixed

- **`#matchAccess`** — trailing `/` in target (e.g. `admin/`) now correctly matches `/admin`, `/admin/`, and `/admin/files`. Previously `target + '/'` produced `//` double-slash, causing match failure

## [1.1.0] — 2026-02-25

### Added

- **AccessControl** — data-driven авторизаційний резолвер (парсер + матчер)
  - `load(accessContent, groupContent)` — парсинг .access / .group файлів
  - `check(username, path, level)` — трирівнева резолюція: User → Group → Global (\*)
  - `filterNav(items, username)` — фільтрація пунктів меню
  - `info(username)` — ефективні правила та групи
- **Password** — scrypt-based хешування з timing-safe верифікацією
  - `hash(plain, projectSalt?)` — повертає `salt:hash`
  - `verify(input, stored, projectSalt?)` — безпечна перевірка
- **Session** — збереження/завантаження ідентичності у JSON-файл
  - `save(email)`, `load()`, `clear()`
- `docs/uk/README.md` — повна українська документація (синхронізована з EN)
- `.npmignore` — за стандартом system.md
- `knip.json` — production-перевірка невикористаних файлів
- `test:all` конвеєр: `test → test:docs → build → knip → audit`

### Fixed

- **`AccessControl.js`** — em-dash (`—`) у JSDoc `@param` замінено на дефіс (`-`) — `TS1127: Invalid character`
- **`Password.js`** — аналогічне виправлення em-dash у `@param` та `@returns`
- **`App/Auth.js`** — `import { Command }` → `import Command` (default export у `@nan0web/co`)

## [1.0.0] — 2026-02-24

### Added

- **User** — модель користувача з ролями, токенами, `createdAt`/`updatedAt`
  - `is(role)`, `toObject()`, `toString()`
- **Role** — перелік ролей: admin, author, moderator, user
- **Membership** — груповий набір дозволів з `dailyCoins` та `wallet`
  - `join()`, `can()`, `mintDailyCoins()`
- **TokenExpiryService** — утиліти часу життя токенів
  - `isValid()`, `getExpiryDate()`, `extendLifetime()`
- **Auth** — фасад (static properties: User, Role, Membership, etc.)
- TypeScript declarations (`types/*.d.ts`)
- ProvenDoc README generation (`src/README.md.js`)
- 104 тести (89 unit + 15 docs) — all pass
