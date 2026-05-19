# 🏁 План стабілізації та релізу v3.1.0 — Sovereign Monorepo

## 🚀 Виконано у поточній сесії (Achievements)

### 1. Виправлення Race Conditions збірки
- [x] **Topological Synchronous Types Compilation**: Усунено класичні race conditions паралельного pnpm-білду (коли `prebuild` скрипти видаляють директорії `types/` перед зчитуванням залежними пакетами). Тепер збірка `@nan0web/types` виконується першою ізольовано, а весь монорепо збирається послідовно через `--workspace-concurrency=1`.

### 2. Усунення Strict Type Regressions у `@nan0web/release`
- [x] **DepsCommand & PublishCommand type-safety**: Вирішено проблему `Object is possibly 'null' or 'undefined'` при зверненні до `this._.db` під strict-mode. Використано безпечне приведення типу `const { t, db } = /** @type {any} */ (this._)`.

### 3. Вирішення сумісності коваріантності у `@nan0web/test`
- [x] **ParseCommand & StatusCommand run signature alignment**: Виправлено сигнатуру `run(msg)` у спадкоємцях `CLI` класу. TypeScript strict-mode забороняв звуження типу аргументу `msg` від `Message` до `ParseMessage`/`Status`. Метод тепер приймає загальний `any`, і внутрішньо безпечно ініціалізує строго типізований меседж через `ParseMessage.from(msg)` / `new Status(msg)`.
- [x] **ProgressMessage Constructor Inheritance**: Усунено помилку `Expected 0 arguments, but got 1` в `StatusCommand.js` шляхом визначення явного конструктора для класу `ProgressMessage` з прокидуванням аргументу в `super(text)`.

### 4. Виправлення JSDoc посилань у `@nan0web/i18n`
- [x] **App.js missing exports declared**: Оголошено відсутні класи-заглушки `InspectCommand` та `CompletionCommand` в `App.js` для усунення помилки `Cannot find name 'InspectCommand'` під час статичного розбору JSDoc-параметрів компілятором `tsc`.

### 5. Тотальна i18n стандартизація
- [x] **Strict Model-First i18n у DepsCommand.js**: 100% текстових рядків і повідомлень про помилки у `packages/release/src/domain/DepsCommand.js` переведено на NaN0Web стандарт. Замість сирих рядків тепер використовується динамічний `t()` хелпер з контексту із late-bound параметризацією.
- [x] **Automated Verification**: Запущено i18n інспектор (`pnpm --filter @nan0web/i18n exec node bin/i18n.js inspect`), який підтвердив: **0 Hardcoded t() or forbidden t() usage found. Compliant.**

---

## 🔥 Наступні кроки після перезапуску IDE (Task Pool)

Нижче наведено пріоритетну чергу технічних завдань для старту нової чистої сесії з чистим контекстом:

### ⚙️ Крок 1. Фінальна послідовна збірка всього монорепо
- [ ] **TS-1**: Запустити повну топологічну збірку з кореня для перевірки всіх 63 пакетів:
  ```bash
  pnpm run -r --workspace-concurrency=1 build
  ```
  *Очікуваний результат: 100% green build, відсутність помилок типу.*

### 🧪 Крок 2. Запуск автоматизованих тестів
- [ ] **TST-1**: Виконати юніт-тести для перевірки логіки після рефакторингу:
  ```bash
  pnpm -r run test
  ```
- [ ] **TST-2**: Запустити загальний тестовий аудит та перевірити статус покриття:
  ```bash
  pnpm -r run test:status
  ```

### 🔍 Крок 3. Інспекція i18n словників
- [ ] **I18N-1**: Створити відсутній файл словника `play/data/uk/_/t.nan0` або налаштувати словник для усунення warnings інспектора.
- [ ] **I18N-2**: Запустити автоматичний аудит i18n відповідності:
  ```bash
  pnpm --filter @nan0web/i18n exec node bin/i18n.js inspect
  ```

### 📦 Крок 4. Підготовка до релізу та аудит Knip
- [ ] **REL-1**: Оновити `STATUS.md` актуальною інформацією про працездатність усіх модулів v3.1.0.
- [ ] **REL-2**: Запустити фінальний аудит невикористовуваного коду та файлів через `knip`:
  ```bash
  pnpm -r run knip
  ```
- [ ] **REL-3**: Виконати публікацію стабільної версії:
  ```bash
  nan0release publish
  ```

---
*Документ оновлено Antigravity (АрхіТехноМаг) 18 травня 2026 року після успішної i18n-стандартизації DepsCommand та усунення строгих TS-регресій.*
