# User Instructions & Feedback

1. **Workflow & Releases**:
   "When we do a release, we should have a folder `releases/vX.Y.Z/`. Everything starts from my business requirements. I want you to create a `user.md` file in the release folder where you place all my notes, objections, and feedback. This logs how we developed the app."
2. **Tasks (`task.md`)**:
   "Every note in `user.md`, if not described in a spec, should become a new task in `task.md`. We don't overwrite base tasks, we spawn new ones."
3. **App Architecture & Adapters**:
   "In `editor.app`, `src/main.js` is the main entry point, but it's confusing. Which interface is it pointing to? If it's CLI, it should be `src/ui-cli/main.js`. If it's web, it should be `src/ui-web/main.js` or `ui-lit`. Everything should be structured correctly."
4. **`nan0web.app` Runner**:
   "Make sure `nan0web.app` acts as the master app runner that can start from any directory. It parses configuration files and runs."

5. **Release Workflow**:
   "I see `release-notes.md`. Standard workflow says it should be `release.md`. That document shouldn't just be notes - it's the acceptance criteria for the whole release. `user.md` is a log, we just append to it (down, down, down) and never delete. We create a tasks file, maybe `tasks.md` and append to it or use separate task docs. Let's use `tasks.md` and append."

6. **DB Abstraction**:
   "The database is just DSN. Any storage. We should initialize it using abstract `DB` and feed it `DBBrowser` as an adapter:
   `import DBBrowser from '@nan0web/db-browser'`
   `import { DB } from '@nan0web/db'`
   `const db = new DB()`
   `db.setAdapter(new DBBrowser({ host: window.location.origin, root: "data" }))`"

7. **Config Parsing & App Runner**:
   "nan0web app should parse `nan0web.config.nan0` / `.json` / `.yaml` / `.js` or run via CLI prompt `% nan0web config`. It parses data, generates state, and handles real routing. Please create a basic `nan0web.app` environment setup."

8. **CLI Entry Point / Sandbox**:
   "`play/cli.js` should actually be `src/ui-cli/main.js`. If we have a Sandbox for CLI, it should be executable. Fix the directories."

9. **Domain & Schemas**:
   "Models and schemas should be in `src/domain`. We export them so other apps can use them. They act as schemas for our data-driven UI."

10. **Logging Policy**:
    "Use `console.info` or `console.debug` for persistent logs. `console.log` is only for temporary debugging and must be removed after use."

11. **App Environment**:
    "`nan0web.app` should support `bun` and `nan0-runner` ideology. It should handle DSN strings for any storage (redis, mongo, sql) via adapters."

12. **AppRunner Architecture**:
    "In `nan0web.app/src/runner.js`, we should use `@nan0web/db` and its `DBwithFSDriver` (or `@nan0web/db-fs` classes) instead of raw `node:path` and `node:fs`. The goal is to be platform-agnostic. We shouldn't 'extract' models automatically; they should be exported to `index` of `src/domain` and then picked up. When we attach an app to the runner, it should expose its models through a standard scheme."

13. **i18n in Runner**:
    "We should support multilingual nan0web.app. Detect locale from environment, load translations via db.extract(locale) pattern:
    `const localeDb = await db.extract(locale)`
    `const app = await localeDb.fetch('index')`
    `app.t` → translations, `app.langs` → available languages.
    Global translations live in `data/_/t.yaml`, locale-specific in `data/uk/_/t.yaml`."

14. **Config Loading Strategy**:
    "Config loading should use `db.loadDocument()` for nan0/yaml/json files, but `.js` config must go through `import()`. Don't forget to actually LOAD the file, not just detect it."

15. **Runner as CLI Generator**:
    "Runner should follow the `async function* run()` standard from ui-cli. This makes it composable — CLI can render each yield, tests can collect yields, web can stream them."

16. **Config Prompt as Model-as-Schema**:
    "When no config is found, or user runs `nan0web config`, we should use `Form.createFromBodySchema(NaN0WebConfig)` from ui-cli to generate an interactive config wizard. The schema IS the form."
