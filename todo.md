# TODO — Contract Exports

## Blockers (other packages depend on these)

### 1. `@nan0web/log` — missing `ConsoleLike` type
- **File:** `packages/log/src/index.js`
- **Need:** Export `ConsoleLike` typedef (`{ info, error, warn, debug }`)
- **Used by:** `packages/db-server/src/DBServer.js` (logger param type)
- **Status:** ⬜ Not exported

### 2. `@nan0web/http-node` — missing `MiddlewareFn` type
- **File:** `packages/http-node/src/server/Server.js:8`
- **Need:** Re-export `MiddlewareFn` typedef from main index
- **Current:** Defined locally in `Server.js`, not re-exported via `index.js`
- **Used by:** `packages/db-server/src/DBServer.js` (route handler types)
- **Status:** ⬜ Not exported

---

## Releases needed

| Package | Task | Depends On |
|---------|------|------------|
| `@nan0web/log` | Add & export `ConsoleLike` typedef | — |
| `@nan0web/http-node` | Re-export `MiddlewareFn` from index | — |
| `@nan0web/db-server` | Fix TS build using new contracts | log + http-node |
