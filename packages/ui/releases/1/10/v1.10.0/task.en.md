# Mission of release v1.10.0 — The Domain Bloom: Layouts & UI Models

🇺🇦 [Ukrainian version](./task.md)

## Scope

This release adds 20 new domain models to the `@nan0web/ui` ecosystem, transforming it into a full-scale "block-based" framework. We are also finalizing Documentation (ProvenDoc) and Localization.

### Phase 1: Layout Core
- Added `HeaderModel`, `FooterModel`, `HeroModel`.
- Standardized constructors: `Partial<Model> | Record<string, any>`.

### Phase 2: Component Library (Model-as-Schema)
- Added 10+ models for common components (Pricing, Stats, Timeline, Gallery, Accordion, Tabs).
- Implementation of `TestimonialModel extends CommentModel`.

### Phase 3: Business & UI Utils
- Added `EmptyStateModel`, `BannerModel`, `ProfileDropdownModel`.
- Visibility configs: `HeaderConfigModel`, `FooterConfigModel`.

### Phase 4: Documentation & Hygiene
- Full synchronization of `README.md` (English) and `docs/uk/README.md` (Ukrainian).
- Introduction of `.npmignore` to exclude tests and artifacts from the NPM package.

## Acceptance Criteria (Definition of Done)

- [x] All 20 new models are available through `import { Model } from '@nan0web/ui'`.
- [x] `npm run test:docs` passed successfully (`README.md` generated).
- [x] `docs/uk/README.md` has 100% parity with EN version in content (code in EN).
- [x] `.npmignore` correctly filters artifacts (verification through `npm pack --dry-run`).
- [x] Regression tests (v1.2.0–v1.10.0) passing at 100% (491+ tests).

## Architecture Audit (Checklist)

- [x] Ecosystem indices read? Yes, `project.md` updated.
- [x] Are there analogs in packages? No, unique UI models.
- [x] Data sources: YAML, nano, md, json, csv? No, system classes.
- [x] UI-Standard compliant (Deep Linking)? Not applicable.
