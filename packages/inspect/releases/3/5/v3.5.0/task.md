---
version: 3.5.0
type: feature
status: active
locale: uk
models:
  - packages/inspect/types/domain/AuditorModel.d.ts
  - packages/inspect/types/domain/app/js/JsHygieneAuditor.d.ts
  - packages/ui/types/core/Intent.d.ts
---

# 🚀 Mission: Standardized TSConfig Profiles & Zero-Hallucination Package Auditors (v3.5.0)

## 🏁 Overview (Огляд)

Формалізація архітектурних інспекторів та стандартів типізації платформи:
1. **Три канонічні профілі `tsconfig.json`**:
   - `Node` (backend, DB, CLI, Types): `module: nodenext`, `moduleResolution: nodenext`, `lib: ["esnext"]`.
   - `React/JSX` (UI packages, Next.js, apps): `moduleResolution: bundler`, `jsx: react-jsx`, `lib: ["dom", "dom.iterable", "esnext"]`.
   - `Lit/Web DOM` (Web Components): `moduleResolution: bundler/nodenext`, без JSX, але з `dom` бібліотекою.
2. **Контракт Result Intent (`ok: true/false`)**:
   - Узгодження результату інспекції з універсальним контрактом `ResultData`: `ok: boolean`, `message: string`, `reason: string`, `error: string | number`, `data: any`.
3. **Підсилення детермінованих інспекторів (`JsHygieneAuditor` & `JsExportAuditor`)**:
   - Перевірка та авто-фікс `package.json#files` (наявність `types/**/*.d.ts`, виключення `*.spec.js`, `*.test.js`).
   - Перевірка `package.json#exports` (пари `types` + `import` для кожного subpath).
   - Верифікація `tsconfig.json` за відповідним профілем та наявності `declaration: true`, `emitDeclarationOnly: true`, `outDir: ./types`.
4. **Контекст Декларацій (`.d.ts First`)**:
   - Усі агенти та інспектори в першу чергу зчитують `.d.ts` файли замість сирцевих `.js` для швидкої та безпомилкової синхронізації API.

---

## 👥 User Stories (Сценарії)

> **Як Архітектор платформи**, я хочу мати 3 чіткі стандартизовані профілі `tsconfig.json` (Node, React, Lit), щоб уникнути помилок компіляції та споживання гігабайтів пам'яті в IDE.  
> **Як AI-асистент (АрхіТехноМаг)**, я хочу запускати `nan0inspect` після генерації коду, щоб детерміновано виправити пропущені поля в `package.json` та `tsconfig.json` без галюцинацій та витрати токенів на ручний перегляд.  
> **Як розробник**, я хочу читати компактні `types/**/*.d.ts` контракти замість тисяч рядків реалізації, щоб миттєво бачити інтерфейси моделей та інтентів.

---

## 🏗 Data-Driven Architecture (Моделі та Контракти)

### Першочерговий контекст (Declaration Files):
- [packages/inspect/types/domain/AuditorModel.d.ts](file:///Users/i/src/nan.web/packages/inspect/types/domain/AuditorModel.d.ts)
- [packages/inspect/types/domain/app/js/JsHygieneAuditor.d.ts](file:///Users/i/src/nan.web/packages/inspect/types/domain/app/js/JsHygieneAuditor.d.ts)
- [packages/ui/types/core/Intent.d.ts](file:///Users/i/src/nan.web/packages/ui/types/core/Intent.d.ts)

### Цільові файли змін (Boundary):
1. **Рецепти та документація:**
   - `docs/uk/recipes/package-types-build.md` — розділення на 3 профілі (`node`, `react`, `lit/dom`).
   - `docs/uk/recipes/tsconfig-node.md` — канонічний профіль Node.js / CLI / DB.
   - `docs/uk/recipes/tsconfig-react.md` — канонічний профіль React / JSX / Next.js.
   - `docs/uk/recipes/tsconfig-lit.md` — канонічний профіль Lit / Web Components (DOM без JSX).
2. **Логіка інспекторів у `packages/inspect`:**
   - `packages/inspect/src/domain/app/js/JsHygieneAuditor.js`:
     - Розпізнавання профілю (`react`, `lit`, `node`) за залежностями проєкту.
     - Валідація `tsconfig.json` під виявлений профіль.
     - Валідація `package.json#files` та `package.json#exports`.
     - Приведення повернення до контракту `result({ ok: boolean, data: { errors, configs, scripts } })`.
   - `packages/inspect/src/domain/app/js/JsExportAuditor.js`:
     - Перевірка наявності `types` декларацій для кожного subpath export.
3. **Контрактні тести:**
   - `packages/inspect/releases/3/5/v3.5.0/task.spec.js` — верифікація виявлення дефектів та авто-фіксу конфігурацій.

---

## 🎯 Scope (Задачі релізу)

- [x] **Крок 1: Документація та рецепти tsconfig:**
  - Створити `docs/uk/recipes/tsconfig-node.md`.
  - Створити `docs/uk/recipes/tsconfig-react.md`.
  - Створити `docs/uk/recipes/tsconfig-lit.md`.
  - Оновити `docs/uk/recipes/package-types-build.md` з посиланнями на ці профілі.
- [x] **Крок 2: Уніфікація контракту Result Intent:**
  - Оновити повернення генератора в `JsHygieneAuditor` та базових аудиторах на `result({ ok: boolean, ... })`.
- [x] **Крок 3: Розширення `JsHygieneAuditor`:**
  - Додати детекцію профілю проекту (react / lit / node).
  - Додати валідацію `package.json#files` (`src/**/*.js`, `types/**/*.d.ts`, заборона тестів).
  - Додати валідацію та авто-виправлення (`--fix`) для `tsconfig.json` відповідно до профілю.
- [x] **Крок 4: Розширення `JsExportAuditor`:**
  - Додати перевірку наявності властивості `types` у кожному підшляху `exports`.
- [x] **Крок 5: Тестування та валідація:**
  - Написати контрактний тест `packages/inspect/releases/3/5/v3.5.0/task.spec.js`.
  - Запустити повний ланцюг перевірки `pnpm run test:all`.

---

## ✅ Acceptance Criteria (Definition of Done)

1. **Три профілі формалізовані:** Файли рецептів існують у `docs/uk/recipes/` і описують точні прапорці компілятора.
2. **Result Contract узгоджено:** Інспектори повертають результат з полем `ok: boolean` згідно з `ResultData` в `@nan0web/ui`.
3. **Автоматична перевірка без LLM:** Команда `nan0inspect` (або запуск `JsHygieneAuditor`) детерміновано виявляє:
   - відсутність `types` у `exports`;
   - некоректний `tsconfig.json`;
   - сміття або відсутність `types/` у `files`.
4. **Контрактні тести зелені:** `node --test releases/3/5/v3.5.0/task.spec.js` проходить з кодом `0`.
5. **Types згенеровані:** `pnpm build` оновлює `.d.ts` файли у директорії `types/`.
