# v1.5.2 — Code Formats & Content Fix

## Scope

Master IDE (Sovereign Workbench) — фікс іменування пропів, новий NaN0 Spec формат, 3 вкладки коду.

## Задачі

### 1. Content vs Label (Фікс YAML + main.js)

У Button, Badge, Toggle, Input, Select, Autocomplete YAML файлах `label:` використовується як prop для текстового вмісту компонента. Правильна назва = `content`.

**Що змінити:**

- У YAML: `label: { default: ... }` → `content: { default: ... }` (prop definition)
- У YAML content (variants): `label: Submit` → `content: Submit`
- У `main.js`: `props.label` fallback → `props.content` fallback (variant name resolution)
- У `ide.js` `_generateCode`: перевірити що `content` проп коректно обробляється

**НЕ змінювати**: Tree.yaml (`label` у children — це інша семантика, частина TreeNode моделі).

### 2. NaN0 Spec Format (Code Generation)

Новий скорочений формат де значення елемента = content:

```yaml
- Button: Бренд
  $variant: 'brand'
  $size: 'sm'
  $outline: true
```

`$`-поля = пропси, значення елемента = content.

**Що реалізувати:**

- Новий branch у `_generateCode()` для `codeFormat === 'nan0'`
- Якщо є `content`/`text` — він стає значенням елемента: `- Component: value`
- Всі інші active props отримують `$` префікс: `$variant: 'brand'`
- Якщо нема content — `- Component: true`

### 3. Три вкладки коду (UI)

Code Pane має показувати 3 вкладки:

| Вкладка   | codeFormat | Опис                                                                 |
| --------- | ---------- | -------------------------------------------------------------------- |
| HTML      | `html`     | `<ui-button variant="brand">Бренд</ui-button>`                       |
| YAML Spec | `yaml`     | Повний YAML: `- Button:\n    content: 'Бренд'\n    variant: 'brand'` |
| NaN0 Spec | `nan0`     | Скорочений: `- Button: Бренд\n  $variant: 'brand'`                   |

**Що змінити:**

- Додати третю кнопку `NaN0 Spec` у `render()` код-таби
- `_generateCode` вже має branch `nan0` з Задачі 2

## Architecture Audit

- [x] Чи прочитано Індекси екосистеми? — Так, `packages/ui/` + `docs/site/`
- [x] Чи існують аналоги в пакетах? — Ні, це IDE-специфічна задача
- [x] Джерела даних: YAML `.yaml` файли у `docs/site/src/data/uk/`
- [x] Чи відповідає UI-стандарту (Deep Linking)? — Так, URL система не змінюється

## Definition of Done

1. Жоден YAML файл у `data/uk/` НЕ використовує `label:` для текстового вмісту (окрім Tree children)
2. `main.js` використовує `props.content` замість `props.label` для variant naming
3. `_generateCode()` підтримує 3 формати: `html`, `yaml`, `nan0`
4. Code Pane показує 3 вкладки: HTML | YAML Spec | NaN0 Spec
5. NaN0 Spec генерує правильний скорочений формат з `$` префіксом
6. Всі існуючі тести `npm run test` проходять
