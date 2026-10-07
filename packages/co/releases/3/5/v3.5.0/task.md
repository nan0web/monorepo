# Реліз CO-5 (v3.5.0): Verse Domain Models & Media Hybrid Architecture

*🇺🇦 Українська*

## 1. Паспорт Релізу
- **Пакет:** `@nan0web/co`
- **Версія:** `v3.5.0`
- **Попередня версія:** `v3.4.0`
- **Тип:** Minor (New Domain Models, Package Exports & Media Architecture)
- **Статус:** Completed

---

## 2. Огляд та Архітектурна Мотивація
Метою релізу v3.5.0 є реорганізація внутрішньої структури кодової бази пакету `@nan0web/co` з винесенням чистих доменних сутностей у директорію `src/domain/`, підтримкою експортів `./domain/*`, впровадженням повноцінної моделі `Media` (extends `Model`) з підтримкою гібридного позиціонування медіа (Формат A: шорткодні якорі `::media[id]` / `![[id]]` у Markdown та Формат B: директива `Media.placement`), а також гарантією 100% зворотної сумісності для класичного `Message` (`parseBody`, `static Body`) при можливості безшовного спадкування та розширення.

---

## 3. Декларація Задач (Tasks)

### §1. Реорганізація структури `src -> src/domain`
- [x] Перенесення чистих доменних моделей у `src/domain/`:
  - `Identity.js`, `Connection.js`, `Post.js`, `Media.js`
  - `Interaction.js`, `Service.js`, `Event.js`
  - `Message.js`, `Chat.js`, `Contact.js`, `Language.js`
- [x] Створення фасадного `src/domain/index.js` з експортом усіх моделей.
- [x] Збереження кореневих файлів `src/*.js` як сумісних ре-експортів (`export * from './domain/...'`).
- [x] Конфігурація `package.json` експортів для підшляхів `./domain` та `./domain/*`.

### §2. Модель `Media` та гібридний формат A + B у `Post`
- [x] Створення моделі `Media.js` (`extends Model`) з метаданими `id`, `url`, `type`, `caption`, `placement`.
- [x] Оновлення `Post.js`: `static media = { type: [Media], default: [] }` з автоматичною типізацією елементів масиву через `Media.from`.
- [x] Документування та контрактна перевірка гібридного зв'язку шорткодів (`::media[photo-1]` / `![[photo-1]]`) та директиви `placement` (`after_paragraph`, `align`).

### §3. Зворотна сумісність `Message` та типізація
- [x] Повна сумісність `Message.parseBody()` зі збереженням поведінки валідації (`validate()`, `getErrors()`, `static Body`).
- [x] Успішна генерація `types/` через `tsc` без помилок типізації.
- [x] Проходження 100% тестів регресії (`npm run test:all`).

---

## 4. Контрактні Тести (Target Files)
- `packages/co/releases/3/5/v3.5.0/task.spec.js`
- `packages/co/src/domain/*`
- `packages/co/src/index.js`
- `packages/co/package.json`
