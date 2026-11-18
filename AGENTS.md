---
fractal: "nan.web"
layer: "L2"
locale: "uk"
parent: "../AGENTS.md"
intent: "Протокол платформи NaN•Web: Model-as-Schema, $db, OLMUI, pnpm, nan0inspect та лінивий індекс workflows"
---

# 🕸️ Платформа NaN•Web ($L_2$)

> [!CRITICAL]
> **ОБОВ'ЯЗКОВИЙ СТАРТ СЕСІЇ (BEFORE ANY OTHER ACTION):**
> 1. **Мова:** Усі думки та відповіді користувачу — **ВИКЛЮЧНО українською мовою** (`locale: uk`).
> 2. **Перша дія:** Першим же викликом прочитай `../AGENTS.md` **відносно директорії ЦЬОГО файлу** (і далі каскадом вгору по `../AGENTS.md` до $L_0$) та `docs/uk/workflows/architechnomag.md`. Якщо задача стосується `apps/` або `packages/`, також прочитай `apps/AGENTS.md` / `packages/AGENTS.md` та локальний `AGENTS.md` у цільовому пакеті/додатку (якщо існує).
> 3. **Без цього старту продовжувати роботу заборонено.**

## ⚡ Інваріанти Платформи NaN•Web ($L_2$)

1. **Model-as-Schema & ModelAsApp:** Вся бізнес-логіка, схеми даних та CLI-команди реалізуються як класи `Model` або `ModelAsApp` (`static field = { help, default }`). Поля ініціалізуються через `super(data, options)` у конструкторі.
2. **Поліморфна VFS База Даних (`this.$db`) та Інжекція (`this.$`):** Усі операції з файлами/даними виконуються виключно через `this.$db` (`@nan0web/db`) без явних розширень у `saveDocument`/`loadDocument`. Усі інжектовані сервіси, порти та UI зберігаються з префіксом `this.$` (`this.$db`, `this.$UI`, `this.$service`).
3. **OLMUI (One Logic — Multiple UI):** Доменна модель не знає про React, Lit чи CLI.
4. **Маршрутизація Дослідження (MCP & `.d.ts` First):** Перед читанням `src/**/*.js` або `grep` використовуй MCP (`search_knowledge_base`, `inspect_api_contract`), `nan0inspect api <path>`, `.d.ts` або `README.md`.
5. **Recipe Gate & Заборона Legacy Mimicry:** Перед створенням або зміною будь-якої моделі/команди перевір каталог [`docs/uk/recipes/`](./docs/uk/recipes/) та обов'язково прочитай усі релевантні до задачі еталонні рецепти (наприклад, `model-as-app.js`, `db-zero-fs.md` тощо). Брати приклад із сусідніх файлів у `apps/*` чи `packages/*` дозволено **лише** у тому випадку, якщо відповідного рецепту в `docs/uk/recipes/` не існує.
6. **Ready-to-Code Gate (Знайомство перед Кодом):** Перед написанням першого рядка коду агент проходить фазу знайомства (каскад `AGENTS.md` → релевантні рецепти `docs/uk/recipes/` → цільовий код і тести), декларує Архітектору `targetFiles` та архітектурні рішення зі словами **«Я готовий писати код»**, і лише після цього переходить до імплементації.
7. **AI-Friendly Код (512-Token Budget):** Функції та методи (разом із лаконічним JSDoc) не повинні перевищувати **35–40 рядків** (~1200–1400 символів), щоб гарантовано поміщатися у 512-токенне вікно ембедінг-моделей без обрізання (деталі в [`code-style.md`](./docs/uk/workflows/code-style.md)).

## 🧪 Протокол Тестування та Інспекції ($L_2$)

- Усі сценарні (`*.story.js`) та контрактні (`task.spec.js`) тести працюють на **In-Memory `@nan0web/db`** з віртуальними маунтами.
- Усі команди запускаються **виключно через `pnpm run <script>`**.
- Обов'язковий фінальний гейт перед здачею:
  `pnpm run release:spec` → `pnpm run test:all` → `pnpm run inspect` (`nan0inspect domain`, винятки лише декларативно у `inspect.config.nan0`).

## 🚫 ЗАБОРОНЕНО ($L_2$)

- Викликати `node` напряму в терміналі або через `pnpm exec node` (лише детерміновані `pnpm run <script>` або `pnpm --filter <pkg> run <script>`).
- Використовувати процедурні імпорти `node:fs`, `node:path`, `node:os`, `process` у доменних моделях.
- Оголошувати ES Class Fields (`field = defaultValue`) у підкласах `Model` (затирає дані з `super(data)`).
- Передавати явні розширення (`.nan0`, `.yaml`, `.json`) у `this.$db.saveDocument()` / `loadDocument()`.
- Хардкодити рядки в UI замість словників `@nan0web/i18n` та метаданих моделей.

## 🗂 Лінивий Індекс Воркфлоу (`docs/uk/workflows/*.md`)

Читай через `read_file` **лише** релевантний до поточної задачі воркфлоу (повний каталог 93 файлів: [`docs/uk/workflows/README.md`](./docs/uk/workflows/README.md)):

| Категорія задачі | Ключові воркфлоу (`docs/uk/workflows/`) |
| :--- | :--- |
| **1. Ядро та Контекст** | `architechnomag.md`, `cocodev.md`, `cnai-context.md`, `llm-measure-protocol.md`, `mcp-knowledge-base.md` |
| **2. Релізи та Задачі** | `release.md`, `release-pipeline.md`, `seed-analysis.md`, `task-pool.md`, `npm-release.md`, `commit.md` |
| **3. Моделі та Дані** | `model-as-app.md`, `model-schema.md`, `model-as-app-cli.md`, `data-architecture.md`, `code-style.md` |
| **4. OLMUI та Інтерфейси** | `app-pipeline.md` (`01`..`09`), `olm-ui-architecture-core.md`, `ui-cli-standards.md`, `payload-cms-models.md` |
| **5. TDD та Галереї** | `olmui-scenario-test.md`, `fix.md`, `test-fast.md`, `sandbox-verify.md`, `snapshot.md` |
| **6. Інспекція (`nan0inspect`)** | `self-audit-protocol.md`, `check.md`, `package-hygiene.md`, `inspect-models.md`, `inspect-anti-pattern.md` |
| **7. i18n та Документація** | `i18n-standards.md`, `i18n-builder.md`, `provendocs.md`, `project.md` |

- Дочірні контури платформи: [`./packages/AGENTS.md`](./packages/AGENTS.md), [`./apps/AGENTS.md`](./apps/AGENTS.md).
