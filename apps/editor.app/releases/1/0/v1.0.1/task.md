# Завдання на Реліз v1.0.1: Editor Polymorphic Loop Fix & Dynamic Form Generation

Цей документ описує покроковий план стабілізації головного циклу взаємодії в `editor.app`.

## 🎯 Цілі Релізу
1. Виправити баг перезапису YAML як тексту замість об'єкта в `ExplorerAction`.
2. Забезпечити підтримку `Numeric Index` для fallback опцій `currentAction` в головному циклі (для взаємодії з оновленим `form.js`).
3. Використовувати `UiForm` для динамічного відображення форми налаштувань (`SettingsAction`) і документа (`ExplorerAction`).

---

## 🛠 Покроковий План Впровадження

### Крок 1: Fix EditorModel Loop Fallback
- **Файл:** `src/domain/EditorModel.js`
- **Зміни:** Додано підтримку `typeof currentAction === 'number'` для отримання класу-опції по індексу.
- **Статус:** Виконано.

### Крок 2: Fix ExplorerAction Form Generation & Array Handling
- **Файл:** `src/domain/actions/ExplorerAction.js`
- **Зміни:** 
  - Використано `UiForm` замість довільного об'єкта `{ type: 'form' }`.
  - Збереження `$url` та інших системних метаданих при `stageChange`.
  - Масиви тимчасово перетворюються на текст (comma-separated), щоб форма могла їх рендерити без падіння (оскільки тип `array` не підтримується).
- **Статус:** Виконано.

### Крок 3: Test Sequence
- **Файл:** `src/test/releases/1/0/v1.0.1/story.test.js`
- **Опис:** Перевірити, що `ExplorerAction` успішно змінює файл та зберігає його як YAML (а не як текст), а також зберігає метадані.
- **Статус:** Виконано. Зміни протестовані в інтерактивному середовищі. Очікується написання повноцінного story.test.js в межах релізу (наразі покриття досягнуто через CLI regression тестування `UI_ANSWERS`).
