# ⚡️ AGENT RULES

## 🗺️ ECOSYSTEM INDEX (MANDATORY START)

> **CRITICAL**: Before writing ANY code, you MUST read the following indices. This is the first step of every session.

- **Packages**: [packages/index.md](packages/index.md) — Core, Data, Net, Auth, AI, UI, Release
- **Apps**: [apps/index.md](apps/index.md) — nan0web platform, @industrialbank ecosystem, legacy
- **Workflows**: [.agent/workflows/](workflows/) — [ui-update.md](workflows/ui-update.md), etc.

## 🛡️ SAFETY PROTOCOLS

**Інтенсивність у бажанні завершити завдання:** Ми працюємо зважено. Кожен крок має бути точним. Помилка у поспіху коштує дорожче, ніж пауза на роздуми.

1. **NO AUTO-COMMITS**:
   - NEVER execute `git commit` or `git push` automatically.
   - ALWAYS show the command text (`git commit -m "..."`) and wait for user confirmation.
   - Use `git status` before proposed changes.

2. **NO AUTO-PUBLISH**:
   - NEVER execute `npm publish` automatically.
   - ALWAYS provide the command for manual execution by the user.
   - Wait for user confirmation after they execute it.

3. **DESTRUCTIVE ACTIONS**:
   - Ask explicitly before `rm -rf`, overwriting crucial configs, or changing system files.

4. **SAFE EDITING & PATHS**:
   - **Minimal Change**: Target the smallest possible chunk (1-5 lines) to avoid errors.
   - **No Lazy Comments**: NEVER replace code with `// ...` in `ReplacementContent`. You MUST provide the full valid block.
   - **Path Verification**: Before injecting relative paths (e.g. `../../../`), ALWAYS verify with `ls` or `find`. Do not guess depth. Use `list_dir` on the target directory to be 100% sure.
   - **Import Strategy**: ALWAYS prefer package imports (`@nan0web/pkg`).
   - **Workaround Protocol**: If an external package is broken:
     1. Create Request file.
     2. **Log the Hack**: Add a `## Temporary Workarounds` section in the Request file.
     3. **STOP AND ASK**: "Request created. Apply workaround or wait?"
     4. **Cleanup**: The agent closing the request MUST revert the workaround.

5. **EXTERNALS PROTOCOL (Request System)**:
   - **Prohibited**: Do NOT directly modify code in external packages (`packages/*`) or other apps (`apps/*`).
   - **Procedure (Bi-Directional)**:
     1. **Initiator**: Create `REQUEST_TO_<TARGET>.md` in your current app (for tracking).
     2. **Receiver**: Create/Append to `REQUESTS.md` in the target package/app (for visibility).
     3. **Content**: Describe Problem, Proposed Change, and Impact.
   - **Receiver Workflow**: When working on any package/app, ALWAYS check `REQUESTS.md` first and address pending items.

## 💎 CODE STYLE (Lux-Level Aesthetics)

1. **NO SEMICOLONS**:
   - JavaScript/TypeScript must be semicolon-free.
   - Use Prettier config implicitly: `semi: false`, `singleQuote: true`.

2. **INDENTATION**:
   - Use **TABS** for code indentation (visual flexibility).
   - Use **SPACES** for alignment in non-code files (Markdown tables, YAML).

## 📖 ProvenDoc 2.0 (Executable Documentation)

> Full standard: [src/llm/templates/provendocs.md](src/llm/templates/provendocs.md)

1. **DSV (Deep Strict Verification)**:
   - Documentation examples are executable tests, not just text.
   - Every `README.md.js` example MUST use `assert.deepStrictEqual(console.output(), [...])` to verify the full sequence and type of outputs.
   - Use `console.info` in examples to document intended output (e.g., `// -> Output`).

2. **Atomic JSDoc Structure**:
   - Every `it()` block must be preceded by a `/** @docs */` JSDoc comment.
   - Every test block MUST end with an `assert` call (Stop Condition for `DocsParser`).

## 🧪 TDD & TESTING

1. **RED-GREEN-REFACTOR**:
   - Before fixing a bug, create a reproduction test case.
   - Verify the test FAILS.
   - Make the fix.
   - Verify the test PASSES.

