# Реєстр UI Компонентів NaN•Web Editor

Цей документ визначає склад та призначення основних UI-компонентів редактора, побудованих за принципом **OLMUI (One Logic — Many UI)**.

## 1. Контейнери (Shells)
- **EditorShell**: Головний фреймворк додатка. Керує макетом (Sidebar, Main, Toolbar) та глобальним станом `EditorModel`.
- **FractalModalStack**: Менеджер вкладених контекстів. Дозволяє відкривати редактори пов'язаних документів (`$ref`) у стеку модальних вікон.

## 2. Навігація (Discovery)
- **TreeNavigator**: Гібридне дерево/список файлів. 
  - *Конфігурація*: Поведінка підсвітки (`uiShowStagedMarkers`), кольори (`uiStagedMarkerColor`) та глибина розгортки (`uiTreeNavigatorDepth`) керуються через `EditorConfig`.
- **GlobalSearch**: Швидкий доступ до документів через індексований пошук (Scenario 4.1).

## 3. Редагування (Editing)
- **SchemaForm**: Авто-генератор інтерфейсу на базі `Model-as-Schema`.
- **PolymorphicField**: Універсальний контролер поля. Автоматично підбирає віджет (Select, Input, ReferenceSelector, DatePicker) залежно від метаданих властивості.
- **ReferenceSelector**: Спеціалізований компонент для вибору документів за `$ref`. Підтримує пошук та швидке створення нового документа "на льоту".

## 4. Верифікація (Verification)
- **DiffViewer**: Візуалізація структурних змін (Side-by-Side або Unified). 
  - *Data Source*: Порівнює `Base` (Primary DB) та `Staged` (Local Stage).
- **ValidationPanel**: Список помилок та попереджень, отриманих через `Model.resolveValidation()`.

## 5. Аудит та Стан (Lifecycle)
- **StagingBar**: Нижня панель керування комітами. Відображає кількість змінених файлів та кнопку "Commit to Database".
- **AuditTrailView**: Інтерфейс перегляду історії змін документа.

---
**Статус**: Очікує затвердження архітектором.
