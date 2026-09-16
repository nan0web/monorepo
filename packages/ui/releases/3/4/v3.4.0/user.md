# Сесія 1: Ядро Моделі та Фрактальний $content

**Дата:** 2026-09-07  
**Статус:** виконано  
**Вхідні workflows:** docs/uk/workflows/model-schema.md, docs/uk/workflows/data-architecture.md, docs/uk/workflows/fix.md

---

## DOC-1: Резолвер посилань для nav

**Завдання:** Додати в Document резолвер посилань для природного `nav: headerNav` та явного якоря `nav: { $ref: '#headerNav' }`.

**Рішення:** Метод `Document.resolveNav()`:
- `nav: "headerNav"` → повертає `this.headerNav`
- `nav: { $ref: '#headerNav' }` → **не обробляється** (це DB-рівень, якщо `$ref` просочився сюди — дані вже зламані)
- Готовий об'єкт/масив → повертається як є
- `null`/`undefined` → повертає `null`

**Файл:** `src/domain/Document.js` — метод `resolveNav()`

---

## DOC-2: Булеві значення блоків $content

**Завдання:** Якщо блок `{ Banner: true }`, автоматично брати однойменні дані з поля документа (`this.banner`).

**Рішення:** Два методи в `Document`:

### `resolveContent(blocks)`
Рекурсивно розгортає масив `$content` блоків:
- `{ Banner: true }` → шукає `this.banner` / `this.Banner` (case-insensitive), повертає знайдене
- `{ Banner: true, Hero: true }` → **два окремі блоки** (розгортається в `[banner, hero]`)
- `{ Markdown: { content: '# Hello' } }` → без змін (не булевий ключ)
- `null`/`undefined`/примітиви → як є

### `resolveContentItem(item)`
Розгортає один блок:
- Розділяє ключі на boolean-true та non-boolean
- Multiple booleans → multiple blocks (array)
- Single boolean → resolved object + merged non-boolean props
- No booleans → object as-is

### `lookupField(key)`
Case-insensitive пошук поля: exact match → lowercase → title-case.

**Файл:** `src/domain/Document.js` — методи `resolveContent()`, `resolveContentItem()`, `lookupField()`

---

## DOC-3: Unit-тести

**Файл:** `src/domain/DocumentContent.test.js`

**Групи тестів:**
1. `Document — resolveNav` (8 тестів): стрінговий референс, прямий об'єкт, масив, null, nonexistent field
2. `Document — resolveContent` (12 тестів): single boolean, case-insensitive, multiple booleans, mixed props, passthrough, empty/null, custom blocks, nested Content, $ref keys ignored, null/undefined items, missing field fallback
3. `Document — Fractal Composition` (2 інтеграційні тести): full pipeline nav + $content, chained resolution

**Разом:** 22 тести

---

## DOC-4: Валідація

```
pnpm test:unit
→ 196 tests, 40 suites, 196 pass, 0 fail ✅
```

Усі існуючі тести пройшли без регресій.

---

## Ітерації та зауваження

1. **Перша спроба `resolveNav`** включала `$ref` обробку — відкинуто, бо `$ref` вирішується на рівні `nan0web/db`. Якщо він у Document — дані вже зламані.
2. **Multiple booleans** — домовились, що `{ Banner: true, Hero: true }` має розгортатися в два окремі блоки (flat array), а не один об'єкт.
3. **Case-insensitive lookup** — реалізовано через `lookupField()` з трьома спробами: exact → lowercase → title-case.

---

# Сесія 2: Мультимодальні OLMUI Контракти та План Пісочниці

**Дата:** 2026-09-07  
**Статус:** виконано  
**Вхідні workflows:** docs/uk/workflows/release.md, packages/ui/releases/3/4/v3.4.0/sandbox-plan.md, packages/ui/docs/uk/contracts/README.md

### Реалізація:
1. **Мультимодальні Контракти:** Усі 17 універсальних контрактів компонентів (`PageContract`, `NavContract`, `SidebarContract`, `FooterContract`, `MarkdownContract`, `AlertContract`, `BadgeContract`, `TableContract`, `ActionContract`, `ButtonContract`, `InputContract`, `ChoiceContract`, `SelectContract`, `FormContract`, `DialogContract`, `ModalContract`, `ProgressContract`) верифіковано в `releases/3/4/v3.4.0/task.spec.js` (8/8 pass).
2. **Документація Контрактів:** Повна матриця мультимодальної адаптації для 6 середовищ (CLI, Web, Mobile, Watch, Voice, Chat) зафіксована в `packages/ui/docs/uk/contracts/README.md`.
3. **Очищення робочого контексту:** Тимчасовий `chat/answer.md` безпечно перенесено й видалено.
4. **Статус DoD:** Усі завдання в `task.md` закриті зі 100% проходженням тестів.

