# @nan0web/icons v1.0.0 — Release Task

> **Дата**: 2026-02-26
> **Scope**: First stable release — framework-agnostic SVG icons

## 🎯 Acceptance Criteria (Definition of Done)

1. **Core API** — `toSvg()` та `toElement()` коректно рендерять SVG з icon data
2. **Icon Sets** — Всі сети (`bs`, `fa`, `fa6`, `fi`, `md`, `hi`, `hi2`, `ib`) експортують icon data
3. **Adapters** — Усі 4 адаптери (`lit`, `react`, `string`, `cli`) працюють
4. **Package exports** — `package.json` exports map правильно маршрутизує імпорти
5. **Sandboxes** — Створені пісочниці: `play/ui-cli`, `play/ui-lit`, `play/ui-react`
6. **Tests** — Unit тести покривають core API, адаптери та icon sets
7. **Package Hygiene** — `.npmignore`, `knip.json`, скрипти `test:all`, `knip`, `audit`

## 📐 Architecture Audit

- [x] Прочитано Індекси екосистеми
- [x] Аналогів у пакетах немає (icons — унікальний)
- [x] Джерела даних: react-icons (devDep) → build-time генерація
- [x] UI-стандарт: play/ пісочниці та Universal Explorer для візуальної верифікації
- [x] E2E Тестування: Playwright тести для пісочниці інтегровані в CI