2. **VERIFICATION**:
   - Always run verification commands (`node script.js` && `npm run test:all`) before reporting "Done".
   - Don't assume code works; PROVE IT with terminal output.
   - `test:all` MUST include: unit tests (node:test for .js, vitest for .jsx), knip --production, **pnpm audit**, e2e tests, src/README.md.{js|jsx} generation, snapshot tests.
   - Scripts in `package.json` should include `"audit": "pnpm audit --audit-level=moderate"` and it should be called from `test:all`.

3. **BUILD PARITY (DoD)**:
   - **Mandatory**: Run `pnpm build` + `pnpm preview` to verify Dev vs Prod environment parity before closing any task.

## 🌍 LOCALIZATION & DATA INTEGRITY

1. **NanoWebDB: SOURCE OF TRUTH INTERFACE**:
   - **NO DIRECT FETCH**: Manual `fetch()` for data files is strictly prohibited.
   - **MANDATORY**: All data (YAML, nano, md, json, csv) must be accessed via `NanoWebDB` with the appropriate adapter:
     - **Web**: `@nan0web/db-browser` (`BrowserDB`).
     - **Backend/CLI**: `@nan0web/db-fs`, `@nan0web/db-node-js`, etc.
   - Manual edits to generated JS/TS files (i18n, data sync) are **strictly prohibited**.
   - After any YAML change, always run `npm run i18n:sync` and `npm run i18n:generate`.
   - **Integrity Check**: If `i18n:generate` reports success but the JS file is unchanged, check `mtime` and file content via `cat` before resorting to manual fixes. Direct manual edits to `i18n/*.js` are only allowed as a LAST RESORT and must be logged as a workaround.

2. **LOCALE-FIRST ROUTING**:
   - **Production**: `/<locale>/<slug>` — app is determined by page metadata, not URL path.
   - **Standalone dev**: `/<locale>/<app-name>/<slug>` — acceptable during development only.
   - Default locale is `/en/`. Every product or key section must have a unique URL.

3. **CROSS-LOCALE PARITY**:
   - Localized YAMLs must be structurally identical to the primary locale (UK).
   - If an image path or data field is updated in one locale, it MUST be verified in all others.

4. **CHAT**:
   - Answer in the same language the user communicates in.

## 🛡️ CONSERVATIVE UI ITERATION

1. **NO COLLATERAL DAMAGE**:
   - Never break or remove working UI elements (ProgressBars, Step indicators, Selectors) that were previously approved.
   - If fixing a title — change only the title. Do not rewrite the surrounding container.

2. **INCREMENTAL CHANGES ONLY**:
   - If a UI fix is needed, target the specific element.
   - Never rewrite entire components unless explicitly asked to do so.

3. **🛡️ VISUAL VERIFICATION (MANDATORY)**:
   - **No Blind Edits**: reporting "Finished" or "Done" for any UI change WITHOUT visual proof is a CRITICAL VIOLATION.
   - **Mandatory Workflow**: MUST follow the [ui-update.md](workflows/ui-update.md) checklist for any visual or i18n changes.
   - **Proof Required**: You MUST use `read_browser_page` or `browser_subagent` to capture a screenshot or confirm visual correctness before concluding a task.
   - **Diagnostic Protocol**: If UI displays raw keys (e.g. `type.branch`) instead of text:
     1. **Trace Flow**: Trace the `t` function prop from root/container (e.g. `App.jsx` or `Playground.jsx`) to the target component.
     2. **Verify Provider**: Ensure the correct dictionary is passed to `createT` or `i18nProvider`.
     3. **Inspect Output**: Check `uk.js/en.js` content directly. Do not assume `i18n:generate` worked.

## 🚀 AGRP (Anti-Gravity Release Protocol)

> **ALL TASKS = RELEASES.** Every implementation task MUST go through `@nan0web/release` workflow.
> Use `/release` slash command or follow the protocol manually.

1. **RELEASE-FIRST DEVELOPMENT**:
   - Every task starts with creating a release in `releases/X/vX.Y.Z/`.
   - Create `task.md` (mission) and `task.spec.js` (contract) BEFORE writing any implementation code.
   - Run `npm run release:spec` to confirm all tests are RED before starting.

