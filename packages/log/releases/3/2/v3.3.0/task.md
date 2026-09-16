# v3.3.0 — Export ConsoleLike contract type

## Scope

Експорт універсального логер-контракту для використання іншими пакетами монорепозиторію.

## Problem

Пакет `@nan0web/db-server` потребує типу логера (`logger.info`, `logger.error`) але `Console` з Node.js недоступний у strict TypeScript mode з `checkJs: true`. Це ламає TS build для всіх пакетів що використовують `@nan0web/log` як залежність.

## Tasks

### T1: Add ConsoleLike typedef

Додати JSDoc typedef у `packages/log/src/index.js`:

```js
/**
 * @typedef {Object} ConsoleLike
 * @property {(msg: string, ...args: any[]) => void} info
 * @property {(msg: string, ...args: any[]) => void} error
 * @property {(msg: string, ...args: any[]) => void} warn
 * @property {(msg: string, ...args: any[]) => void} debug
 */
```

Тип має бути мінімальним — лише методи які реально використовуються споживачами. Не копіювати весь `Console` інтерфейс.

### T2: Export ConsoleLike from index

Додати `ConsoleLike` до експорту в `packages/log/src/index.js`:

```js
export { LogConsole, Logger, LoggerFormat, NoConsole, NoLogger, ConsoleLike }
```

### T3: Verify TS generation

Перевірити що `pnpm build` генерує `types/index.d.ts` з `ConsoleLike`:

```ts
export type ConsoleLike = {
    info: (msg: string, ...args: any[]) => void;
    error: (msg: string, ...args: any[]) => void;
    warn: (msg: string, ...args: any[]) => void;
    debug: (msg: string, ...args: any[]) => void;
};
```

## Acceptance Criteria

- [ ] T1: `ConsoleLike` typedef існує в `src/index.js`
- [ ] T2: `ConsoleLike` експортується з головного entry point
- [ ] T3: `pnpm build` проходить без помилок
- [ ] T4: Інші пакети можуть робити `import('@nan0web/log').ConsoleLike`

## Architecture Audit

- [x] `Console` з `node:http` недоступний у strict TS + checkJs
- [x] `NoConsole` існує але це клас, не контракт
- [x] `Logger` існує але це повноцінний клас, надто важкий для контракту
- [x] ConsoleLike — мінімальний інтерфейс, підходить для peer dependencies
