# Місія релізу v1.10.0 — The Domain Bloom: Layouts & UI Models

🇬🇧 [English version](./task.en.md)

## Scope

Цей реліз додає 20 нових доменних моделей до екосистеми `@nan0web/ui`, що робить його повноцінним "блочним" фреймворком. Ми також фіналізуємо документацію (ProvenDoc) та локалізацію.

### Phase 1: Layout Core
- Додано `HeaderModel`, `FooterModel`, `HeroModel`.
- Стандартизація конструкторів: `Partial<Model> | Record<string, any>`.

### Phase 2: Component Library (Model-as-Schema)
- Додано 10+ моделей для типових компонентів (Pricing, Stats, Timeline, Gallery, Accordion, Tabs).
- Реалізовано `TestimonialModel extends CommentModel`.

### Phase 3: Business & UI Utils
- Додано `EmptyStateModel`, `BannerModel`, `ProfileDropdownModel`.
- Конфіги видимості: `HeaderConfigModel`, `FooterConfigModel`.

### Phase 4: Documentation & Hygiene
- Повна синхронізація `README.md` (English) та `docs/uk/README.md` (Українська).
- Впровадження `.npmignore` для виключення тестів та артефактів з NPM пакету.

## Acceptance Criteria (Definition of Done)

- [x] Усі 20 нових моделей доступні через `import { Model } from '@nan0web/ui'`.
- [x] `npm run test:docs` проходить успішно (README.md згенеровано).
- [x] `docs/uk/README.md` має 100% паритет з EN версією за змістом (код в EN).
- [x] `.npmignore` коректно фільтрує артефакти (перевірка через `npm pack --dry-run`).
- [x] Регресійні тести (v1.2.0–v1.10.0) проходять на 100% (491+ тестів).

## Architecture Audit (Чекліст)

- [x] Чи прочитано Індекси екосистеми? Так, `project.md` оновлено.
- [x] Чи існують аналоги в пакетах? Ні, це унікальні UI-моделі.
- [x] Джерела даних: YAML, nano, md, json, csv? Ні, системні класи.
- [x] Чи відповідає UI-стандарту (Deep Linking)? Не стосується.
