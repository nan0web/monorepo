# Release v1.9.0 Mission — OLMUI Domain Models Extension (Migration Seed)

🇺🇦 [Українська версія](./task.md)

## Scope

Extend the OLMUI (One Logic — Many UI) domain skeleton for `@nan0web/ui` to cover 99% of modern web/SaaS needs without requiring custom schemas on client projects.

### Phase 1: Layout Models
- `HeaderModel.js` — title, logo, `actions: Navigation[]`, `lang`, `langs`
- `FooterModel.js` — copyright, version, license, `nav: Navigation[]`, `share: Navigation[]`, `langs`
- `HeroModel.js` — title, description, image, `actions: Navigation[]` (replaces single CTA)

### Phase 2: Universal Components
- `PriceModel.js` — value (number), currency (string)
- `PricingModel.js` — title, `price: PriceModel`, `features: string[]`
- `CommentModel.js` — author, avatar, text, date
- `TestimonialModel.js` — **extends CommentModel** + rating (number)
- `StatsItemModel.js` / `StatsModel.js` — label, value, trend
- `TimelineItemModel.js` / `TimelineModel.js` — date, title, description
- `TabsModel.js` — active index + tab definitions
- `AccordionModel.js` — title, content, open (FAQ)
- `GalleryModel.js` — title, items, columns

### Phase 3: Visibility Configs
- `HeaderVisibilityModel.js` / `HeaderConfigModel.js`
- `FooterVisibilityModel.js` / `FooterConfigModel.js`

### Phase 4: Business Critical
- `EmptyStateModel.js` — onboarding placeholder
- `BannerModel.js` — system-level notification bar
- `ProfileDropdownModel.js` — account menu

## Acceptance Criteria (Definition of Done)

- [x] 20 new models created, all `extends Model` from `@nan0web/core`.
- [x] `TestimonialModel extends CommentModel` — valid inheritance.
- [x] `domain/index.js` and `components/index.js` export all 30 models.
- [x] 24 contract tests pass (Phase 1–4).
- [x] `npm run test:unit` — 208 pass, 0 fail.
- [x] `tsc build` — 0 errors.

## Architecture Audit (Checklist)

- [x] Ecosystem indices reviewed? Yes, checked `project.md` and existing models.
- [x] Analogues in other packages? No, HeaderModel, FooterModel, HeroModel are new.
- [x] Data sources: YAML, nano, md, json, csv? No, these are pure Model-as-Schema classes.
- [x] UI standard compliance (Deep Linking)? N/A — domain layer only.
