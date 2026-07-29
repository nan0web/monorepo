---
description: Формування та перевірка Web Галереї (Playwright Screenshots)
---

# 🕸 Web Gallery (Playwright Auditor)

У рамках екосистеми OLMUI (One Logic — Many UI) ми обов'язково повинні генерувати візуальну галерею `WEB_GALLERY.md`, яка містить скріншоти (WebP зображення) React/Lit UI-компонентів у браузері. Вона використовується для мануального QA та візуальної верифікації.

## 🏗️ Структура галереї

Галерея має сувору ієрархію, що генерується безпосередньо в директорії `snapshots/`. Це дозволяє зручно переглядати всі снапшоти через вбудований Markdown-рев'ювер VSCode, уникаючи засмічення папки `docs/`.

Структура для Web виглядає так:
`snapshots/web/{locale}/{theme}/{size}/{component_or_flow}/`

У **кожній** папці цієї ієрархії генерується файл `index.md`, який має обов'язкове посилання `⬅ Назад` на рівень вище (прямо на початку документа).

1. **Кореневий рівень `snapshots/web/index.md`**:
   - Посилання на локалізовані галереї: `[uk](./uk/index.md)`, `[en](./en/index.md)`.
   - Зведена таблиця аудиту компонентів та помилок.

2. **Мовний індекс `snapshots/web/{locale}/index.md`**:
   - Навігація вгору: `[⬅ Назад](../index.md)`.
   - Список тем: `☀️ light`, `🌙 dark`, `⚡ contrast`.

3. **Тема індекс `snapshots/web/{locale}/{theme}/index.md`**:
   - Навігація вгору: `[⬅ Назад](../index.md)`.
   - Список ширин (viewports): `📱 375`, `💊 768`, `💻 1024`, `🖥 1200`, `📺 1920`.

4. **Розмір індекс `snapshots/web/{locale}/{theme}/{size}/index.md`**:
   - Навігація вгору: `[⬅ Назад](../index.md)`.
   - Список компонентів або User Stories (`component_or_flow`).

5. **Рівень компонента `snapshots/web/{locale}/{theme}/{size}/{component_or_flow}/index.md`**:
   - Навігація вгору: `[⬅ Назад](../index.md)`.
   - Вбудовані WebP скріншоти (напр., `![Step 1](./step-1.webp)`).

> ⚠️ **ВАЖЛИВО:** Всі згенеровані картинки `*.webp` повинні бути додані до `.gitignore`, щоб не роздувати репозиторій. У Git зберігаються лише `index.md` файли (по суті діють як текстова база відрендереного дерева). Інші формати (наприклад `ssg`) можуть зберігати лише `HTML body` замість картинок.

## 📐 Матриця покриття

Стандартна матриця для повного покриття:

| Параметр  | Значення                             | Кількість |
| --------- | ------------------------------------ | --------- |
| Мови      | `uk`, `en`                           | 2         |
| Viewport  | `375`, `768`, `1024`, `1200`, `1920` | 5         |
| Теми      | `light`, `dark`, `contrast`          | 3         |
| **Разом** | **на 1 компонент**                   | **30**    |

## 🔍 Аудит-перевірки (5 рівнів)

Тест-аудитор виконує 5 автоматичних перевірок для кожного компонента:

1. **Block Exists** — Чи існує DOM-блок з `id="block-{component}"`. Штраф: −10.
2. **Preview Area** — Чи присутній `.example-preview` контейнер. Штраф: −3.
3. **Zero-Hardcode Text** — Чи немає сирих `[T]` mock-перекладів у кнопках. Штраф: −15.
4. **Undefined/Null/NaN** — Чи немає витоку `undefined`, `null`, `[object Object]`, `NaN` у видимих текстах. Штраф: −20.
5. **Locale Mismatch** — Чи немає сирих i18n-ключів (`.dot.notation`) або англійського тексту в `uk`-локалі. Штраф: −15.

## ⚙️ Як сформувати (Команди)

Web Gallery генерується за допомогою Playwright-тесту `e2e/web-gallery.test.js`.

- 🚀 **Генерація скріншотів та документації:**

// turbo

```bash
npm run test:web-gallery
```

Це запускає `playwright test e2e/web-gallery.test.js`, який:

- Піднімає dev-сервер (через `playwright.config.js → webServer`).
- Проходить по всім locale × theme × size × component.
- Знімає WebP-скріншоти у `snapshots/web/{locale}/{theme}/{size}/{component_or_flow}/`.
- Генерує ієрархічні `index.md` з навігацією на кожному кроці.

- 🛠 **Генерація лише для Chromium (швидше):**

// turbo

```bash
npm run test:web-gallery -- --project=chromium
```

- ✨ **Повний цикл:**
  Зазвичай `npm run test:all` містить `test:web-gallery` разом із іншими тестами.

## 🏗️ Як додати новий компонент

1. Створити файл пісочниці `src/ui/{adapter}/components/{Component}.play.jsx` (або `.play.js` для Lit).
2. Додати назву компонента (з `.play`) до масиву `COMPONENTS` у `e2e/web-gallery.test.js`:
   ```javascript
   const COMPONENTS = [
     'CardProduct.play',
     'CardDetails.play',
     'NewComponent.play', // ← додати сюди
   ]
   ```
3. Запустити `npm run test:web-gallery` для генерації скріншотів.
4. Перевірити `WEB_GALLERY.md` — новий компонент має з'явитись у таблиці аудиту.

## 🛡️ Правила верифікації

- **Zero Raw Keys:** У скріншотах галереї не має бути сирих i18n-ключів (наприклад, `cards.order.submit`). Всі ключі повинні бути перекладені.
- **Ізоляція:** Кожен компонент рендериться в ізольованому режимі (`?isolate=block-{name}`) без повного додатку (без Header/Footer/Sidebar).
- **Детермінізм:** Скріншоти знімаються після `waitForLoadState('networkidle')` та додаткового буферу, щоб уникнути flaky-результатів через асинхронне завантаження i18n.
- **Формат:** Скріншоти зберігаються у форматі WebP (або PNG як fallback) для мінімального розміру.

## 📂 Дерево файлів (приклад)

```
project/
├── .gitignore                              # Містить правило: snapshots/**/*.webp
├── snapshots/
│   ├── web/
│   │   ├── index.md                        # Root Web Gallery (Аудит)
│   │   ├── uk/
│   │   │   ├── index.md                    # Локаль
│   │   │   ├── light/
│   │   │   │   ├── index.md                # Тема
│   │   │   │   ├── 375/
│   │   │   │   │   ├── index.md            # Viewport
│   │   │   │   │   └── CardProduct/
│   │   │   │   │       ├── index.md        # Індекс компонента
│   │   │   │   │       └── preview.webp    # ГІТ-ІГНОР (лише локально)
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── ...
│   └── ssg/                                # Приклад для SSG-снапшотів (HTML body замість webp)
└── e2e/web-gallery.test.js                 # Playwright аудитор
```
