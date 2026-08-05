# 🚀 @nan0web/payload-cms.app

Універсальний додаток та TLI Index-Driven CLI генератор для автоматичної міграції доменних моделей **NaN0Web (`Model-as-Schema`)** у колекції та адмін-панель **Payload CMS 3.x**.

## 📖 Особливості:
- **Total Logic Isolation (TLI):** Динамічний імпорт `index.js` модулів доменів без сканування диска.
- **Clean Slugs:** Вилучення суфікса `Model` (`PersonModel` -> `person`, `BranchModel` -> `branch`).
- **Media Uploads:** `AttachmentModel` -> `upload: 'media'`.
- **i18n:** Двомовна локалізація `{ uk: '...', en: '...' }` для всіх меню, назв колекцій та полів.
- **UI Components:** Автоматична ін'єкція `@nan0web/ui-payload` компонентів (`ImageCell`, `MapCell`, `BooleanCell`).
