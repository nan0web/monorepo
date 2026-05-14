# Release v1.1.0 — Playground Interactivity & Component Polish

## Scope

Виправлення інтерактивності пісочниці (усі другі екземпляри компонентів), оновлення API Badge,
візуальне покращення Slider та Sortable, виправлення поведінки Toast.

## Changes

### 1. Playground: Data-Driven Bind для всіх екземплярів

- `playground-setup.js` тепер ініціалізує **кожен** `id="e2e-*"` елемент, включно з другими прикладами
  (e2e-nav-min, e2e-sidebar-simple, e2e-markdown-code, e2e-code-block-yaml, e2e-table-simple,
  e2e-select-presel, e2e-accordion-closed, e2e-autocomplete-hint, e2e-sortable-num, e2e-tree-simple)
- ThemeToggle та LangSelect тепер використовують `querySelectorAll` замість єдиного `getElementById`

### 2. UIBadge: Слот та семантичні варіанти

- Рендер: `<span><slot>${this.label}</slot></span>` — підтримка children
- Варіанти змінено: `info → unread`, `success → complete`, `warning → dangerous`, `error → not-found`
- Документація (JSDoc) оновлена

### 3. UISlider: Видимий track fill

- Додано метод `_getPercentage()` для обчислення заповнення треку
- `render()` генерує inline `linear-gradient` для візуалізації track fill

### 4. UISortable: Нумерація елементів

- Нова пропертя `numbered: { type: Boolean }`
- Рендерить порядковий номер `1. 2. 3.` перед кожним елементом

### 5. UIToast: Авто-зникнення

- Прибрано `duration="0"` зі всіх прикладів — тости тепер зникають після 4 секунд (default)

### 6. rebuild-yaml.js: Оновлені code examples

- `codeExamples` оновлено під нові варіанти Badge

## Acceptance Criteria (Definition of Done)

1. Badge підтримує `<slot>` (children замість обов'язкового `label`)
2. Badge CSS містить варіанти: `unread`, `complete`, `dangerous`, `not-found`
3. Slider має метод `_getPercentage()` і render з `linear-gradient`
4. Sortable має пропертю `numbered` і рендерить номер
5. Toast default duration > 0 (auto-dismiss)
6. playground-setup.js ініціалізує всі e2e-\* елементи (включно з другими прикладами)
7. Unit тести: 209 pass, 0 fail
8. Knip: no issues

## Architecture Audit (Чекліст)

- [x] Чи прочитано Індекси екосистеми?
- [x] Чи існують аналоги в пакетах?
- [x] Джерела даних: YAML (index.yaml), JSON (components.json)
- [x] Чи відповідає UI-стандарту? (Так — OLMUI, Zero-dependency, CSS Custom Properties)
