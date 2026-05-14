# 📦 Release v1.7.1: UI Models Migration to Model-as-Schema (extends Model)

[English Translation](task.en.md)

**🎯 Scope:** Refactoring / Architecture Alignment
- Замінити ручний `resolveDefaults(Model, data)` в 11 моделях UI на спадкування `extends Model` з пакету `@nan0web/core`.
- Видалити ініціалізацію instance полів для коректної роботи `super()` в ES classes (через gotcha).
- Зберегти строгу типізацію полів через `/** @type {T} */ this.field` безпосередньо в конструкторі.
- Оновити тестовий пакет `ui/adopt-agent` з тими ж правилами для 3 моделей.

**✔️ Acceptance Criteria:**
- Усі 11 моделей UI (InputModel, SelectModel, ToastModel тощо) наслідують `Model`.
- Усі 3 моделі `adopt-agent` наслідують `Model`.
- Усі 171 тести (`npm run test:all`) проходять без збоїв.
- `Knip` та `tsc` не видають помилок типізації.

**Architecture Audit (Чекліст)**:
- [x] Чи прочитано Індекси екосистеми? Так.
- [x] Чи існують аналоги в пакетах? Це безпосередня інтеграція базової архітектури NaN•Web.
- [x] Джерела даних: YAML, nano, md, json, csv? Ні (тільки JS/TS файли моделей).
- [x] Чи відповідає UI-стандарту (Deep Linking)? Не порушує існуючий UI.
