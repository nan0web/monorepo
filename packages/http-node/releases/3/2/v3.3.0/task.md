# v3.3.0 — Export MiddlewareFn contract type

## Scope

Експорт типу `MiddlewareFn` з головного entry point для використання іншими пакетами монорепозиторію.

## Problem

Пакет `@nan0web/db-server` використовує `MiddlewareFn` як тип для route handler функцій. Зараз цей тип визначений локально в `packages/http-node/src/server/Server.js:8` і не експортується через `index.js`. TS build `db-server` падає бо не може знайти `MiddlewareFn` у `@nan0web/http-node`.

## Tasks

### T1: Re-export MiddlewareFn from index

Додати JSDoc typedef та ре-експорт у `packages/http-node/src/index.js`:

```js
/** @typedef {import("./server/Server.js").MiddlewareFn} MiddlewareFn */

export {
	// ... existing exports ...
	MiddlewareFn,
}
```

Або додати в `packages/http-node/src/server/index.js`:

```js
export { MiddlewareFn } // need to make it a named export first
```

Перевірит який підхід краще інтегрується з поточною структурою експортів.

### T2: Verify TS generation

Перевірити що `pnpm build` генерує `types/index.d.ts` з `MiddlewareFn`:

```ts
export type MiddlewareFn = (req: IncomingMessage, res: ServerResponse, next: () => Promise<void>) => Promise<void>;
```

## Acceptance Criteria

- [ ] T1: `MiddlewareFn` експортується з головного entry point `@nan0web/http-node`
- [ ] T2: `pnpm build` проходить без помилок
- [ ] T3: Інші пакети можуть робити `import('@nan0web/http-node').MiddlewareFn`

## Architecture Audit

- [x] `MiddlewareFn` вже визначений в `Server.js:8` як JSDoc typedef
- [x] Використовується в Router, middlewares, TestServer — все всередині пакету
- [x] Потрібен лише ре-експорт, не зміна сигнатури
- [x] `IncomingMessage` та `ServerResponse` вже експортуються з index.js
