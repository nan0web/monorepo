# Реліз v3.6.0 — Команда `nan0ai install` та спільна детекція редакторів

## Мета
Реалізувати команду `nan0ai install` у `@nan0web/ai` за архітектурою `ModelAsApp` / OLMUI як єдине джерело правди для виявлення встановлених AI-редакторів, безпечного встановлення MCP-серверів (`nan0web-knowledge` без перезатирання існуючих) та синхронізації скілів. Доменна логіка має бути повністю агностичною до `node:os` / `process` і працювати виключно через віртуальні маунти `this.$db`.

## Архітектурні рішення (Bootstrap vs Domain)
1. **Рівень Bootstrap (`packages/ai/bin/nan0ai.js`):**
   - Прибрати зайвий пошук `pnpm-workspace.yaml` та ручний запис `context.nan0`.
   - Саме тут (на рівні інфраструктури CLI) визначається поточна ОС (`process.platform`, `os.homedir()`, `process.env.APPDATA`) та монтуються глобальні й локальні точки в `DB`:
     - `@gemini` → `~/.gemini`, `@gemini-local` → `<cwd>/.gemini`
     - `@cursor` → `~/.cursor`, `@cursor-local` → `<cwd>/.cursor`
     - `@vscode` → `~/.vscode`, `@vscode-local` → `<cwd>/.vscode`
     - `@claude` → канонічний шлях Claude Desktop для поточної ОС (`~/Library/Application Support/Claude` для `darwin`, `~/.config/Claude` для `linux`, `%APPDATA%/Claude` для `win32`).
   - Передати `db` у `bootstrapApp(AiAppModel, { db, appName: 'nan0ai' })`.

2. **Рівень Домену (`EditorDetector` у `packages/ai/src/domain/EditorDetector.js`):**
   - Повністю агностичний до `process` та `os` (жодних `getHomedir()` чи `process.platform`).
   - Використовує виключно віртуальні маунти `this.$db`:
     - Antigravity: `@gemini/config/mcp_config.json`, скіли `@gemini/config/skills` (глобально) / `@gemini-local/skills` (локально).
     - Cursor: `@cursor-local/mcp.json` (fallback `@cursor-local`, `@cursor`), скіли `@cursor/rules` / `@cursor-local/rules`.
     - VS Code: `@vscode-local/settings.json`, скіли `@vscode/skills` / `@vscode-local/skills`.
     - Claude Desktop: `@claude/claude_desktop_config.json` (або `@claude-mac`, `@claude-linux`, `@claude-win` за потреби).
   - Експортувати `EditorDetector` з `@nan0web/ai`.

3. **Команда `nan0ai install` (`InstallApp` у `packages/ai/src/domain/InstallApp.js`):**
   - `ModelAsApp`-підкоманда (`install`) у `AiAppModel`.
   - Параметр `global` (`-g`, boolean, default `false`) визначає, чи ставити скіли глобально (`@gemini/config/skills`, `@cursor/rules`, `@vscode/skills`) чи локально (`@gemini-local/skills`, `@cursor-local/rules`, `@vscode-local/skills`).
   - Безпечно додає `nan0web-knowledge` (`this.$db.location('@app/bin/mcp-server.js')`) до існуючих `mcpServers` / `mcp.servers` без перезатирання сторонніх серверів.
   - Джерело скілів: `@app/docs/uk/workflows` (у межах пакета `@nan0web/ai`, без прив'язки до зовнішнього workspace).

## Критерії прийомки (Definition of Done)
- Контрактні тести `task.spec.js` (TDD Red -> Green) на In-Memory `@nan0web/db` з віртуальними маунтами `@gemini`, `@gemini-local`, `@cursor`, `@cursor-local`, `@vscode`, `@vscode-local`, `@claude`, `@app`.
- `pnpm --filter @nan0web/ai run release:spec` та `pnpm --filter @nan0web/ai run test:all` проходять без помилок.
- `pnpm --filter @nan0web/ai run inspect` проходить без помилок для нових модулів.
