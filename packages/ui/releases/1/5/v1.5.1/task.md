# v1.5.1 — Modal, URL Sync & Emergency Reset

## Scope

Master IDE (Sovereign Workbench) — патч: буг-фікси та утиліти.

## Задачі

### 1. URL Update on Save Variation

При збереженні нової варіації (`+ Save Variation`) URL має оновитись на `#varN`,
як ніби користувач клікнув на неї.

- Додати `history.replaceState` у `_saveVariant()` після push у variants

### 2. Custom Modal (Replace prompt/confirm)

`window.prompt()` мерехтить у Chrome всередині Shadow DOM.
Замінити на inline-modal компонент в Shadow DOM IDE:

- Модаль: input + OK/Cancel кнопки
- Confirm: текст + OK/Cancel кнопки
- Фокус на input при відкритті
- Escape закриває
- Використовується в: `_saveVariant`, `_renameVariant`, `_deleteVariant`

### 3. Emergency Reset

URL-параметр `?reset=1` або хоткей для повного скидання всіх налаштувань IDE:

- Очищає `localStorage` (theme, open-sections)
- Очищає `IndexedDB` (master_ide DB — всі custom variations)
- Перенаправляє на чисту сторінку

## Definition of Done

1. URL оновлюється при `+ Save Variation`
2. Жодного `window.prompt()` або `window.confirm()` у коді IDE
3. Власний модальний компонент з input, OK/Cancel, Escape
4. `?reset=1` скидає всі налаштування
