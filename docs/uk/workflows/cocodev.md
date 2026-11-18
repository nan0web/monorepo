---
description: CoCoDev — Continuous Collaborative Development (Фрактальний цикл K <= 7)
---

# CoCoDev — Continuous Collaborative Development (Фрактальний цикл $K \le 7$)

> **Парадигма:** Будь-яка задача (ПЗ, архітектура, гра, дизайн) описується функціоналом перетворення $T: (\mathcal{I}, \mathcal{P}, \mathcal{E}) \xrightarrow{\mathcal{R}} \mathcal{O}$ (Намір $\mathcal{I}$, Патерни/Протоколи $\mathcal{P}$, Середовище $\mathcal{E}$ через Ресурси $\mathcal{R}$ → Артефакт результату $\mathcal{O}$) і розгортається у фрактальний цикл із не більше ніж **7 кроків** на кожному рівні.

---

## Рівень 1: Універсальний 7-кроковий цикл

1. **Intent ($\mathcal{I}$ — Намір):** Людина або агент формулює ціль і $\le 7$ критеріїв прийомки (`task.md`, `plan.md`, GDD, специфікація).
2. **Knowledge ($\mathcal{K}$ — Знання через MCP + `targetFiles`):** Перед будь-яким `grep` чи `read_file` агент **обов'язково** запитує активні MCP-сервери (`search_knowledge_base`, `get_resource`, `inspect_api_contract`). На виході цього кроку агент **обов'язково фіксує білий список `targetFiles`** (`[NEW]` / `[MODIFY]`) перед зміною коду.
   - *Fallback (якщо локальний векторний embedder недоступний):* `nan0inspect api <path>` → `README.md` → `types/**/*.d.ts`.
3. **Model ($\mathcal{M}$ — Архітектура / Схема):** Проєктування чистої моделі (`Model-as-Schema` для даних/конфігів, `ModelAsApp` для виконуваних команд) без прив'язки до ОС/UI — лише через віртуальні маунти `this.$db`.
4. **Contract ($\mathcal{C}$ — Контракт / TDD):** Створення сценарного/контрактного тесту (`*.story.js`, `task.spec.js`) на In-Memory `@nan0web/db` (або прототипу) до написання реалізації.
5. **Build ($\mathcal{B}$ — Реалізація):** Мінімальний чистий код або контент для проходження контракту.
6. **Inspect ($\mathcal{V}$ — Аудит):** Автоматична перевірка: `test:all`, `release:spec`, `nan0inspect`, `tsc`, а також скоуп-ізоляція `git diff --name-only` відносно задекларованого `targetFiles`.
7. **Sync ($\mathcal{S}$ — Синхронізація):** Релізний цикл (`@nan0web/release`: `validate` / `seal` / `close` для `releases/X/Y/vX.Y.Z/`), оновлення індексу знань (`pnpm run ai:index`), фіксація рішень Архітектора в `user.md` / `task.md` та виявлених прогалин у `releases/backlog.md`.

---

## Рівень 2: Конфігурований стандарт для `nan0web` (`nan0web.nan0`)

Кожен крок має двошарову конфігурацію (**глобальна за замовчуванням** `~/.nan0web/nan0web.nan0` + **локальна на рівні репо/проєкту** `nan0web.nan0` та `inspect.config.nan0`), типізовану через `NaN0WebConfig`:

- **1. Intent (`IntentStep`):** `task.md` + `user.md` (фідбек) у `releases/X/Y/vX.Y.Z/`, ліміт `maxCriteria <= 7`.
- **2. Knowledge (`KnowledgeStep`):** Пріоритет активних MCP (`nan0web-knowledge`, `nan0web-inspect`), fallback на `README.md` / `*.d.ts`, обов'язкова декларація `targetFiles`.
- **3. Model (`ModelStep`):** Чистий `ModelAsApp` / `Model`, залежності через `this.$db` / `this.$UI`, JSDoc конструктора `Partial<import('@nan0web/types').ModelOptions>`.
- **4. Contract (`ContractStep`):** `*.story.js` та `task.spec.js` на In-Memory `@nan0web/db` з віртуальними маунтами (`@app`, `@gemini`, `@cursor`, `~` тощо).
- **5. Build (`BuildStep`):** Реалізація без `fs`/`path`/`os`/`process` у домені; запуск скриптів виключно через `pnpm run ...`; без явних розширень у `saveDocument`/`loadDocument`.
- **6. Inspect (`InspectStep`):** `pnpm run release:spec`, `pnpm run test:all`, `pnpm run inspect` (винятки — лише декларативно через `inspect.config.nan0`), перевірка `git diff` у межах `targetFiles`.
- **7. Sync (`SyncStep`):** Реліз за [release.md](./release.md), оновлення індексу `nan0web-knowledge` (`pnpm run ai:index`) та беклогу `releases/backlog.md`.

---

## Ліниве підключення спеціалізованих воркфлоу

Щоб не перевантажувати контекст на старті сесії, агент завантажує дочірні воркфлоу **лише на відповідному кроці**:

| Крок CoCoDev | Спеціалізовані воркфлоу |
| :--- | :--- |
| **1. Intent** | [seed-analysis.md](./seed-analysis.md), [release-pipeline.md](./release-pipeline.md) |
| **2. Knowledge** | [cnai-context.md](./cnai-context.md), [mcp-knowledge-base.md](./mcp-knowledge-base.md) |
| **3. Model** | [model-as-app.md](./model-as-app.md), [model-schema.md](./model-schema.md), [data-architecture.md](./data-architecture.md) |
| **4. Contract** | [olmui-scenario-test.md](./olmui-scenario-test.md), [llm-measure-protocol.md](./llm-measure-protocol.md) |
| **5. Build** | [code-style.md](./code-style.md), [llimo.md](./llimo.md) |
| **6. Inspect** | [self-audit-protocol.md](./self-audit-protocol.md), [check.md](./check.md) |
| **7. Sync** | [release.md](./release.md), [task-pool.md](./task-pool.md) |
