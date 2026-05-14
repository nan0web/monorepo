# v1.6.0 — Architecture UI Map & Full Docs

## Scope

Master IDE (Sovereign Workbench) — Architecture UI Map для перевірки готовності компонентів
у всіх пакетах екосистеми (@nan0web/ui, ui-lit, ui-cli, ui-react-bootstrap) та повна
інтеграція документації (README.md, project.md) у IDE.

## Задачі

### 1. Architecture UI Map (Registry Table)

Побудувати модуль `ArchitectureMap`, який автоматично збирає реєстр компонентів
із кількох пакетів і визначає їх статус (Ready / Not Ready).

**Що реалізувати:**

- Створити `src/ArchitectureMap/ArchitectureMap.js` — клас, що приймає маніфести
  компонентів з різних UI пакетів і порівнює їх.
- Метод `register(packageName, componentsList)` — реєструє експорти пакета.
- Метод `getMatrix()` — повертає матрицю `{ componentName → { packageName → boolean } }`.
- Метод `getReadiness(componentName)` — повертає знання чи компонент є у всіх цільових пакетах.
- Юніт-тести для кожного методу.

**Компоненти для трекінгу** (на основі YAML data та project.md):

| Компонент    | ui (base) | ui-lit | ui-cli | ui-react-bootstrap |
| :----------- | :-------: | :----: | :----: | :----------------: |
| Accordion    |     -     |   ✅   |   ⏳   |         ✅         |
| Alert        |     -     |   ✅   |   ⏳   |         ⏳         |
| Autocomplete |     -     |   ✅   |   ⏳   |         ✅         |
| Badge        |     -     |   ✅   |   ⏳   |         ⏳         |
| Button       |     -     |   ✅   |   ✅   |         ✅         |
| Card         |     -     |   ✅   |   ⏳   |         ✅         |
| CodeBlock    |     -     |   ✅   |   ⏳   |         ⏳         |
| Confirm      |     -     |   ✅   |   ✅   |         ⏳         |
| Input        |     -     |   ✅   |   ✅   |         ✅         |
| LangSelect   |     -     |   ✅   |   ⏳   |         ✅         |
| Markdown     |     -     |   ✅   |   ⏳   |         ✅         |
| Modal        |     -     |   ✅   |   ⏳   |         ✅         |
| ProgressBar  |     -     |   ✅   |   ⏳   |         ⏳         |
| Select       |     -     |   ✅   |   ✅   |         ⏳         |
| Slider       |     -     |   ✅   |   ⏳   |         ⏳         |
| Sortable     |     -     |   ✅   |   ⏳   |         ✅         |
| Spinner      |     -     |   ✅   |   ⏳   |         ⏳         |
| Table        |     -     |   ✅   |   ✅   |         ⏳         |
| ThemeToggle  |     -     |   ✅   |   ⏳   |         ✅         |
| Toast        |     -     |   ✅   |   ⏳   |         ⏳         |
| Toggle       |     -     |   ✅   |   ✅   |         ⏳         |
| Tree         |     -     |   ✅   |   ✅   |         ✅         |

### 2. Full Docs Standard

Рендеринг `README.md` та `project.md` безпосередньо в Master IDE
із підтримкою i18n перемикання.

**Що реалізувати:**

- Нова вкладка "Docs" (📖) у IDE поруч з Preview / Properties / Code.
- При натисканні — завантажити та відрендерити `README.md` для активного пакета.
- Підтримка перемикання мови (uk/en) для документації.
- Fallback на англійську, якщо переклад відсутній.

### 3. Universal Interface Template

Легкий шаблон для швидкого розширення екосистеми новими інтерфейсами.

**Що реалізувати:**

- Створити `src/InterfaceTemplate/InterfaceTemplate.js` — базовий клас-шаблон
  для нового інтерфейсу.
- Документувати патерн успадкування (static методи, обов'язкові overrides).
- Юніт-тести для Template API.

## Architecture Audit

- [x] Чи прочитано Індекси екосистеми? — Так (packages/ui, ui-lit, ui-cli, ui-react-bootstrap)
- [x] Чи існують аналоги в пакетах? — Часткова матриця є в `project.md`, але немає програматичного модуля
- [x] Джерела даних: YAML `.yaml` файли у `docs/site/src/data/`, exports з пакетів
- [x] Чи відповідає UI-стандарту (Deep Linking)? — Так, docs route додається до SPA навігації

## Definition of Done

1. Існує клас `ArchitectureMap` з методами `register()`, `getMatrix()`, `getReadiness()`
2. Юніт-тести для ArchitectureMap покривають реєстрацію та перевірку готовності
3. IDE має вкладку "Docs" що рендерить markdown
4. i18n перемикання працює для документації (uk/en)
5. Існує `InterfaceTemplate` базовий клас із задокументованим API
6. Юніт-тести для InterfaceTemplate
7. Всі існуючі тести `npm run test` проходять
