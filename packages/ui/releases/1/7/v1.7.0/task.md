# v1.7.0 — Dynamic i18n & Advanced Editor

## Scope

Архітектурне оновлення Master IDE: динамічне завантаження даних per language
через `db.fetch()`, YAML→JSON пакування, та розширений редактор властивостей.

## Tasks

### T1: YAML → JSON пакування

Всі YAML файли з `docs/data/{lang}/` мають бути конвертовані у `.json` файли
через скрипт `generate-data.js`. JSON файли будуть статичними ресурсами,
які IDE підвантажує через HTTP fetch.

### T2: Dynamic manifest per language (db.fetch)

Замість одноразового import усіх YAML при побудові manifest — IDE має
завантажувати дані компонента через `fetch('/docs/data/{lang}/{Component}.json')`.
При зміні мови — перезавантаження даних нового locale.

### T3: Theme Settings page

Окрема сторінка `/theme.html` з повним переліком CSS змінних (50+).
Організована по секціях: Colors, Typography, Spacing, Borders, Shadows, Z-index.
Як Bootstrap `_variables.scss`.

### T4: UIForm for complex props (array-of-objects)

Props editor має генерувати UIForm для `array-of-objects` типу:

- `LangSelect.langs` — масив `{code, title}`
- `Tree.items` — рекурсивний масив `{label, children}`

### T5: Tree keyboard navigation (Up/Down/Left/Right)

Arrow keys для навігації по дереву. Component-level зміна у `ui-tree`
(`@nan0web/ui-lit`). Left = collapse, Right = expand, Up/Down = siblings.

### T6: Modal footer slot injection

IDE має інжектити `<slot name="footer">` з кнопками (OK/Cancel)
при рендерингу `ui-modal` у Preview.

## Acceptance Criteria

- [ ] T1: `npm run docs:build-data` генерує JSON для кожного YAML
- [ ] T2: Зміна мови в IDE перезавантажує component data з JSON
- [ ] T3: `/theme.html` з 50+ CSS змінних, live preview
- [ ] T4: array-of-objects UIForm працює для LangSelect та Tree
- [ ] T5: Arrow keys працюють у ui-tree
- [ ] T6: Modal з кнопками у footer

## Architecture Audit

- [x] Прочитано індекси екосистеми
- [x] Аналоги: `@nan0web/db` має `fetch()` — використовуємо
- [x] Джерела даних: YAML → JSON
- [x] UI-стандарт: Deep Linking збережено
