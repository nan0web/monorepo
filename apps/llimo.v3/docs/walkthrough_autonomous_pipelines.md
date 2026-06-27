# 🎼 Модернізація автономних пайплайнів LLiMo та RAG робочого простору

Цей документ описує архітектурні вдосконалення, внесені в LLiMo V3.2.0 для підтримки автономного циклу TDD-валідації (без діалогів), усвідомлення нативної архітектури NaN•Web та інтеграції RAG робочого простору.

---

## 🚀 Ключові нововведення

### 1. Централізований реєстр платформи воркспейсу (`getPlatformRegistry`)
Ми створили динамічний рівень роздільної здатності, який сканує локальну платформу `nan0web`. Він парсить конфігураційні файли `nan0web.nan0` для кожного зареєстрованого пакета, щоб побудувати карту відповідностей для всіх доступних воркфлоу та інспекторів.
- **Локація:** `ChatSessionModel.getPlatformRegistry()`
- **Усунення надлишковості:** Воркфлоу завантажуються безпосередньо з оригінальних пакетів (каталоги `docs/`). Ми видалили дубльовані копії, які раніше зберігалися в `apps/llimo.v3/data/uk/workflows/*.md`.

### 2. Інтеграція RAG-пошуку робочого простору (`@search`)
Агентську команду `@search` було модернізовано для використання семантичного пошуку по векторизованому робочому простору.
- **RAG Маршрутизація:** Розпізнає параметри запиту та делегує пошук до `SearchSourcesIntent` з пакета `@nan0web/ai`.
- **Резервний текстовий пошук (Fallback):** Якщо векторна база даних не проіндексована, система автоматично перемикається на оптимізований рекурсивний пошук по текстових рядках, гарантуючи роботу без помилок у середовищі виконання.

### 3. Рекурсивний індексатор реєстру Store (`StoreBuilderApp`)
Ми оновили збирач реєстру `@nan0web/store`, щоб він сканував робочий простір рекурсивно.
- **Багаторівневе сканування:** Знаходить вкладені додатки в `apps/3rdparty/` (наприклад, `industrialbank`) та всі пакети в `.packages/`.
- **Фільтри виключення:** Пропускає стандартні тимчасові каталоги та артефакти збірки (`node_modules`, `dist`, `.cache`, `playwright-report`, `.venv`).

### 4. Оптимізація юніт-тестів та запобігання таймаутам
Ми інтегрували перевірку середовища виконання (`isTesting`) для пропуску завантаження важких бінарних ШІ-модулів (`@nan0web/ai` / `onnxruntime-node`) та тривалого сканування дисків під час запуску юніт-тестів.
- **Результат:** Тести залишаються надшвидкими (<1.3с), що запобігає таймаутам Node/Vitest-раннерів.

---

## 🧪 Валідація та метрики

Усі **47/47 тестів** у 8 тест-сьютах успішно проходять за **1.2 секунди**:

```bash
pnpm --filter @nan0web/llimo.v3 test

▶ ChatSessionModel Cascade & Boundary Execution
  ✔ should cascade from failing model to successful one, save files, run whitelisted commands, and write stats (104.90ms)
  ✔ should build system prompt from data/{locale}/system.md with workflows index (0.35ms)
  ✔ should append specific workflows to system prompt and use fallback (0.41ms)
  ✔ should load workflow file by name (0.14ms)
  ✔ should execute agent commands @ls, @get and @search correctly (7.68ms)
...
ℹ tests 47
ℹ suites 8
ℹ pass 47
ℹ fail 0
ℹ duration_ms 1222.82
```

Ми також перевірили генерацію рекурсивного реєстру store:
```bash
pnpm --filter @nan0web/store run store:build

· Scanning workspace [apps] recursively...
· ✅ Bound 8 entries in apps
· Scanning workspace [packages] recursively...
· ✅ Bound 46 entries in packages
· Scanning workspace [.packages] recursively...
· ✅ Bound 15 entries in .packages
🎉 Global registry updated: nan0web_store.csv
```

---

## 🔮 Майбутній функціонал: Інтелектуальний контроль лімітів (Rate-Limits)

Під час діагностики безкоштовних лімітів моделей та провайдерів (зокрема Cerebras та OpenRouter) було виявлено детальні ліміти у відповідях:
- `x-ratelimit-remaining-requests-minute` / `x-ratelimit-remaining-tokens-minute`
- `x-ratelimit-limit-requests-minute` / `x-ratelimit-limit-tokens-minute`

### План впровадження інтелектуального очікування:
1. **Зчитування заголовків лімітів:**
   Коли провайдер повертає помилку `HTTP 429` (Too Many Requests), бібліотека `@nan0web/ai` перехоплюватиме об'єкт помилки та парситиме заголовки лімітів з `error.responseHeaders`.
2. **Динамічний Backoff:**
   Замість статичного очікування в `1s`, час затримки перед повторним запитом розраховуватиметься на основі заголовка `retry-after` або часу оновлення хвилинного вікна лімітів. Це суттєво стабілізує роботу автономного циклу на безкоштовних моделях.
