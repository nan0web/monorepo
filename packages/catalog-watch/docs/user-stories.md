# 🧪 User Stories: @nan0web/catalog-watch

> **Rule:** Every User Story is backed by a test.
> Full user-scenario cycle is implemented via `runGenerator` + `DB` In-Memory + assertions.

---

## 🖥 Server (SSG Build) — `@nan0web/catalog`

> Stories S01–S06 have been moved to `@nan0web/catalog` since `buildCatalogIndex` now lives there.

---

## 🔍 Client (Watcher)

### W01 — Subscribe to updates
**As** a browser/CLI, **I want** to create `CatalogWatcher({ url, interval })` and subscribe to the `'updated'` event **so that** I learn about catalog changes.

### W02 — HEAD-first strategy
**As** a watcher, **I want** to send a `HEAD` request first to compare `ETag`, and only if `ETag` changed — fetch full content via `GET`.

### W03 — 304 Not Modified
**As** a watcher, **I want** to handle `304 Not Modified` from the server as "no changes" without extra traffic.

### W04 — ETag match
**As** a watcher, **I want** the state to be `'unchanged'` when `ETag` matches `lastHash`, without downloading content.

### W05 — Fallback to index hash
**As** a watcher, **I want** to fall back to the hash from the `.index.txt` header when `ETag` is absent.

### W06 — Interactive confirmation
**As** a user, **I want** to receive a "Download now?" prompt before downloading the updated catalog (if `autoConfirm: false`).

### W07 — Decline download
**As** a user, **I want** to decline the download, with `lastHash` remaining unchanged (can retry later).

### W08 — Auto-confirm
**As** a watcher with `autoConfirm: true`, **I want** downloads to happen automatically without interactive prompts.

### W09 — Network error
**As** a watcher, **I want** network errors during `fetch` to transition status to `'error'` and emit an `'error'` event.

### W10 — Parse error
**As** a watcher, **I want** `.index.txt` parse errors to be handled separately with an `error_parse` message.

### W11 — lastCheck always updated
**As** a watcher, **I want** `lastCheck` to be updated after EVERY check (even "unchanged" or "error").

### W12 — URL validation
**As** a watcher, **I want** the generator to return an error immediately when `url` is missing, without network requests.

### W13 — Infinite watch loop
**As** a watcher in `watch()` mode, **I want** the check to repeat every `interval` seconds indefinitely.

---

## 🔌 Integration (Adapters)

### A01 — Emit 'updated'
**As** a CatalogWatcher (EventBus adapter), **I want** to emit `'updated'` with `{ catalog, locale, version, hash, itemCount, files }` on update.

### A02 — Emit 'unchanged'
**As** a CatalogWatcher, **I want** to emit `'unchanged'` (no payload) when the hash hasn't changed.

### A03 — Emit 'error'
**As** a CatalogWatcher, **I want** to emit `'error'` with `{ error }` on network failure.

### A04 — Start + immediate check
**As** a CatalogWatcher with `.start()`, **I want** an immediate first check + periodic polling via `setInterval`.

### A05 — Stop polling
**As** a CatalogWatcher with `.stop()`, **I want** `clearInterval` to stop polling.

---

## 🌐 PWA (Service Worker)

### P01 — Pre-caching
**As** a Service Worker, **I want** to pre-cache initial `.index.txt` files via Cache API on `install`.

### P02 — Fetch interception
**As** a Service Worker, **I want** to intercept `.index.txt` fetch requests and return cached or fresh versions.

### P03 — Message-based check
**As** a Service Worker, **I want** to check all registered catalogs on `message: 'catalog:check'` from the client and respond with `'catalog:updated'` containing an array of updated catalogs.

### P04 — Visibility trigger
**As** a client, **I want** to call `notifyCatalogCheck()` on `visibilitychange` **so that** it triggers a check in the Service Worker.

---

## 🔄 End-to-End (Scenario)

### E01 — Full OLMUI cycle
**As** an OLMUI scenario, **I want** the full cycle: create watcher with `lastHash: 'old'` → check → detect update → auto-confirm → save state to `@nan0web/db` In-Memory → verify that `lastHash` was updated and `status === 'updated'`.

### E02 — Intent Contract
**As** an OLMUI scenario, **I want** the Intent contract to guarantee: every intent has a `type` field, ask has `schema`, log has `level` + `message`, progress has `message`.
