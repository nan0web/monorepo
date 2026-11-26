# User Log — v3.6.1

- **2026-11-26**: Запит на усунення системної помилки кешування в `DBDir.js` (`getGlobals`), `DBFetch.js` (`getInheritance`, `fetchMerged`), та інвалідації в `DBBase.js` / `DBDoc.js`.
- **2026-11-26**: Узгоджено `predefined`-набір та контрактний тест (`Promise.all` для 3 документів в одній директорії, перевірка `readDir <= 2`, `loadDocument <= 8`, повторний `fetch` = 0 зчитувань, інвалідація при `saveDocument`).