---

# Сесія 3: Стандартизація PM-as-Code, Zero .d.ts та формат даних .nan0

**Дата:** 2026-09-07  
**Статус:** виконано  
**Вхідні workflows:** docs/uk/workflows/release.md, docs/uk/workflows/release-pipeline.md

### Реалізація:
1. **Стандартизація парадигми PM-as-Code**: Перейменовано протокол релізів із AGRP на агностичний `PM-as-Code Release Protocol` у `docs/uk/workflows/release.md` та супутніх пайплайнах.
2. **Zero .d.ts для релізів**: Впроваджено ізольований `tsconfig.check.json` та команду `pnpm run test:types`. Валідація синтаксису релізів та кодової бази проходить миттєво з кодом 0 без генерації сміттєвих `.d.ts` файлів у релізах.
3. **Формат `.nan0` замість YAML**: Створено повноцінну мультимовну структуру даних релізу в `releases/3/4/v3.4.0/data/`:
   - `data/_/langs.nan0` — реєстр підтримуваних мов (English, Українська).
   - `data/_/t.nan0` — словник за замовчуванням (англійська).
   - `data/uk/_/t.nan0` — словник української локалізації.
   - `data/index.nan0` та `data/uk/index.nan0` — детерміновані документи для вітрини.
4. **Автономна вітрина релізу**: Переведена на чисту Data-Driven модель. Застарілий файл `index.html` видалено як порушення OLMUI.
5. **Мультимовна CLI Вітрина `play.js`**: Повністю переведена на завантаження `.nan0` через `@nan0web/types`, підтримує автономні прапорці `--lang=en|uk` та `--demo=all`.

---

# Сесія 4: Pure Data-Driven UI Architecture & Clean .d.ts Verification

**Дата:** 2026-09-07  
**Статус:** виконано  
**Вхідні workflows:** docs/uk/workflows/release.md, docs/uk/workflows/model-as-app.md, docs/uk/workflows/architechnomag.md

### Реалізація:
1. **Повний перехід на Data-Driven UI**:
   - Видалено `releases/3/4/v3.4.0/index.html`. Вітрина більше не потребує спеціального HTML-файлу для кожної версії.
   - Створено декларативний реєстр контрактів `releases/3/4/v3.4.0/data/contracts.nan0`.
   - Будь-який клієнт чи ранер (`nan0web.app`, `@nan0web/ui-lit`, `@nan0web/ui-cli`) рендерить вітрину безпосередньо з `data/**/*.nan0`.
2. **Чистота декларацій типів (`.d.ts`)**:
   - `pnpm run build` генерує декларації виключно для `src/**/*.js` (за винятком тестів).
   - Жоден файл у `releases/` не генерує `.d.ts`, що гарантує 100% чистоту репозиторію та npm-пакету.
   - `pnpm run test:types` валідує контракти й типи через `tsconfig.check.json` з нульовим емітом.
3. **Оновлення DoD та специфікації**:
   - `task.md` оновлено під Data-Driven парадигму.

---

# Сесія 5: Стандартизація $db та Живий Виконуваний Рецепт

**Дата:** 2026-09-08  
**Статус:** виконано  
**Вхідні workflows:** docs/uk/workflows/release.md, docs/uk/workflows/model-as-app.md, docs/uk/workflows/architechnomag.md

### Реалізація:
1. **Гарантований гетер `$db` у `ModelAsApp`**:
   - Додано `static UI = { errorNoDb: 'Database instance ($db) is required for {$alias}' }`.
   - Реалізовано гетер `get $db()` у `src/domain/ModelAsApp.js`, що автоматично викидає локалізовану помилку через `this._.t(...)` у разі відсутності `this._.db`.
2. **Контрактні тести у `task.spec.js`**:
   - Додано тести для перевірки повернення ін'єкованого екземпляра `db` та викидання `errorNoDb`.
   - 100% тестів пройдено (10/10 pass).
3. **Живий виконуваний рецепт `docs/uk/recipes/model-as-app.js`**:
   - Створено повноцінний самодостатній файл-приклад, який запускається безпосередньо через Node.js.
   - Оновлено `docs/uk/workflows/model-as-app.md` з розділом 5 та посиланням на живий рецепт.
