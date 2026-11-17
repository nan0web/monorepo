# Реліз v3.9.1 — Виправлення встановлення MCP для Google Antigravity

## Мета
Виправити `InstallApp` у `@nan0web/inspect`, щоб команда `nan0inspect install` коректно реєструвала `nan0web-inspect` MCP-сервер для Google Antigravity.

## Задачі
1. Змінити шлях конфігурації `antigravity` з `.gemini/antigravity/mcp/config` (який зберігався як `.nan0`) на `.gemini/config/mcp_config.json` (стандартний JSON-конфіг Antigravity).
2. Змінити шлях до `mcp.js` у `args` на абсолютний шлях (через `fileURLToPath(new URL('../../ui/mcp.js', import.meta.url))` або `path.resolve`), щоб MCP-сервер працював незалежно від поточної робочої директорії.

## Target Files
- `packages/inspect/src/domain/app/InstallApp.js`
- `packages/inspect/src/domain/app/InstallApp.test.js` (якщо існує, або оновити тести)
