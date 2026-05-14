# Місія релізу v1.9.0 — OLMUI Domain Models Extension (Migration Seed)

🇬🇧 [English version](./task.en.md)

## Scope

Розширення базового кістяка OLMUI (One Logic — Many UI) для пакету `@nan0web/ui` з метою покриття 99% потреб сучасних веб-додатків та SaaS без необхідності писати кастомні схеми.

### Phase 1: Layout Models
- `HeaderModel.js` — title, logo, `actions: Navigation[]`, `lang`, `langs`
- `FooterModel.js` — copyright, version, license, `nav: Navigation[]`, `share: Navigation[]`, `langs`
- `HeroModel.js` — title, description, image, `actions: Navigation[]` (заміна одинарного CTA)

### Phase 2: Universal Components
- `PriceModel.js` — value (number), currency (string)
- `PricingModel.js` — title, `price: PriceModel`, `features: string[]`
- `CommentModel.js` — author, avatar, text, date
- `TestimonialModel.js` — **extends CommentModel** + rating (number)
- `StatsItemModel.js` — label, value, trend
- `StatsModel.js` — title, `items: StatsItemModel[]`
- `TimelineItemModel.js` — date, title, description
- `TimelineModel.js` — title, `items: TimelineItemModel[]`
- `TabsModel.js` — active (number), tabs (object[])
- `AccordionModel.js` — title, content, open
- `GalleryModel.js` — title, items (object[]), columns

### Phase 3: Visibility Configs
- `HeaderVisibilityModel.js` — logo, theme, search, share, nav, langs (boolean)
- `HeaderConfigModel.js` — `ui: Record<string, HeaderVisibilityModel>`
- `FooterVisibilityModel.js` — copyright, version, license, nav, clock (boolean)
- `FooterConfigModel.js` — `ui: Record<string, FooterVisibilityModel>`

### Phase 4: Business Critical
- `EmptyStateModel.js` — icon, title, description, `action: Navigation`
- `BannerModel.js` — text, href, closable
- `ProfileDropdownModel.js` — name, email, avatar, `actions: Navigation[]`

## Acceptance Criteria (Definition of Done)

- [x] 20 нових моделей створено, усі `extends Model` від `@nan0web/core`.
- [x] `TestimonialModel extends CommentModel` — валідне спадкування.
- [x] `domain/index.js` та `components/index.js` експортують усі 30 моделей.
- [x] 24 контрактні тести pass (Phase 1–4).
- [x] `npm run test:unit` — 208 pass, 0 fail.
- [x] `tsc build` — 0 errors.

## Architecture Audit (Чекліст)

- [x] Чи прочитано Індекси екосистеми? Так, перевірено `project.md` та існуючі моделі.
- [x] Чи існують аналоги в пакетах? Ні, LinkModel не існував; HeroModel, HeaderModel, FooterModel — нові.
- [x] Джерела даних: YAML, nano, md, json, csv? Ні, це системні Model-as-Schema класи без даних.
- [x] Чи відповідає UI-стандарту (Deep Linking)? Не стосується — це доменний шар.
