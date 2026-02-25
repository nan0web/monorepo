---
description: /release — Публікація пакету в NPM (Smart Test & Build & Publish)
---

// turbo-all

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
