---
description: /release — Публікація пакету в NPM (Smart Test & Build & Publish)
---

// turbo-all

До релізую НЕ МАЮТЬ потрапляти так файли:

- .agent/
- .vscode/
- docs/
- src/**/*.test.js{x}
- src/test/
- src/README.md.js{x}

Мають потрапляти:

- package.json
- LICENSE
- README.md
- bin/
- src/
- types/

1. **Повна перевірка (Safety First)**: Запусти локальну перевірку пакету.

   ```bash
   pnpm test:all
   ```

2. **Публікація в NPM**: Виконай стандартний скрипт релізу.

   ```bash
   npm run release
   ```

3. **Верифікація статусів**: Перевір статус пакетів у монорепо.
   ```bash
   npm run test:status
   ```
