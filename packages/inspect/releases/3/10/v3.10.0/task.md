---
version: 3.10.0
type: feature
status: done
locale: uk
models:
  - packages/inspect/types/domain/app/InstallApp.d.ts
  - packages/inspect/types/domain/app/InspectorApp.d.ts
---

# 🚀 Mission: Cross-Editor Zero-Hallucination Installer & MCP Bridge (v3.10.0)

## 🏁 Overview (Огляд)

Створення детермінованого інтерактивного інсталятора `nan0inspect install` (та діагностики `nan0inspect doctor`), який автоматично виявляє встановлені середовища розробки (Google Antigravity, Cursor, VS Code, Claude Desktop, Windsurf) та безпечно конфігурує інтеграцію MCP-сервера `@nan0web/inspect`:

1. **Автоматична детекція встановлених AI-середовищ (Editor Discovery)**:
   - Перевірка наявності конфігураційних шляхів:
     - **Google Antigravity**: `~/.gemini/antigravity/mcp/`
     - **Cursor IDE**: `~/.cursor/` або `.cursor/mcp.json`
     - **VS Code / Windsurf**: `.vscode/settings.json` або `.vscode/mcp.json`
     - **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Табличний вивід статусу детекції через OLMUI `Table` (`@nan0web/ui`).

2. **Безпечне налаштування MCP (Deep Merge Config)**:
   - Реєстрація сервера `nan0web-inspect` (`packages/inspect/src/ui/mcp.js`) без перезапису існуючих налаштувань користувача.
   - Експозиція інструментів: `inspect_api_contract`, `inspect_architecture`, `inspect_domain`, `inspect_hygiene`, `inspect_phase`.

3. **Діагностика та Health Check (`nan0inspect doctor`)**:
   - Валідація згенерованих JSON-файлів у знайдених середовищах.
   - Тестовий виклик MCP-сервера (stdio ping) для підтвердження готовності.
   - Підсумковий звіт із зеленою плашкою готовності для агентів.

---

## 👥 User Stories (Сценарії)

> **Як Розробник або Архітектор**, я хочу виконати `nan0inspect install`, щоб за 2 секунди підключити інспектори монорепозиторію до свого Cursor або Antigravity без ручного редагування JSON-файлів.  
> **Як ШІ-агент у новому чаті**, я хочу викликати `nan0inspect doctor`, щоб переконатися, що мої інструменти доступні в активному редакторі, усунувши будь-яку "містику" з ненаданими можливостями.

---

## 🏗 Data-Driven Architecture (Моделювання)

### Першочергові контракти:
- `packages/inspect/releases/3/10/v3.10.0/task.spec.js`
- `packages/inspect/src/domain/app/InstallApp.js`
- `packages/inspect/src/domain/app/DoctorApp.js`
- `packages/inspect/src/domain/app/InspectorApp.js`
- `packages/inspect/src/ui/mcp.js`

### Цільові файли (Scope Boundary):
1. **Реліз та контракти:**
   - `packages/inspect/releases/3/10/v3.10.0/task.md`
   - `packages/inspect/releases/3/10/v3.10.0/user.md`
   - `packages/inspect/releases/3/10/v3.10.0/task.spec.js`
   - `packages/inspect/releases/3/10/v3.10.0/README.md`
2. **Доменна логіка:**
   - `packages/inspect/src/domain/app/InstallApp.js`
   - `packages/inspect/src/domain/app/DoctorApp.js`
   - `packages/inspect/src/domain/app/InspectorApp.js`
   - `packages/inspect/src/ui/mcp.js`
3. **Експорти:**
   - `packages/inspect/src/domain/index.js`
   - `packages/inspect/package.json`

---

## 🎯 Scope (Задачі релізу)

- [x] **§1 Контрактне тестування (TDD Red):**
  - Створити `releases/3/10/v3.10.0/task.spec.js`:
    - Детекція встановлених редакторів через In-Memory DB (`@nan0web/db`).
    - Безпечний deep merge конфігурацій (не затирає існуючі сервери).
    - Інтеграція підкоманд `install` та `doctor` у `InspectorApp`.
    - Робота інструменту `inspect_api_contract` через MCP.
- [x] **§2 Реалізація `InstallApp`:**
  - Сканування файлової системи (`@app`, `~`).
  - Генерація конфігів під Antigravity, Cursor, VS Code, Claude.
  - Рендер результату через OLMUI `Table`.
- [x] **§3 Реалізація `DoctorApp`:**
  - Діагностика валідності JSON-файлів конфігів.
  - Smoke test MCP-сервера.
- [x] **§4 Розширення `src/ui/mcp.js`:**
  - Додавання інструменту `inspect_api_contract` (викликає `FastApiDiscovery`).
- [x] **§5 Верифікація та документація:**
  - Повний прохід `pnpm run test:all`.
  - Оновлення документації та галереї релізу `README.md`.

---

## ✅ Acceptance Criteria (Definition of Done)

1. **TDD Green:** Усі тести в `releases/3/10/v3.10.0/task.spec.js` проходять (`pass`).
2. **Безпека даних:** Інсталятор ніколи не перезаписує існуючі сервери користувача у `mcp.json` чи `settings.json`.
3. **Табличний UI:** Вивід списку середовищ через OLMUI `Table`.
4. **Повна валідація:** `pnpm run test:all` виконується без жодної помилки.
