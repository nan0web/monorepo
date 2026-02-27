# @nan0web/icons — next

> **Версія**: v1.0.0
> **Статус**: 🟡 IN PROGRESS — фінальна перевірка
> **Дата**: 2026-02-26

## 📖 Контекст для агента

> Прочитай `../../system.md` перш ніж починати роботу.
> Release spec: `releases/1/0/v1.0.0/task.spec.js` (26 тестів — ✅ pass)
> Acceptance criteria: `releases/1/0/v1.0.0/task.md`

## ✅ Виконано (v1.0.0)

- [x] ICO-1: Core API (`toSvg`, `toElement`) — рендер SVG з icon data
- [x] ICO-2: Генератор (`scripts/generate.js`) — витяг з react-icons + `_name` field
- [x] ICO-3: Icon Sets: `bs` (2716), `fa`, `fa6`, `fi`, `md`, `hi`, `hi2`, `ib` (custom)
- [x] ICO-4: Adapter: `lit.js` — Lit tagged template helper
- [x] ICO-5: Adapter: `react.js` — `<Icon>` та `reactIcon()` components
- [x] ICO-6: Adapter: `string.js` — re-export для vanilla JS
- [x] ICO-7: Adapter: `cli.js` — Unicode char mapping для терміналу
- [x] ICO-8: Пісочниця `play/ui-cli` — CLI демо
- [x] ICO-9: Пісочниця `play/ui-lit` — Dark theme browser grid
- [x] ICO-10: Пісочниця `play/ui-react` — Light theme з search/size
- [x] ICO-11: Unit тести (`test/icons.test.js`) — pass
- [x] ICO-12: Release spec (`releases/1/0/v1.0.0/task.spec.js`) — 26 pass
- [x] ICO-13: Package hygiene — `.npmignore`, `knip.json`, `test:all`
- [x] ICO-14: Universal Explorer (`play/index.html`) — пошук по 12k+ іконках
- [x] ICO-15: E2E Тестування (`play/explorer.e2e.js`) — Playwright в CI

## 🔴 Залишилось для v1.0.0

- [ ] **FIX `src/README.md.js`** — ProvenDoc 2.0
  - Файл створено, але `DocsParser.decode` — не існує
  - Перевірити правильний метод у `packages/test/src/Parser/DocsParser.js`
  - Запустити: `npm run test:docs`
- [ ] **Запустити `npm run test:all`** — повний pipeline має пройти
- [ ] **Комміт та publish** — `npm publish --access public`

## 📋 Наступні кроки (v1.1.0+)

- [ ] ICO-16: `iconBraille()` — SVG→braille rasterizer для терміналу
- [ ] ICO-17: Kitty/iTerm2 image protocol — нативний рендер SVG
- [ ] ICO-18: docs/uk/README.md — українська локалізація
- [ ] ICO-19: CHANGELOG.md
- [ ] ICO-20: Додаткові сети (Lucide, Phosphor)

---

_Оновлено: 2026-02-26T19:32_
