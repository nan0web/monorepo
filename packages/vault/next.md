# 🎯 Next Steps: @nan0web/inspect (Release v3.7.0)

> **Статус**: Всі задачі релізу v3.7.0 виконано та верифіковано (14/14 контрактних тестів, test:all 100% Green).
> **Оновлено**: 2026-10-10 10:30 (Architechnomag)

---

## 📍 Де ми зупинилися (Точка синхронізації):

1.- **Реліз v3.7.0 (`InspectConfig` Model & Cascading Setup)**:

   - Контрактний паспорт релізу: [`packages/inspect/releases/3/7/v3.7.0/task.md`](file:///Users/i/src/nan.web/packages/inspect/releases/3/7/v3.7.0/task.md)
   - Контрактні тести (TDD Green): [`packages/inspect/releases/3/7/v3.7.0/task.spec.js`](file:///Users/i/src/nan.web/packages/inspect/releases/3/7/v3.7.0/task.spec.js)
   - Реалізовані моделі та аудитори:
     - [`packages/inspect/src/domain/config/InspectConfig.js`](file:///Users/i/src/nan.web/packages/inspect/src/domain/config/InspectConfig.js) (`InspectConfig extends Model`, каскадний `load`, підтримка `skip`, `include`, `modules`, `theming`, `snapshots`, `rules`).
     - [`packages/inspect/src/domain/app/js/JsVerificationAuditor.js`](file:///Users/i/src/nan.web/packages/inspect/src/domain/app/js/JsVerificationAuditor.js) (аудит `test_style`: заборона плоских `test()`, вимога `describe()`/`it()`).
     - [`packages/inspect/src/domain/app/js/JsDomainAuditor.js`](file:///Users/i/src/nan.web/packages/inspect/src/domain/app/js/JsDomainAuditor.js) (аудит `regex_in_loop` антипатернів продуктивності).
   - Інтеграція в монорепозиторій Industrial Bank:
     - `apps/3rdparty/industrialbank/inspect.config.nan0` та `cms/inspect.config.nan0` створені та перевірені (`pnpm run inspect:cms` та `pnpm run inspect:bank` проходять з кодом 0).

---

## 🚀 Готовність до наступних кроків:

1.- Реліз v3.7.0 повністю завершено, перевірено та задокументовано.

- Папка `packages/inspect` проходить `pnpm run test:all` (включаючи `lint`, `build` `d.ts`, `knip`, `test:release`, `test:docs`) без жодних зауважень.


---

### PhaseAuditor
- [ ] [phase] .editorconfig: `Missing fundamental file: .editorconfig`


**Boundary**: [@[.editorconfig]](./.editorconfig)
**Context**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)

---

### JsDomainAuditor
- [ ] [domain] src/domain/AuditorModel.js: `Missing constructor declaration or JSDoc @type for static schema field 'timeout' in src/domain/AuditorModel.js (AuditorModel)`



---

### JsVerificationAuditor
- [ ] [verification] test_style: `Test file src/test/domain/ProjectModel.test.js:5 uses flat test() instead of describe()/it() hierarchy`




## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect domain --fix`
- `nan0inspect verification --fix`- [ ] [verification] test_style: `Test file src/test/releases/3/7/v3.7.0/task.test.js:305 uses flat test() instead of describe()/it() hierarchy`- [ ] [phase] CONTRIBUTING.md: `Missing fundamental file: CONTRIBUTING.md`
**Boundary**: [@[CONTRIBUTING.md]](./CONTRIBUTING.md)
- [ ] [phase] LICENSE: `Missing fundamental file: LICENSE`
**Boundary**: [@[LICENSE]](./LICENSE)
- [ ] [phase] .npmignore: `Public package is missing .npmignore`
**Boundary**: [@[.npmignore]](./.npmignore)
**Context**: [@[package.json]](./package.json)

---

### JsHygieneAuditor
- [ ] [hygiene] scripts.play: `Missing required script: play`
  - **Suggested Fix**: `"play": "nan0cli --data play"`
- [ ] [hygiene] scripts.test:docs: `Missing required script: test:docs`
  - **Suggested Fix**: `"test:docs": "node --test --test-timeout=3333 'src/docs/**/*.md.js' 'src/README.md.js'"`
- [ ] [hygiene] scripts.test:coverage: `Missing required script: test:coverage`
  - **Suggested Fix**: `"test:coverage": "c8 node --test"`
- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`
  - **Suggested Fix**: `npm install -D c8`
**Boundary**: [@[package.json]](./package.json)
- [ ] [hygiene] tsconfig.compilerOptions.moduleResolution: `tsconfig.json compilerOptions.moduleResolution should be "nodenext" for node profile`
**Boundary**: [@[tsconfig.json]](./tsconfig.json)
**Context**: [@[tsconfig.json]](./tsconfig.json)

---

### JsExportAuditor
- [ ] [exports] src/domain/index.js: `src/domain/ exists but src/domain/index.js is missing`
- [ ] [verification] play/: `No play/ directory found — playground is mandatory for every package`
- [ ] [verification] src/**/*.{test,story}.js: `No *.test.js or *.story.js files found in src/`
- [ ] [verification] src/README.md.js: `README.md.js (ProvenDoc) not found`
- `nan0inspect hygiene --fix`
- `nan0inspect exports --fix`
- `nan0inspect snapshots --fix`
