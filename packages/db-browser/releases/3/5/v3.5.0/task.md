---
version: 3.5.0
type: minor
status: active
locale: uk
models: ["DBBrowser", "BrowserDirectory", "BrowserDriver"]
---

# 🚀 Реліз v3.5.0 — SSG Data Transformation & Type-Aware Storage Determination (.jsonl / .csv / .json)

## 🏁 Overview (Огляд)
Реліз v3.5.0 переводить `@nan0web/db-browser` на підтримку структурованого SSG-експорту:
1. **Автоматична детермінація розширень сховища (`determineExtension`)**:
   - Масиви `Array` з вкладеними об'єктами -> `.jsonl`.
   - Масиви `Array` з плоскими примітивними колонками -> `.csv`.
   - Об'єкти `Object` -> `.json`.
2. **Контракт зворотного читання**:
   - `loadDocument('data/cards')` автоматично завантажує `.jsonl` як повноцінний масив `Array<Object>`.
   - `loadDocument('data/offices')` завантажує `.csv` як масив типізованих рядків.
   - `loadDocument('data/currencies')` завантажує `.json` як словник.
3. **SSG Pipeline сумісність**:
   - Забезпечує безшовне читання з `db-fs` (вихідний YAML/Markdown) та запис у `db-fs` через трансформер `db-browser` для підготовки статики веб-додатків.

## 👥 User Stories (Сценарії)
- Як SSG-генератор, я передаю дані сутностей у `db.saveDocument('dist/data/_/cards', data)`, і база даних сама обирає `.jsonl` або `.csv` без процедурного коду у застосунках.
- Як веб-клієнт у браузері, я викликаю `db.fetch('cards')` і отримую розпарсений масив карток незалежно від того, збережений він у `.jsonl` чи `.json`.

## 🎯 Scope (Задачі)
- [x] Реалізувати поліморфний метод `determineExtension(uri, data)` у `DBBrowser`.
- [x] Додати серіалізатор та десеріалізатор `.jsonl` та `.csv` у конвеєр `DBBrowser.loadDocument` / `saveDocument`.
- [x] Оновити `BrowserDirectory.DATA_EXTNAMES = ['.json', '.jsonl', '.csv', '.yaml', '.nano']`.
- [x] Створити контрактний тест `releases/3/5/v3.5.0/task.spec.js`.
- [x] Підняти версію `package.json` до `3.5.0`.
