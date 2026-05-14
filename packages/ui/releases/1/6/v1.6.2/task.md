# Task v1.6.2: Professional Theme Editor & UI Integrity

**Objective**: Реалізувати повноцінну систему налаштування тем (рівня Bootstrap/Tailwind) та виправити всі UX-недоліки компонентів.

## 1. Deep Theme Engine (CSS Variables Page)

- [x] **Full Palette**: Додати змінні для всіх станів: `primary`, `secondary`, `success`, `warning`, `error`, `info`.
- [x] **Geometric System**: Додати радіуси (`sm`, `md`, `lg`) та відступи (`space-sm`, `space-md`, `space-lg`).
- [x] **Type-Safe Inputs**: Використовувати `type="color"` для кольорів та числові інпути для розмірів.
- [x] **Exportable Config**: Підготувати структуру для завантаження/збереження повного конфігу теми.

## 2. UI/UX Refinement

- [x] **ui-toggle**: Видалити бордер з контейнера. Текст зовні, бордер тільки у перемикача.
- [x] **ui-markdown**: Гарантувати рендеринг HTML (Headers, Code blocks) у Preview. Додано `_md2html()`.
- [x] **Modal/Confirm**: Використано `el.open = true` замість неіснуючого `.show()`.
- [x] **Unified Navbar**: Повна відповідність назв та відсутність емодзі на всіх сторінках.

## 3. SEO & Connectivity

- [x] Лендінг (`index.html`) має підхоплювати `lang` з URL (`/uk/index.html`) для SEO.
- [x] Перевірити роботу в IDE модальних вікон на українській версії.

## 4. Verification

- [x] Повне покриття тестами у `task.spec.js`.
- [x] Усі тести GREEN.

## 5. Architect Feedback (Round 1)

- [x] **Table light theme**: `--fg-muted` не був пропагований у light theme → Role колонка білий текст на білому.
- [x] **Tree**: Розширено з 1 рівня до 4 (Рослини/Тварини/Гриби → Сімейство → Рід → Вид).
- [x] **Alert**: Видалено з `labelComponents` — ui-alert має нативний `.content`, не потребує mapping до `.label`.
- [x] **Modal/Confirm**: `.show()` не існує → `el.open = true`.
- [x] **ProgressBar**: Tag `ui-progress-bar` не існує, компонент `ui-progress` → додано `tagAliases`.
- [x] **LangSelect**: YAML `langs: ['uk','en']` (string[]) → конвертовано у `[{code,title}]`.
