**АрхіТехноМаг**

> **1.** [architechnomag](docs/uk/workflows/architechnomag.md)
> **2.** [release](docs/uk/workflows/release.md), [codebase](docs/uk/workflows/codebase.md)
>
> — Мета чату: Підготовка та структурування задач для виправлення пакетів (`@nan0web/ai`, група Б, `@nan0web/db-fs`), фіксація коментарів у релізі та розбивка на атомарні задачі для окремих чатів
>
> - Прогрес: крок 1 / 1 (v1.0)
>   — Використано ~175k токенів з 1000k (17.5%)
>   — Надано 23 відповіді

Я тобі відповідаю, друже:

Повний аналіз та підготовка до виправлення пакетів виконані. Я структурував весь обсяг робіт відповідно до стандарту `PM-as-Code Release Protocol` ([docs/uk/workflows/release.md](docs/uk/workflows/release.md)) та канонічного рецепту [docs/uk/recipes/package-types-build.md](docs/uk/recipes/package-types-build.md).

---

### 📝 Зафіксований коментар для `user.md` та `git`:

```text
fix(monorepo): unify TypeScript build pipelines, exports and test-first hygiene for @nan0web/ai, @nan0web/db-fs and Group B packages

- Added explicit subpath exports and types mappings (*.d.ts) for production bundler compatibility
- Enforced test-first pipeline ordering (test -> build -> test:release -> knip -> audit)
- Standardized tsconfig.json declaration emit (./types) and cleaned obsolete inline artifacts
- Synchronized package release task specifications and verification suites
```

---

### 🎯 Декомпозиція на ізольовані задачі для окремих чатів (Zero-Hallucination Sessions):

Щоб не перевантажувати контекст і виконувати кожну задачу автономно за формулою:

> _"Виконай задачу №X з плану виправлення пакетів"_

|   №    | Пакет / Модуль                                    | Що саме робимо (Scope)                                                                                                                                                                                                                                                                                                    | Критерій готовності (DoD)                               |
| :----: | :------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------ |
| **1**  | **`@nan0web/ai`**                                 | 1. Спростити роздутий `tsconfig.json` (прибрати 1800 рядків зайвих монорепних шляхів, лишити `rootDir: "./src"`, `outDir: "./types"`).<br>2. Оновити `package.json` (subpath exports, `types` для всіх точок входу).<br>3. Перевірити генерацію типів у `types/` та проходження `pnpm --filter @nan0web/ai run test:all` (з `lint`). | `build: OK`, `types/` згенеровано, всі тести проходять. |
| **2**  | **`@nan0web/db`**                                 | 1. Додати коректний `types` у `package.json` для `.` та `./path`.<br>2. Додати `lint` та `lint:fix` у `scripts`, інтегрувати `npm run lint` у `test:all`.<br>3. Перевірити `pnpm --filter @nan0web/db run test:all`.                                                                                                    | `build: OK`, `lint: OK`, експорти валідні для Next.js.  |
| **3**  | **`@nan0web/db-fs`**                              | 1. Додати `exports` у `package.json` (`.` -> `src/index.js` + `types/index.d.ts`).<br>2. Додати `lint`/`lint:fix` та оновити `test:all` (`test -> test:play -> test:docs -> build -> lint -> knip -> audit`).<br>3. Перевірити статус у `bin/packages-status.js`.                                                        | RRS = 100%, тести, лінтер та білд проходять.           |
| **4**  | **`@nan0web/inspect`**                            | 1. Актуалізувати `package.json` (`test:all` конвеєр `test -> test:docs -> build -> lint -> knip -> audit`).<br>2. Перевірити генерацію `types/`, форматування та контрактні тести.                                                                                                                                        | Повний прохід `test:all`.                               |
| **5**  | **`@nan0web/comment`**                            | 1. Створити `tsconfig.json` згідно з рецептом `package-types-build.md`.<br>2. Додати `prebuild`, `build: "tsc"`, `lint` та `lint:fix` у `package.json`.<br>3. Оновити `exports` з мапінгом `types` на `./types/*.d.ts`.<br>4. Включити `lint` у `test:all`.                                                            | `build: OK`, `lint: OK`, TypeScript декларації готові.  |
| **6**  | **`@nan0web/auth`** (мета-пакет)                  | 1. Створити стандартизований `tsconfig.json`.<br>2. Налаштувати скрипти `prebuild`, `build`, `lint`, `test:all`.<br>3. Згенерувати `types/index.d.ts`.                                                                                                                                                                   | `build: OK`, `lint: OK`, `exports` валідні.             |
| **7**  | **`@nan0web/catalog` & `@nan0web/catalog-watch`** | 1. Додати `tsconfig.json` у `catalog-watch`.<br>2. Додати `build: "tsc"`, `lint` та правильні `exports` з типами в обидва пакети.<br>3. Збірка `types/` та прохід `test:all`.                                                                                                                                          | Обидва пакети мають робочий `build`, `lint` і типи.     |
| **8**  | **`@nan0web/pipeline`**                           | 1. Додати `tsconfig.json`.<br>2. Додати `build: "tsc"`, `lint`, `exports` у `package.json`.<br>3. Написати базовий контрактний тест `src/Pipeline.test.js`.                                                                                                                                                              | `test: OK`, `lint: OK`, `build: OK`.                    |
| **9**  | **`@nan0web/ui-robo` & `@nan0web/ui-voice`**      | 1. Синхронізувати `tsconfig.json` та `exports` з типами `./types/index.d.ts`.<br>2. Додати `lint` та `test:all` за стандартом.                                                                                                                                                                                            | Збірка `types/` та `lint` проходять без помилок.        |
| **10** | **Фінальний аудит монорепи**                      | 1. Запуск `pnpm run test:status`.<br>2. Перевірка, що всі виправлені пакети перейшли у статус **🟢 READY**.                                                                                                                                                                                                               | 0 помилок у `test:status`.                              |

---

Ти можеш зараз відкривати новий чат і просто сказати: **«Виконуємо задачу №1 (@nan0web/ai)»**, або почати виконувати першу задачу прямо тут! Як рухаємось?
