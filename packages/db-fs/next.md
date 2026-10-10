# 🌐 NaN0Web Monorepo Roadmap & Global Synchronization

> **Синхронізація (Checkpoint)**: 2026-10-02 (Architechnomag)
> **Статус**: Релізи `@nan0web/ui-payload@3.4.1` та `@nan0web/payload-cms.app@3.4.0` завершено і верифіковано.

---

## 📍 Де ми зупинилися (Global Status):

### 1. `@nan0web/ui-payload` (v3.4.1)
- **Мета**: Повна TypeScript типізація subpath експортів (`types/*.d.ts`), Lexical Nan0HTMLFeature, UI клітини (`ImageCell`, `BooleanCell`, `MapCell`) та шаблонізатор `PayloadCollectionTemplate`.
- **Файл релізу**: [`packages/ui-payload/releases/3/4/v3.4.1/task.md`](file:///Users/i/src/nan.web/packages/ui-payload/releases/3/4/v3.4.1/task.md)
- **Статус**: Реліз v3.4.1 успішно закрито (`test:all` зелений, tsc build, регресійні тести v3.3.0 та v3.4.1 проходять, knip чисто).








---

### 2. `@nan0web/payload-cms.app` (v3.4.0)
- **Мета**: Повне покриття Payload CMS v3: структурні типи (`group`, `tabs`, `point`), колекції з `auth: true` та `versions: { drafts: true }`, розширені `upload` (mimeTypes, imageSizes), генерація майстер-конфігу `payload.config.js`, доменні моделі референсного додатку (`AdminUser`, `DocCategory`, `DocPage`, `MediaAsset`, `SiteConfig`).
- **Файл релізу**: [`apps/payload_cms.app/releases/3/4/v3.4.0/task.md`](file:///Users/i/src/nan.web/apps/payload_cms.app/releases/3/4/v3.4.0/task.md)
- **Статус**: Всі контрактні та сценарні тести проходять (81/81 pass, tsc чистий). Версію оновлено до 3.4.0.








---

### 3. `@nan0web/csv0` (v3.5.0) & `@nan0web/inspect` (v3.6.0)
- **`@nan0web/csv0`**: Завершено (8/8 pass, `test:all` зелений, `Format`, `BooleanFormat` 0/1, FrontMatter `columns:`).
- **`@nan0web/inspect`**: `ModuleRegistry` та `ModuleItem` готові (`9/9 pass`, `test:all` зелений).








---

## 🧭 Порядок дій після перезавантаження (Action Items):

1.- **Реліз `@nan0web/db-fs@3.5.1` (Completed)**:

   - [x] Автоматична детермінація розширень сховища (.nan0 / .md з frontmatter).
   - [x] Очищення внутрішнього поля `_` моделей при збереженні.
   - [x] Релізний паспорт `releases/3/5/v3.5.1/task.md` закрито (100% тестів пройдено).

1.- **Реліз `@nan0web/db-fs@3.6.0` (Completed)**:

   - [x] Сформовано ТЗ у `releases/3/6/v3.6.0/task.md`.
   - [x] Задача: Прозорий Base36 шардинг (`resolveShardedSegment`, 1296 кошиків) та безпечний мапінг `:` -> `~` на рівні `DBFSPath` / `DBFSDoc` / `DBFSDir`.
   - [x] TDD контракт `releases/3/6/v3.6.0/task.spec.js` (11/11 pass).
   - [x] nan0inspect audit 100% OK, test:all зелений.

1.- **Після `@nan0web/db-fs@3.6.0`**:

   - [ ] Перенесення контракту шардингу в `@nan0web/db-browser` (SSG паритет).
   - [ ] Інтеграція в `apps/learn.app` (модель `Student`, метод `student.getAnswers(testId)`, оновлення команди `assess`).

### PhaseAuditor
- [ ] [phase] .editorconfig: `Missing fundamental file: .editorconfig`






**Boundary**: [@[.editorconfig]](./.editorconfig)
**Context**: [@[project.md]](./project.md), [@[seed.md]](./seed.md)

- [ ] [phase] .npmignore: `Public package is missing .npmignore`






**Boundary**: [@[.npmignore]](./.npmignore)
**Context**: [@[package.json]](./package.json)

---

### JsHygieneAuditor
- [ ] [hygiene] devDependencies.typescript: `Missing devDependency: typescript (required for npm run build)`






  - **Suggested Fix**: `npm install -D typescript`

- [ ] [hygiene] devDependencies.c8: `Missing devDependency: c8 (required for npm run test:coverage)`






  - **Suggested Fix**: `npm install -D c8`
**Boundary**: [@[package.json]](./package.json)

## Recommended Subagents
- `nan0inspect phase --fix`
- `nan0inspect hygiene --fix`
- `nan0inspect snapshots --fix`




---

### JsExportAuditor
- [ ] [exports] DBFSBase.js: `export default prohibited`
- [ ] [exports] DBFSDir.js: `export default prohibited`
- [ ] [exports] DBFSDoc.js: `export default prohibited`
- [ ] [exports] DBFSPath.js: `export default prohibited`
- [ ] [exports] DBFSStream.js: `export default prohibited`
- [ ] [exports] index.js: `export default prohibited`
- [ ] [exports] DBFS.js: `export default prohibited`
- [ ] [exports] FS.js: `export default prohibited`
- [ ] [exports] FSAdapter.js: `export default prohibited`
- [ ] [exports] FSDriver.js: `export default prohibited`
- [ ] [exports] test.js: `export default prohibited`
- `nan0inspect exports --fix`
---

### JsVerificationAuditor
- [ ] [verification] test_style: `Test file src/DBFS.aliases.test.js:11 uses flat test() instead of describe()/it() hierarchy`
- [ ] [verification] test_style: `Test file src/DBFS.locales.test.js:11 uses flat test() instead of describe()/it() hierarchy`
- `nan0inspect verification --fix`
