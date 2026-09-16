---
name: tasks-v0.2.0
version: 0.2.0
status: active
---

# 📋 Завдання та Критерії Прийомки (v0.2.0)

## 🔹 Задача 1: `ReleaseAuditor` на базі `AuditorModel`
- [x] Створити клас `ReleaseAuditor` (розширює `AuditorModel` з `@nan0web/inspect`).
- [x] Перевірка структури директорій `releases/{major}/{minor}/vX.Y.Z/`.
- [x] Перевірка наявності та валідності `release.md`, `user.md` (Hours, Iterations, RRS score), `*.spec.js` / `*.test.js`.
- [x] Формування списку типізованих помилок `AuditorError` з чіткими інструкціями щодо виправлення (`suggestion`, `fix`).

## 🔹 Задача 2: Оновлення `CheckCommand`
- [x] Інтегрувати виклик `ReleaseAuditor` у `CheckCommand`.
- [x] Підтримка виведення стислого та розгорнутого звіту з кодами діагностики.
- [x] Коректне завершення процесу з відповідним exit status (`ok: true/false`).

## 🔹 Задача 4: Виправлення кодування закладок у ReleaseDashboard
- [x] Замінити застарілу/помилкову функцію `escape()` у браузерному коді закладок на безпечне текстове вставлення (`textContent` / DOM nodes або правильний HTML-escape).
- [x] Забезпечити правильне відображення емодзі та українських літер у закладах `defaultBookmarks` та `customBookmarks`.

## 🔹 Задача 5: Фільтрація по продукту та перемикання релізів
- [x] Додати швидкий клік на бейдж/шлях проєкту для ізоляції перегляду лише одного продукту.
- [x] Додати інтерфейс вибору конкретної версії (v1.0.0, v0.2.0 тощо) у списку релізів проєкту з оновленням відображуваних завдань і метрик.

## 🔹 Задача 6: Інтерактивний Тур Data-Driven змін
- [x] Додати вкладку/блок «Тур змін» (Demo/Tour) для релізу з відображенням згенерованого $content / story-прикладів.

## 🔹 Задача 7: OLMUI Data-Driven Модель (ui/cli, ui/tui)
- [x] Ізоляція обчислень та стану (пріоритети 0..3, завдання, RRS, версії) у чистій `DashboardModel`.
- [x] Виділення CLI компонентів у `src/ui/cli/` (`ProjectTable.js`, `ProjectInspector.js`).

## 🔹 Задача 8: Web-компоненти Lit (`src/ui/lit/`) та `ui/web`
- [x] Реалізація Web Components на базі `@nan0web/ui-lit` для карток (`ReleaseProjectCard`), списку завдань (`ReleaseTaskList`) та фільтрів (`ReleaseFilterBar`, `ReleaseDashboardLit`).
- [x] Налаштування мапінгу у `package.json`: `exports['ui/web'] = './src/ui/lit/index.js'`.
- [x] Збереження локального стану (обрані фільтри, закладки, пріоритети) через `this.$db` (IndexedDB).

## 🔹 Задача 9 (P0): Декомпозиція `DashboardModel` на атомарні сутності (<250 рядків)
- [x] Виділення Git-телеметрії (`GitTelemetry.js`, ~100 рядків) для гілок, dirty-статусу та розрахунку годин/ітерацій.
- [x] Виділення парсера релізів (`ReleaseParser.js`, ~140 рядків) для frontmatter YAML, user.md метрик, завдань та нормалізації пріоритетів (0..3).
- [x] Виділення сканера версій (`ReleaseDiscovery.js`, ~90 рядків) для пошуку версій через `db.listDir` та сортування SemVer.
- [x] Редукція `DashboardModel.js` до оркестратора обсягом до 200 рядків відповідно до стандарту File Size Hygiene (`docs/uk/workflows/code-style.md`).



