# Seed: @nan0web/catalog-watch

## 1. Purpose

Lightweight package for subscribing to product catalog changes via HTTP HEAD + ETag. Follows the Zero-State Server principle: the server generates a static `.index.txt` file during SSG build, and the client periodically polls it via `HEAD` requests, minimizing traffic. A catalog is any product collection (cards, credits, metals, news) in any number of locales.

Core idea: **the client learns about catalog changes without WebSocket, without push notifications, without a backend — only through HTTP HEAD and a SHA-256 hash in a plain-text index file.**

## 2. Model-as-Schema (Data Schema)

### Catalog Indexing → `DirectoryIndex` from `@nan0web/db`

Instead of a custom `CatalogIndexModel`, the mature `DirectoryIndex` from `@nan0web/db` is used:
- `DirectoryIndex.encode()` — serializes `index.txt` (flat) / `index.txtl` (hierarchical)
- `DirectoryIndex.decode()` — deserializes back
- `DirectoryIndex.generateAllIndexes(db, dirPath)` — generates indexes for SSG
- Columns: `name, mtimeMs.36, size.36` (base-36 for compactness)

The SSG build plugin `buildCatalogIndex` has been moved to **`@nan0web/catalog`** — the server-side catalog engine.

### CatalogWatcherModel (Client-side — Browser/CLI/SW)

- `url` (string, hint: url) — URL of the `.index.txt` index file
- `interval` (number, hint: slider, default: 3600) — polling interval (seconds)
- `lastHash` (string, hidden) — last known hash
- `lastCheck` (string, hidden) — ISO 8601 timestamp of last check
- `status` (string, hint: badge) — state: idle | checking | updated | unchanged | error
- `autoConfirm` (boolean, hint: toggle, default: false) — auto-confirm without prompt

## 3. Generator (Flow)

> **Note:** The server-side build generator (`buildCatalogIndex`) now lives in `@nan0web/catalog`.
> `catalog-watch` is a purely client-side package (change observation).

### CatalogWatcherModel.check(env) — single client check

1. **log(error)**: validation — `url` is required
2. **progress**: "Checking {url}..."
3. HTTP HEAD → check `304` or ETag match → **log(info)**: "No changes", **result**: `{ updated: false }`
4. HTTP GET → parse `.index.txt` via `DirectoryIndex.decode()` from `@nan0web/db`
5. **log(error)**: fetch or parse error
6. Hash comparison (ETag or hash from index)
7. **log(success)**: "Catalog updated!"
8. **ask(download)**: "Download now?" (type: boolean) — if not `autoConfirm`
9. State mutation: `lastHash`, `lastCheck`, `lastIndex`, `status`
10. **log(success)**: "Catalog downloaded successfully"
11. **result**: `{ updated, downloaded, index: { catalog, locale, version, hash, itemCount, files } }`

### CatalogWatcherModel.watch(env) — continuous loop

1. **progress**: "Initializing watcher..."
2. `while(true)`: delegates to `check()` → **progress**: "Next check in {seconds}s" → `env.sleep(interval * 1000)`

## 4. Adapters (Implementations)

### CatalogWatcher (EventBus Adapter — `./`)

- Wraps `CatalogWatcherModel` with real `globalThis.fetch`
- EventBus via `@nan0web/event`: emits 'updated', 'unchanged', 'error'
- Lifecycle: `.start()` → `setInterval` → `.stop()` → `clearInterval`
- Auto-confirm in headless mode

### UI Adapters (Platform-specific)

| Export | Module | Purpose |
|--------|--------|---------|
| `./ui/cli` | CLI adapter | Terminal output: status, polling log, interactive confirm via `@nan0web/ui-cli` |
| `./ui/lit` | Lit adapter | Web Component `<catalog-status>` badge/indicator for PWA |
| `./ui/chat` | Chat adapter | AI/Chat bot, notifies about catalog updates |

Each adapter imports `CatalogWatcherModel` and runs `runGenerator` with platform-specific handlers (`ask`, `progress`, `log`).

### Service Worker (sw.js — PWA)

- `registerCatalogSync(self, urls, options)` — registers in Service Worker
- Intercepts fetch requests to `.index.txt` via Cache API
- `message: 'catalog:check'` — trigger from client on foreground return
- `notifyCatalogCheck()` — client helper for `visibilitychange`

> **buildCatalogIndex** (SSG Plugin) — moved to `@nan0web/catalog/server`.
> Index generation logic belongs to the catalog engine, not the watcher.

## 5. User Stories

### Server (SSG) — live in `@nan0web/catalog`

> Stories S01–S06 have been moved to the `@nan0web/catalog` seed, since `buildCatalogIndex` is now there.

### Client (Watcher)

