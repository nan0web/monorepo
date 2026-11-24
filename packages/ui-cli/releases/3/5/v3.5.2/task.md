---
version: 3.5.2
type: patch
status: done
locale: uk
models:
  - modelFromArgv
---

# 🔧 Mission: Kebab-case & Long Alias Support in modelFromArgv (v3.5.2)

## 🏁 Overview (Огляд)

Патч-реліз `v3.5.2` для `@nan0web/ui-cli` виправляє парсинг аргументів у `modelFromArgv`:
- Автоматично реєструє `kebab-case` версії для всіх `camelCase` полів моделі (наприклад, `chunkDuration` → `--chunk-duration`).
- Автоматично реєструє довгі `alias` (`alias.length > 1`, наприклад `alias: 'initial-prompt'`, `alias: 'model'`) у `parseArgs` та мапить їхні значення назад на основні ключі моделі.

## 📂 Target Files

- `packages/ui-cli/releases/3/5/v3.5.2/task.md` `[NEW]`
- `packages/ui-cli/releases/3/5/v3.5.2/user.md` `[NEW]`
- `packages/ui-cli/releases/3/5/v3.5.2/task.spec.js` `[NEW]`
- `packages/ui-cli/src/ui/core/modelFromArgv.js` `[MODIFY]`
