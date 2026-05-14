---
description: Гігієна пакету — обовʼязкові скрипти, конвеєр test:all, knip, .npmignore
---

# 🧹 Гігієна Пакету (Package Hygiene)

## 1. Обов'язкові скрипти у кожному пакеті

- `"knip": "knip --production"` — перевірка невикористаних файлів, експортів та залежностей.
- `"audit": "pnpm audit --prod || true"` — інформативна перевірка вразливостей. `|| true` бо `pnpm audit` monorepo-wide — вразливості сусідніх пакетів не повинні блокувати реліз.
- `"release:spec": "node --test \"releases/**/*.spec.js\""` — контрактні тести відкритого релізу.
- `"test:release": "node --test \"src/test/releases/**/*.test.js\""` — регресійні тести закритих релізів.

## 2. Повний конвеєр (`test:all`)

```
test → test:docs → build → test:release → knip → audit
```

- Всі кроки через `&&` — мають бути зеленими.

## 3. Knip Конфігурація (`knip.json`)

- `entry`: головний `src/index.js`.
- `ignore`: `play/`, `releases/`, `types/`, `src/README.md.js`.
- `ignoreDependencies`: dev-інструменти (`husky`, `@nan0web/test`, тощо).

## 4. `.npmignore` (ОБОВ'ЯЗКОВО у кожному пакеті)

Без `.npmignore` npm використовує `.gitignore`, що пропускає dev-артефакти в публікацію.
Мінімальний шаблон:

```
# Tests
src/**/*.test.js
src/test/
types/test/

# ProvenDoc generator
src/README.md.js

# Dev files
play/
releases/
docs/
knip.json
system.md
next.md
tsconfig.json
.editorconfig
CONTRIBUTING.md

# LLiMo / AI artifacts
chat/
.datasets/
me.md

# Generated
dist/
.cache/
```

**Перевірка**: `npm pack --dry-run` перед кожним `npm publish`.
