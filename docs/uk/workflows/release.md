---
description: PM-as-Code Release Protocol — реалізація ТЗ через контрактне тестування, метрики та регресію
---

# 🚀 PM-as-Code Release Protocol

// turbo-all

Цей workflow перетворює технічне завдання та беклог на доведений реліз із контрактними тестами.
Усі команди безпечні для автономного запуску (git commit/push залишаються заблокованими згідно з правилами безпеки).

---

## 🏛 Архітектура Релізу: Project Management as Code

Кожен проєкт/пакет містить стандартизовану структуру релізів:

```
releases/
├── _/langs.nan0                  # Реєстр підтримуваних мов (English, Українська)
├── README.md                     # Каталог релізів та інструкції запуску
├── backlog.md                    # Загальний беклог ідей та задач
└── {major}/{minor}/v{major}.{minor}.{patch}/
    ├── task.md                   # Паспорт релізу та декларація задач (locale: uk)
    ├── task.spec.js              # Контрактні тести (TDD)
    ├── user.md                   # Метрики часу, ітерацій та append-only фідбек
    ├── retro.md                  # Фінальна ретроспектива при seal
    ├── index.nan0                # Декларативний $content вітрини за замовчуванням
    └── [locale]/                 # Локалізовані документи та словники (uk/index.nan0, uk/t.nan0)
```

---

## 📋 Покроковий Процес Релізу

### 1. Дослідження та Ініціалізація
1. Перевір існуючі релізи:
   ```bash
   pnpm run release:status 2>/dev/null || find releases/ -name "*.spec.js" -o -name "*.test.js" 2>/dev/null
   ```
2. Визнач цільову версію (SemVer) та ініціалізуй реліз:
   ```bash
   pnpm exec release init vX.Y.Z
   ```
3. Створи або онови:
   - `releases/{major}/{minor}/vX.Y.Z/release.md`
   - `releases/{major}/{minor}/vX.Y.Z/user.md`
   - `releases/{major}/{minor}/vX.Y.Z/task.spec.js`

### 2. Створення Контрактів (Contract-First / TDD Red)
1. Кожна задача з `release.md` мапиться на один або кілька тестів `it()` у `task.spec.js`.
2. Завдання в беклозі позначаються `it.todo()`.
3. Усі активні тести **повинні падати (Red)** до початку написання коду.
4. Запусти перевірку контракту:
   ```bash
   pnpm run release:spec
   ```

### 3. Імплементація та Zero-Trust Git Diff Контроль
1. Модифікуй **лише ті файли**, які задекларовані у секції `Target Files` поточної задачі `release.md`.
2. Заборонено процедурний `fs` — лише `@nan0web/db`.
3. Перевіряй статус змін через `git status` та `git diff` ([git-reviewer](/docs/uk/workflows/git-reviewer.md)).
4. Виконуй тести до повного переходу в стан **Green**.

### 4. Трекінг Метрик та Зворотний Зв'язок
1. Усі коментарі та зауваження Архітектора фіксуються в `user.md` (Append-Only).
2. За кожним зауваженням додається мінімум 1 контрактний тест.
3. Оновлюються метрики часу, ітерацій та перевірок у секції `Метрики Виконання` в `user.md`.

### 5. Валідація та RRS Gate
1. Запусти повну перевірку готовності релізу:
   ```bash
   pnpm run release:validate
   ```
2. Запусти повний комплекс перевірок пакета:
   ```bash
   pnpm run test:all
   ```
3. Реліз вважається готовим, якщо **RRS (Release Readiness Score) ≥ 324 бали** і всі тести пройдені.

### 6. Запечатування та Авто-Регресія (Seal & Close)
1. Архітектор схвалює реліз.
2. Запечатування релізу:
   ```bash
   pnpm exec release seal --message="Реліз успішно завершено"
   ```
3. Конверсія контрактів у регресійні тести:
   ```bash
   pnpm run release:close -- vX.Y.Z
   ```
   *(Файли `*.spec.js` автоматично мігрують у `src/test/releases/{major}/{minor}/vX.Y.Z/*.test.js`)*.
