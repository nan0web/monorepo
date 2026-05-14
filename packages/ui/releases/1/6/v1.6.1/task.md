# Task v1.6.1: Unified Navigation & Advanced Theme Editor

**Objective**: Привести Master IDE та Documentation Landing до єдиного стандарту, реалізувати повноцінну сторінку редактора CSS змінних та виправити SEO-роутинг.

## 1. Unified Navbar (Consistency)

- [ ] Navbar у Master IDE (`ide.html`) та на Landing Page (`index.html`) має бути ідентичним.
- [ ] Формат: `Документація` | `Карта інтерфейсів` | `Master IDE` | `UK` | `◑`.
- [ ] Видалити емодзі 📖 🗺 🛠 для одноманітності.
- [ ] Назви: "Документація", "Карта інтерфейсів", "Master IDE".

## 2. SEO & Localized Routing

- [ ] SEO сторінки (`/uk/index.html`) мають працювати коректно (завантажувати мову без редиректів у SPA).
- [ ] URL в IDE має змінюватись при зміні мови (`history.pushState`).

## 3. Dedicated CSS Variables Editor

- [ ] Окрема секція абоView в IDE для редагування змінних.
- [ ] Типи інпутів: `color` для кольорів, `number` для розмірів/blur.
- [ ] Список змінних: `--ui-accent`, `--ui-brand-yellow`, `--ui-brand-red`, `--ui-radius`, `--ui-blur`.

## 4. Component Fixes (Render & i18n)

- [ ] **Modal/Confirm**: Кнопки-тригери локалізовані ("Відкрити", "Open") і функціональні.
- [ ] **Toggle**: Бордер тільки навколо самого перемикача (switch), текст мітки (label) — ззовні. (Використовувати CSS змінні або shadow parts).
- [ ] **Button Variants**: Виправити унікальність імен для YAML варіацій (Task 3).

## 5. Verification

- [ ] Усі пункти покриті тестами у `task.spec.js`.
- [ ] `npm run release:spec` проходить 100%.