7. `W01` As a browser/CLI, I want to create `CatalogWatcher({ url, interval })` and subscribe to the `'updated'` event to learn about catalog changes.
8. `W02` As a watcher, I want to send a `HEAD` request first to compare `ETag`, and only if `ETag` changed — fetch full content via `GET`.
9. `W03` As a watcher, I want to handle `304 Not Modified` from the server as "no changes" without extra traffic.
10. `W04` As a watcher, I want the state to be `'unchanged'` when `ETag` matches `lastHash`, without downloading content.
11. `W05` As a watcher, I want to fall back to the hash from the `.index.txt` header when `ETag` is absent.
12. `W06` As a user, I want to receive a "Download now?" prompt before downloading the updated catalog (if `autoConfirm: false`).
13. `W07` As a user, I want to decline the download, with `lastHash` remaining unchanged (can retry later).
14. `W08` As a watcher with `autoConfirm: true`, I want downloads to happen automatically without interactive prompts.
15. `W09` As a watcher, I want network errors during `fetch` to transition status to `'error'` and emit an `'error'` event.
16. `W10` As a watcher, I want `.index.txt` parse errors to be handled separately with an `error_parse` message.
17. `W11` As a watcher, I want `lastCheck` to be updated after EVERY check (even "unchanged" or "error").
18. `W12` As a watcher, I want the generator to return an error immediately when `url` is missing, without network requests.
19. `W13` As a watcher in `watch()` mode, I want the check to repeat every `interval` seconds indefinitely.

### Integration (Adapters)

20. `A01` As a CatalogWatcher (EventBus adapter), I want to emit `'updated'` with `{ catalog, locale, version, hash, itemCount, files }` on update.
21. `A02` As a CatalogWatcher, I want to emit `'unchanged'` (no payload) when the hash hasn't changed.
22. `A03` As a CatalogWatcher, I want to emit `'error'` with `{ error }` on network failure.
23. `A04` As a CatalogWatcher with `.start()`, I want an immediate first check + periodic polling via `setInterval`.
24. `A05` As a CatalogWatcher with `.stop()`, I want `clearInterval` to stop polling.

### PWA (Service Worker)

25. `P01` As a Service Worker, I want to pre-cache initial `.index.txt` files via Cache API on `install`.
26. `P02` As a Service Worker, I want to intercept `.index.txt` fetch requests and return cached or fresh versions.
27. `P03` As a Service Worker, I want to check all registered catalogs on `message: 'catalog:check'` from the client and respond with `'catalog:updated'` containing an array of updated catalogs.
28. `P04` As a client, I want to call `notifyCatalogCheck()` on `visibilitychange` to trigger a check in the Service Worker.

### End-to-End (Scenario)

29. `E01` As an OLMUI scenario, I want the full cycle: create watcher with `lastHash: 'old'` → check → detect update → auto-confirm → save state to `@nan0web/db` In-Memory → verify that `lastHash` was updated and `status === 'updated'`.
30. `E02` As an OLMUI scenario, I want the Intent contract to guarantee: every intent has a `type` field, ask has `schema`, log has `level` + `message`, progress has `message`.

---

## 6. CORE-8: Model Migration (`extends Model` from `@nan0web/core`)

> Обидві моделі (`CatalogIndexModel`, `CatalogWatcherModel`) використовують `resolveDefaults` напряму.
> Після міграції — `extends Model` уніфікує constructor, дасть доступ до `.validate()`, `.db`.

### CatalogIndexModel (97 рядків конструктора → 0)

**До:**
```js
import { resolveDefaults } from '@nan0web/types'
export class CatalogIndexModel {
  // 6 instance field initializers...
  constructor(data = {}) {
    Object.assign(this, resolveDefaults(CatalogIndexModel, data))
    if (data.files) this.files = data.files
  }
}
```

**Після:**
```js
import { Model } from '@nan0web/core'
export class CatalogIndexModel extends Model {
  // static fields залишаються
  // instance field initializers ВИДАЛЯЮТЬСЯ
  // files: handled via static files = { default: [] }
  static files = { help: 'Index file list', default: [], hidden: true }
}
```

### CatalogWatcherModel (аналогічно)

**До:** 7 instance field initializers + ручний `resolveDefaults`
**Після:** `extends Model`, видалити instance fields, додати `static lastIndex = { default: null, hidden: true }`

### Контрольний список

- [x] Додати `@nan0web/core` до `dependencies` у `package.json`
- [x] `CatalogIndexModel extends Model` — видалити instance fields, залишити static
- [x] `CatalogWatcherModel extends Model` — видалити instance fields, залишити static
- [x] `files` → `static files = { default: [], hidden: true }` (нове поле)
- [x] Видалити `import { resolveDefaults } from '@nan0web/types'` з обох файлів
- [ ] Тести: прогнати `npm run test:all` (48 unit + 25 story = 73)
- [ ] Перевірити `toString()` та `parse()` — вони не залежать від constructor

### Ризик циклічності: ✅ Безпечно

`@nan0web/catalog-watch` вже залежить від `@nan0web/ui`, яка не залежить від `core`.
Додавання `@nan0web/core` — **жодного циклу** (core не залежить від catalog-watch).

## 7. Status (Current State)

✅ Впроваджено `extends Model` з `@nan0web/core` для обох моделей.
✅ Видалено всі ручні ініціалізатори та конструктори в `CatalogIndexModel` та `CatalogWatcherModel`.
⚠️ Потрібно виконати `npm run test:all` після синхронізації `node_modules` (pnpm install).

