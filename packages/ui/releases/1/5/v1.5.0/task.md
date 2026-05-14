# v1.5.0 — Deep Linking & Light Theme Polish

## Scope

Master IDE (Sovereign Workbench) — структурні та UX-виправлення.

## Задачі

### 1. Deep-Linked Category URLs

Кожен компонент має мати URL з категорією: `/{lang}/{Category}/{Component}.html#var{N}`
Наприклад: `/uk/Actions/Button.html#var3`

- Оновити `generate-pages.js` для генерації HTML у підпапки категорій
- Оновити `_selectComponent`, `_syncFromUrl`, `_loadVariant` для нової URL-структури
- Оновити `_restoreVariationsForActive` hash mapping для нового формату
- HTML шаблон: script src має правильний відносний шлях (`../../src/main.js`)

### 2. Active Page Highlight on Refresh

При оновлені сторінки (F5) активна сторінка не підсвічується в sidebar.

- Root cause: `_syncFromUrl()` не знаходить компонент в `this.components` коли manifests ще не завантажені
- Fix: при `manifest-updated` event, re-run `_syncFromUrl()`

### 3. Duplicate Variant Names in Button

У кнопок є два primary (Submit і Outline) з однаковим ім'ям "Primary".

- Fix: додати унікальний ідентифікатор у YAML data. Для варіанту з `outline: true` використовувати name = label замість variant.
- Variant naming logic: якщо `outline === true`, використати `label`; інакше `variant`.

### 4. Code Pane Light Theme Adaptation

Блок коду (`.code-pane`) залишається темним у Light Theme. Таби мають слабку контрастність.

- Fix: додати `:host(.theme-light)` CSS правила для `.code-pane`, `.code-tabs`, `.code-tab`, `.code-content`
- Таби повинні мати чіткий контраст у light mode

## Architecture Audit

- [x] Чи прочитано Індекси екосистеми?
- [x] Чи існують аналоги в пакетах? — Ні, це єдиний docs IDE
- [x] Джерела даних: YAML (data/{lang}/\*.yaml)
- [x] Чи відповідає UI-стандарту (Deep Linking)? — Задача #1 саме це реалізує

## Definition of Done

1. URL формат: `/{lang}/{Category}/{Component}.html#varN`
2. При F5 — активний компонент підсвічується в sidebar
3. Кнопки не мають дублікатів імен
4. Code-блок адаптивний до light/dark theme
