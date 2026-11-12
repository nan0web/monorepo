---
version: 3.9.0
type: feature
status: done
locale: uk
models:
  - packages/inspect/types/domain/ast/FastApiDiscovery.d.ts
  - packages/inspect/types/domain/app/FastApiApp.d.ts
  - packages/inspect/types/domain/app/InstallApp.d.ts
  - packages/inspect/types/domain/app/DoctorApp.d.ts
  - packages/inspect/types/domain/app/InspectorApp.d.ts
  - packages/inspect/types/domain/app/ArchitectureAuditor.d.ts
  - packages/inspect/types/domain/app/BuildWorkflowsApp.d.ts
  - packages/inspect/types/domain/app/CircularDependencyAuditor.d.ts
  - packages/inspect/types/domain/app/StructureAuditor.d.ts
  - packages/inspect/types/domain/config/InspectConfig.d.ts
  - packages/inspect/types/domain/AuditorModel.d.ts
---

# 🚀 Mission: Fast API Discovery, Editor Installer, MCP Bridge & Technical Hygiene (v3.9.0)

## 🏁 Overview (Огляд)

Комплексний монолітний реліз `@nan0web/inspect@3.9.0`, який об'єднує ключові можливості взаємодії з сучасними AI-середовищами (Google Antigravity, Cursor, VS Code, Claude Desktop), надшвидку екстракцію AST-контрактів та повне самоочищення архітектурної гігієни інспектора:

1. **Fast API Discovery & Skeleton AST Contractor**:
   - Екстракція контрактів файлів декларацій (`.d.ts`) та сирців без тіл функцій і реалізації (`FastApiDiscovery`).
   - Підтримка опцій `--level <classes|methods|fields|all>`, `--only <static|async|methods|fields>`, `--include-deps`.
   - Підкоманда CLI `nan0inspect api <path>` / `outline <path>` у форматі Nano/YAML для збереження 90% контексту моделей.

2. **Cross-Editor Installer & MCP Bridge**:
   - Автоматична детекція встановлених AI-середовищ (Google Antigravity, Cursor, VS Code, Windsurf, Claude Desktop).
   - Команда `nan0inspect install` із безпечним deep-merge налаштувань у конфігураційні файли середовищ (не затирає існуючі сервери).
   - Діагностика середовища `nan0inspect doctor` з OLMUI Table виводом.
   - MCP-сервер `nan0web-inspect` (`src/ui/mcp.js`) з інструментами `inspect_architecture`, `inspect_domain`, `inspect_hygiene`, `inspect_phase` та `inspect_api_contract`.

3. **Zero-Smell Refactoring & Self-Inspection Technical Hygiene**:
   - Повна ізоляція доменного шару від прямого виклику `node:fs` та `node:path` через інжектований `this.$db`.
   - Додавання обов'язкового `.editorconfig`.
   - Очищення JSDoc типізації конструкторів схем (`timeout`, `snapshots`, `rules`) у `AuditorModel` та `InspectConfig`.
   - Усунення прямого виведення у консоль у `src/docs/` та `src/ui/mcp.js`.

---

## 👥 User Stories (Сценарії)

> **Як ШІ-агент (АрхіТехноМаг)**, я хочу запустити `nan0inspect api packages/.../MyModel.d.ts --level methods`, щоб отримати компактні сигнатури методів без засмічення контексту вихідним кодом.  
> **Як Розробник**, я хочу виконати `nan0inspect install`, щоб за 2 секунди підключити інспектори монорепозиторію до свого Antigravity чи Cursor без ручного редагування JSON.  
> **Як Архітектор**, я хочу запустити `nan0inspect packages/inspect` і бачити ідеальний статус `ALL OK` без warning чи smell, щоб сам інспектор був еталоном для монорепо.

---

## 🏗 Data-Driven Architecture (Моделювання)

### Ключові контракти:
- `packages/inspect/releases/3/9/v3.9.0/task.spec.js`
- `packages/inspect/src/domain/ast/FastApiDiscovery.js`
- `packages/inspect/src/domain/app/FastApiApp.js`
- `packages/inspect/src/domain/app/InstallApp.js`
- `packages/inspect/src/domain/app/DoctorApp.js`
- `packages/inspect/src/domain/app/InspectorApp.js`
- `packages/inspect/src/ui/mcp.js`

---

## 🎯 Scope (Задачі релізу)

- [x] **§1 Fast API Discovery:**
  - Реалізація `FastApiDiscovery` (TypeScript AST Parser).
  - Підтримка опцій `--level`, `--only`, `--include-deps`.
  - CLI інтеграція `nan0inspect api` та `outline` з серіалізацією Nano/YAML.
- [x] **§2 Cross-Editor Installer & MCP Bridge:**
  - Реалізація `InstallApp` (сканування `~/.gemini/antigravity`, `.cursor`, `.vscode`, `Claude`).
  - Безпечний Deep Merge конфігурацій.
  - Реалізація `DoctorApp` діагностики.
  - MCP інструмент `inspect_api_contract`.
- [x] **§3 Self-Inspection Hygiene:**
  - Створення `packages/inspect/.editorconfig`.
  - Усунення імпортів `fs`/`path` у домені (`StructureAuditor`, `BuildWorkflowsApp`, `CircularDependencyAuditor`, `ArchitectureAuditor`).
  - JSDoc `@type` декларації для схемних полів `AuditorModel` та `InspectConfig`.
  - Усунення витоків `console.error` / `console.info`.
- [x] **§4 Фінальна валідація:**
  - TDD Контракт `releases/3/9/v3.9.0/task.spec.js` (17/17 pass).
  - Повний цикл `pnpm test:all` (100% green, knip clean, tsc clean).

---

## ✅ Acceptance Criteria (Definition of Done)

1. Контрактний тест `releases/3/9/v3.9.0/task.spec.js` проходить на 100%.
2. Команди `nan0inspect api`, `nan0inspect install`, `nan0inspect doctor` працюють штатно.
3. Повний конвеєр `pnpm --filter @nan0web/inspect test:all` виконується без жодної помилки.