2. **CONTRACT IMMUTABILITY**:
   - NEVER modify `releases/**/*.test.js` files (closed contracts).
   - NEVER modify `releases/**/*.spec.js` files to make tests pass. Only modify `src/` code.
   - If a contract test is logically wrong, STOP and ask the user to fix it.
   - If solving a task is IMPOSSIBLE without changing the spec — report this as an ERROR, mark the test as `.skip` with a comment explaining why, and leave it for Architect review.

3. **SPEC vs TEST**:
   - `.spec.js` = WIP (Work In Progress). Agent creates and runs these during development.
   - `.test.js` = Baseline (Closed). Only created via `npm run release:close` after Architect approval.
   - NEVER manually rename `.spec.js` → `.test.js`. Always use `release:close`.

4. **STATUS DISCIPLINE**:
   - NEVER declare a release "Stable" or "Production Ready". Only Architect (human) can do this.
   - Agent may report: "Tests Green", "All Passing", "Ready for Review".
   - Use `PENDING ARCHITECT REVIEW` as the maximum status an agent can assign.

5. **REGRESSION GUARD**:
   - Before reporting completion, run `npm run release:verify` to ensure closed contracts still pass.
   - If fixing app X breaks app Y — this is a FAIL. Roll back and rethink.

6. **RELEASE STRUCTURE**:
   - Each release lives in `releases/X/vX.Y.Z/`
   - Required files: `task.md` (mission), `task.spec.js` (contract)
   - Use `npm run release:close -- vX.Y.Z` to finalize

## 🏗️ DEVELOPMENT LIFECYCLE: CLI-FIRST

To ensure rock-solid logic and portability, follow this sequence:

1.  **Domain & Models**: Define the pure business logic and models in **`src/domain`**. Cover them with unit tests in **`src/domain/**/\*.test.js`\*\*.
2.  **UI-CLI**: Verify the domain logic via CLI (`src/ui-cli/index.js`).
3.  **Web/Chat UI**: Implement the visual layer (`src/ui-react-*`).

## 📐 MODEL-AS-SCHEMA (Self-Describing Domain Models)

> **QUASI-MANDATORY** for all `@nan0web` packages and apps with domain models.

Domain models MUST carry **self-describing metadata** via static field descriptors.
Each field declares its own `help`, `default`, and (optionally) `options` — making the model
a single source of truth for runtime logic, CLI rendering, AI-chat contracts, and auto-generated UI.

### Pattern

```js
export class BranchModel {
  static city = {
    help: 'City',
    default: '',
  }
  /** @type {string} */
  city = BranchModel.city.default

  static type = {
    help: 'Type',
    options: ['Відділення', 'Банкомат'],
    /** @type {"Відділення" | "Банкомат"} */
    default: 'Відділення',
  }
  /** @type {"Відділення" | "Банкомат"} */
  type = BranchModel.type.default

  /** @param {Partial<BranchModel>} data */
  constructor(data) {
    Object.assign(this, data)
  }
}
```

### Rules

1. **Every field** has a paired `static` descriptor: `{ help, default [, options] }`.
2. **`help`** — human-readable description (used by CLI `--help`, AI-chat schema, Playground).
3. **`default`** — single source of truth for initial values.
4. **`options`** (optional) — enum of allowed values; drives UI selectors and validation.
5. **`api.schema`** object SHOULD accompany the model to expose a **declarative API contract**:

   ```js
   export const api = {
     schema: {
       filter: {
         type: 'read',
         description: 'Фільтрувати за критеріями',
         params: {
           city: { type: 'string', description: 'Назва міста' },
         },
       },
     },
     execute: async (name, params, data) => {
       /* ... */
     },
   }
   ```

6. **Reference implementation**: `@industrialbank/branches/src/domain/BranchModel.js`.

## 🧱 META-DESCRIPTION INTERFACE

Components must be described using high-level semantic names instead of file paths:

- **Format**: `App.ModuleName.ComponentName`
- **Props**: Use natural naming (e.g., `$branch`, `$view`).
- **Example**:

  ```yaml
  - App.Branches.Card
    $branch: $data.current

  - App.Branches.Map
    $view: "map"
  ```

- Playground MUST show both JSX and Meta-Description snippets.
