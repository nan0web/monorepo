---
name: release-backlog
version: 3.8.0
type: architecture
status: active
locale: uk
---

# 📚 Backlog: @nan0web/release

> **Опис:** Центральний беклог задач, архітектурних рішень та планових релізів пакету `@nan0web/release`.

---

## 🎯 1. Пріоритезовано до Наступного Релізу (Next Release v3.9.0)

### 📌 Реліз v3.9.0: Консолідація Єдиної Моделі Задач (Unified TaskModel & AST Engine)

- [ ] **[TASK-UNIFY] Консолідація `ReleaseTaskModel` та `TaskModel` у єдиний канонічний `TaskModel`**:
  - Уніфікувати `packages/release/src/domain/Task/TaskModel.js` та `packages/release/src/domain/models/ReleaseTaskModel.js`.
  - Забезпечити повну сумісність: `ReleaseTaskModel` є аліасом або фасеткою `TaskModel`.
  - Підтримка AST-парсингу чекбоксів (`[ ]`, `[>]`, `[x]`, `[-]`), метаданих-бейджів (`project`, `L`, `F`, `D`, `S` формули $P(x)$) та релізних метрик (`estimateHours`, `spentHours`, `assignee`).
- [ ] **[ZERO-DRIFT-ROUNDTRIP] Стабілізація `MarkdownRoundTripAuditor`**:
  - Гарантія 100% збереження вихідного форматування Markdown при перемиканні статусів задач.
- [ ] **[OLMUI-SWIFTBAR] Експорт чистих адаптерів для UI-оточень**:
  - Надання API/CLI контролера для легких View-адаптерів (SwiftBar, Raycast, BitBar, Web).
- [ ] **[INSPECT-FALSE-POSITIVES] Покращення `nan0inspect` (ігнорування `.md.js`, `.story.js` та чисел `#101`)**:
  - Налаштувати інспектори, щоб файли `*.md.js` (ProvenDocs) та `*.story.js` не перевірялися на `console.info` як UI-компоненти, а номери `#101` у рядках не сприймалися як hex-кольори.
- [ ] **[EXPORTS-NAMED-ONLY] Міграція `export default` на named exports (`ExportAuditor`)**:
  - Замінити `export default` на іменовані експорти у ~40 файлах (`src/Release.js`, `src/domain/*`, `src/adapters/*`) зі збереженням зворотної сумісності та оновленням тестів/бінарників, після чого прибрати `exports` зі `skip` у `inspect.config.nan0`.
