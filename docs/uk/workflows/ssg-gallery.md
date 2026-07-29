---
description: Формування та візуальний перегляд збережених HTML-зліпків (SSG) у ізольованому середовищі
---

# ⚡ SSG Gallery Viewer (Static Iframe Architecture)

У рамках екосистеми OLMUI ми зберігаємо легкі текстові HTML-фрагменти (SSG-снепшоти) у папці `snapshots/ssg/`. Для того, щоб QA-інженери або розробники могли зручно "проклікати" та візуально оцінити ці зліпки, ми генеруємо швидкий локальний **SSG Gallery Viewer**.

## 🏗️ Проблематика (Media Queries та Ізоляція)

Збережені SSG-снепшоти — це "голі" HTML-блоки (без `<html>` та `<head>`). Якщо їх просто вставити у `div` (навіть з `width: 375px`), виникають три критичні проблеми:

1. **Поведінка Media Queries:** CSS-правила типу `@media (min-width: 768px)` (які керують сіткою Bootstrap чи Tailwind) спрацьовують відштовхуючись від реальної ширини *вікна браузера*, а не ширини `div`-контейнера. Молекула `375px` буде рендеритись як десктоп.
2. **Конфлікти CSS-фреймворків (Agnostic):** Пакет може використовувати Bootstrap, інший — Lit Web Components, третій — Tailwind. Ми не можемо просто підключити один файл стилів на всю сторінку галереї.
3. **Глобальний Scope:** Ідентифікатори зліпків можуть перетинатися з UI самого в'юера галереї.

## 🛠 Архітектурне Рішення: "Isolated iframe + Markdown Hierarchy"

Для того, щоб забезпечити **чесний** рендер HTML-фрагментів, використовується архітектура ізольованих iframe, які вбудовуються у Markdown або окремий HTML-рендер.

1. Галерея генерує ієрархію в `snapshots/ssg/` (аналогічно Web: `locale/theme/size/component`).
2. У **кожній** папці генерується файл `index.md` з навігацією `⬅ Назад`.
3. SSG-зліпки — це чисті HTML-файли (`.html` body). VSCode підтримує їх перегляд, але для точного `@media` рендеру галерея додатково створює `SSG_GALLERY.html` (Local Only) або інжектує `<iframe width="375" height="800"></iframe>` для чесного viewport.
4. Всередині iframe інжектується базова структура:
   ```html
   <!DOCTYPE html>
   <html lang="uk" data-bs-theme="dark">
   <head>
     <!-- Vite Native CSS Injection (Single Source of Truth) -->
     <script type="module" src="/src/ui/react-bootstrap/theme.js"></script>
   </head>
   <body>
     {SSG_HTML_CONTENT}
   </body>
   </html>
   ```

## 🎨 Zero-Logic Style Injection (theme.js)

> **ОБОВ'ЯЗКОВО** для всіх додатків, що використовують SSG Gallery Viewer.

### Проблема

Коли SSG-зліпок рендериться в iframe, йому потрібні повні стилі додатка (Bootstrap, кастомний CSS, шрифти). Існують три підходи:

| Підхід | Fidelity | HMR | Maintenance |
|--------|----------|-----|-------------|
| ❌ Хардкод CDN + `<link>` | Низька (розсинхронізація) | Ні | Постійна ручна синхронізація |
| ❌ Окрема CSS-збірка | Висока (після rebuild) | Ні | Додатковий конвеєр |
| ✅ **Vite Native (theme.js)** | **100% клон додатка** | **Так** | **Налаштував 1 раз** |

### Рішення: Style Entrypoint

Кожен додаток **обов'язково** виділяє всі CSS-імпорти в окремий файл `theme.js`:

```js
// src/ui/react-bootstrap/theme.js — ЄДИНЕ ДЖЕРЕЛО ПРАВДИ ДЛЯ СТИЛІВ
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
```

Основний entry point (`main.jsx`) підключає стилі через нього:

```js
// main.jsx
import './theme.js'
import App from './App.jsx'
```

### Як це працює в SSG Gallery

Всередині кожного iframe в'юер підключає `<script type="module" src="/src/ui/react-bootstrap/theme.js">`.
Vite бачить цей запит, компілює всі CSS-залежності з `theme.js`, і **нативно інжектує стилі** у `<head>` iframe без запуску React, Router чи API.

**Результат:**
- ✅ **100% відповідність стилів** реальному додатку
- ✅ **Vite HMR:** зміна в `styles.css` миттєво оновлює всі iframe
- ✅ **Zero Logic Overhead:** жодного React, Store чи API-дзвінку

### ⚠️ Gotcha: Екранування `</script>` у srcdoc

Коли `srcDoc` формується всередині `<script>` блоку HTML-файлу, HTML-парсер бачить `</script>` і **передчасно закриває зовнішній скрипт**. Рішення:
```js
// ❌ Зламає парсер:
`<script src="theme.js"></script>`

// ✅ Безпечно:
`<script src="theme.js"><${'/'}script>`
```

## ⚙️ Як сформувати (Команди)

Viewer генерується скриптом `bin/build-ssg-gallery.js`, який "запаковує" всі `snapshots/ssg/` файли у єдиний статичний портал `public/SSG_GALLERY.html`.

- 🚀 **Згенерувати SSG-галерею:**

// turbo

```bash
npm run test:ssg-gallery
```

Ця команда зчитує всі `.html` зі `snapshots/ssg/` і створює зручну панель навігації з фільтрами (мова, viewport, тема: light, dark, contrast) для тестувальника.

- 🛠 **Повний цикл:**
  Зазвичай `npm run test:all` перегенерує цей viewer на фінальному етапі після зняття снепшотів.

## 🛡️ Правила верифікації

- **Local Only:** `public/SSG_GALLERY.html` додається у `.gitignore`. В репозиторії живуть виключно `.html` зліпки з `snapshots/ssg/`.
- **Iframe Supremacy:** Будь-яка візуалізація SSG здійснюється тільки через iframe із заданими жорсткими `width/height` відповідно до параметрів снепшота (мобільний 375, планшет 768, десктоп 1200).
- **theme.js Contract:** В'юер підключає стилі **виключно** через `theme.js` (або еквівалент). Хардкод CDN-посилань у srcdoc **заборонений**.
- **Framework Agnostic:** В'юер повинен вміти приймати URL або строку з CSS, який необхідно підключити всередину iframe, щоб коректно рендерити Lit чи React.
- **Теми:** В'юер повинен автоматично проставляти атрибути теми (наприклад `data-bs-theme="dark"` або `data-theme="contrast"`) на `<html>` всередині iframe, якщо сніпшот належить до такої теми.
