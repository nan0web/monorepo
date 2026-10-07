# План наступних дій: @nan0web/co

## 📌 Поточний стан (Фіксація v3.5.0: Verse & Domain Architecture)
- ✅ Реорганізовано структуру пакету: всі чисті доменні моделі винесено в `packages/co/src/domain/` (`Identity`, `Connection`, `Post`, `Media`, `Interaction`, `Service`, `Event`, `Message`, `Chat`, `Contact`, `Language`).
- ✅ Створено модель `Media.js` (extends `Model`) з полями `id`, `url`, `type`, `caption`, `placement`.
- ✅ Оновлено `Post.js`: `static media = { type: [Media], default: [] }` з підтримкою гібридного формату A + B (anchor shortcodes `::media[id]` / `![[id]]` + директива `placement`).
- ✅ Налаштовано фасад `src/domain/index.js`, кореневі сумісні ре-експорти `src/*.js` та `package.json` (`./domain`, `./domain/*`).
- ✅ Збережено 100% зворотну сумісність `Message` (`parseBody`, `static Body`, `validate()`).
- ✅ Створено релізний паспорт `releases/3/5/v3.5.0/task.md`, `user.md`, контрактний тест `task.spec.js` та регресійний тест `src/test/releases/3/5/v3.5.0/task.test.js`.
- ✅ Успішно пройдено повну регресію `pnpm run test:all` (70 unit-тестів + 18 docs-тестів + play-тест) та збірку типізації `tsc`.

---

## 🎯 Наступні кроки (Майбутній беклог / v3.6.0)
- Розширення інтеграції Verse в `@nan0web/verse` або прикладних сервісах.
- Додаткові утиліти парсингу гібридних шорткодів медіа (`MarkdownMediaParser`).
