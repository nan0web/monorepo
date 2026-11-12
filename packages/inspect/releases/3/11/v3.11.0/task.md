---
version: 3.11.0
type: refactoring
status: complete
locale: uk
models:
  - packages/inspect/types/domain/app/ArchitectureAuditor.d.ts
  - packages/inspect/types/domain/app/BuildWorkflowsApp.d.ts
  - packages/inspect/types/domain/app/CircularDependencyAuditor.d.ts
  - packages/inspect/types/domain/app/StructureAuditor.d.ts
  - packages/inspect/types/domain/config/InspectConfig.d.ts
  - packages/inspect/types/domain/AuditorModel.d.ts
---

# 🧹 Mission: Self-Inspection Technical Hygiene & Zero-Smell Refactoring (v3.11.0)

## 🏁 Overview (Огляд)

Ліквідація історичного технічного боргу та code-smells у самому пакеті `@nan0web/inspect`, виявлених аудитором `nan0inspect packages/inspect`. 

Мета релізу — досягти **100% зеленого статусу (ALL PASS / OK)** для всіх аудиторів при самоперевірці:
1. **Phase Auditor**: Додавання обов'язкового файлу `.editorconfig` у корінь пакета `packages/inspect/`.
2. **Domain Auditor (Model-as-Schema & Zero-FS/Path Isolation)**:
   - Прибрати прямі імпорти `node:fs` та `node:path` у доменних класах:
     - `src/domain/app/ArchitectureAuditor.js`
     - `src/domain/app/BuildWorkflowsApp.js`
     - `src/domain/app/CircularDependencyAuditor.js`
     - `src/domain/app/StructureAuditor.js`
   - Перевести всі файлові операції на інжектований `this.$db` (`this._.db`).
   - Усунути надлишкове присвоєння `this.skip = data.skip` у `ArchitectureAuditor.js`.
   - Додати обов'язкові JSDoc `@type` декларації в конструкторах для статичних схемних полів:
     - `snapshots` та `rules` у `src/domain/config/InspectConfig.js`.
     - `timeout` у `src/domain/AuditorModel.js`.
3. **Verification Auditor (Test Hierarchy Standards)**:
   - Перевести плоскі виклики `test()` у канонічну ієрархію `describe() / it()` у:
     - `src/test/domain/ProjectModel.test.js`
     - `src/test/releases/3/7/v3.7.0/task.test.js`
4. **Intent & Output Hygiene**:
   - Усунути прямий виклик `console.error` у `src/ui/mcp.js`.
   - Усунути прямі виклики `console.info` у `src/docs/README.md.js`.

---

## 👥 User Stories (Сценарії)

> **Як Архітектор екосистеми NaN0Web**, я хочу запустити `nan0inspect packages/inspect` і бачити ідеальний статус `ALL OK` без жодного warning чи FAIL, щоб сам інспектор був взірцем для всіх інших пакетів монорепозиторію.

---

## 🏗 Target Files (Scope Boundary)

1. **Конфігурація та фундамент:**
   - `packages/inspect/.editorconfig`
2. **Доменні класи:**
   - `packages/inspect/src/domain/AuditorModel.js`
   - `packages/inspect/src/domain/config/InspectConfig.js`
   - `packages/inspect/src/domain/app/ArchitectureAuditor.js`
   - `packages/inspect/src/domain/app/BuildWorkflowsApp.js`
   - `packages/inspect/src/domain/app/CircularDependencyAuditor.js`
   - `packages/inspect/src/domain/app/StructureAuditor.js`
3. **Тести та UI/MCP:**
   - `packages/inspect/src/ui/mcp.js`
   - `packages/inspect/src/docs/README.md.js`
   - `packages/inspect/src/test/domain/ProjectModel.test.js`
   - `packages/inspect/src/test/releases/3/7/v3.7.0/task.test.js`
4. **Релізні документи:**
   - `packages/inspect/releases/3/11/v3.11.0/task.md`
   - `packages/inspect/releases/3/11/v3.11.0/task.spec.js`
   - `packages/inspect/releases/3/11/v3.11.0/user.md`
   - `packages/inspect/releases/3/11/v3.11.0/README.md`

---

## 🎯 Scope (Задачі релізу)

- [x] **§1 Фундаментальні файли:**
  - Створити `packages/inspect/.editorconfig` (ідентичний до кореневого стандарту монорепо).
- [x] **§2 Контрактне тестування (task.spec.js):**
  - Створити тести валідації самоінспекції пакета.
- [x] **§3 Усунення витоків fs/path та запахів у Domain:**
  - Заміна `fs`/`path` на `this.$db` у `BuildWorkflowsApp`, `CircularDependencyAuditor`, `StructureAuditor`, `ArchitectureAuditor`.
  - Додавання типізації JSDoc для `snapshots`, `rules`, `timeout`.
- [x] **§4 Тестова ієрархія та витоки консолі:**
  - Рефакторинг `ProjectModel.test.js` та `v3.7.0/task.test.js` на `describe/it`.
  - Заміна `console.error` у `mcp.js` на потік подій або безпечний лог.
- [x] **§5 Фінальна валідація:**
  - Виконання `nan0inspect packages/inspect` ➔ статус **ALL OK**.
  - Прохід `npm run test:all` (100% green).

---

## ✅ Acceptance Criteria (Definition of Done)

1. Команда `nan0inspect packages/inspect` повертає нуль помилок (Status: OK для Phase, Hygiene, Export, Domain, Verification, Circular, Snapshots, Intents).
2. Повний конвеєр `pnpm --filter @nan0web/inspect test:all` проходить без жодного збою.
