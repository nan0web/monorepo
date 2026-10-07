---
version: 3.4.3
type: fix
status: done
locale: uk
models: ["PayloadApp", "SeedModel", "ImageCell", "BooleanCell", "MapCell"]
---

# 🚀 Реліз v3.4.3: Model-as-App та UI Пісочниця у @nan0web/ui-payload

## 🏁 Огляд (Overview)
- Приведення `PayloadApp` та `SeedModel` до 100% суворого стандарту `Model-as-App`:
  - Динамічний імпорт `payload` без навантаження на клієнт/браузер.
  - Гетери `this.$db` та `this.$payload` з локалізованими помилками (`this._.t`).
  - Відмова від прямого `this._.db` у `SeedModel.js`.
- Створення легкої та наочної пісочниці `play/` з таблицею клітинок Payload CMS (`ImageCell`, `BooleanCell`, `MapCell`) на реальних демонстраційних даних без роздування важкими залежностями.
- Синхронізація конфігурацій `tsconfig.json` (профіль `react`), `knip.json`, `package.json` та забезпечення 100% проходження `nan0inspect audit .`.

## 👥 Сценарії (User Stories)
- Як розробник, я можу запустити `pnpm --filter @nan0web/ui-payload play`, щоб побачити візуалізацію та поведінку клітинок таблиці Payload CMS.
- Як архітектор, я можу виконати інспекцію пакета через `nan0inspect audit .` без збоїв чи скарг на відсутність конфігів/майданчика.
- Як інженер бекенду, я можу використовувати `SeedModel` та `PayloadApp` із гарантією чистого `this.$db` та безпечного резолвінгу Payload.

## 🎯 Сфера робіт (Scope)
- [x] Оновити `src/domain/PayloadApp.js`: динамічний імпорт `payload`, гетери `$db` та `$payload`.
- [x] Оновити `src/domain/SeedModel.js`: використання `this.$db` та `this._.t`.
- [x] Створити пісочницю `play/`:
  - `play/index.html` та `play/App.jsx` з таблицею в стилі Payload CMS.
  - `play/main.js` з підтримкою headless/CLI запуску.
  - `play/data/` з локалізацією `index.yaml`, `_/langs.yaml`, `_/t.yaml`, `uk/_/t.yaml`.
- [x] Додати стандартні конфіги:
  - `tsconfig.json` (react-профіль).
  - `knip.json`.
- [x] Оновити `package.json` (версія 3.4.3, скрипти `play`, `inspect`, `test:coverage`, `test:docs`).
- [x] Написати контрактні тести в `releases/3/4/v3.4.3/task.spec.js` і довести їх до Green.

## ✅ Критерії Прийомки (DoD)
- [x] `task.spec.js` повністю проходить (`pnpm run release:spec`).
- [x] `pnpm --filter @nan0web/ui-payload test:all` зелений.
- [x] `nan0inspect audit .` у директорії пакета проходить без критичних помилок (100% OK на всіх аудиторах).
