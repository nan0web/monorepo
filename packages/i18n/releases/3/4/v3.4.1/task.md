---
version: 3.4.1
type: patch
status: in_progress
locale: uk
models:
  - I18nInspector
---

# 🐛 Patch: Виправлення таймауту I18nInspector (v3.4.1)

## 🏁 Overview (Огляд)

Виключає нерелевантні директорії (`releases`, `data`, `docs`, `coverage`, `tmp`) зі сканування `I18nInspector`, щоб уникнути 30-секундного таймауту при повному `nan0inspect audit --non-interactive`.

## 🎯 Definition of Done

1. `EXCLUDE_DIRS` у `src/inspect/I18nInspector.js` містить `releases`, `data`, `docs`, `coverage`, `tmp`.
2. Контрактний тест `releases/3/4/v3.4.1/task.spec.js` підтверджує, що файли в `releases/` та `data/` ігноруються під час аудиту.
3. Усі тести `@nan0web/i18n` проходять успішно.
