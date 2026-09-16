---
description: PM-as-Code Release Protocol (AGRP) — contract-driven workflow with metrics, regression, and scope control
---

# 🚀 Anti-Gravity Release Protocol (AGRP & PM-as-Code)

// turbo-all

This workflow transforms specifications and backlog requirements into a verified release with executable contract tests.
All commands are safe for autonomous execution (git commit/push remain locked according to repository security rules).

---

## 🏛 Release Architecture: Project Management as Code

Each project or package follows a standardized release layout:

```
releases/
├── backlog.md                  # Master backlog of ideas and tasks (template: docs/uk/templates/backlog.md)
└── {major}/{minor}/vX.Y.Z/
    ├── release.md              # Release manifest and task matrix (template: docs/uk/templates/release.md)
    ├── user.md                 # Execution metrics, time logs, and append-only feedback (template: docs/uk/templates/user.md)
    ├── retro.md                # Final retrospective notes upon seal
    └── *.spec.js               # Contract test suites (TDD)
```

---

## 📋 Step-by-Step Release Lifecycle

### 1. Research and Initialization
1. Inspect existing releases:
   ```bash
   pnpm run release:status 2>/dev/null || find releases/ -name "*.spec.js" -o -name "*.test.js" 2>/dev/null
   ```
2. Determine the target version (SemVer) and initialize:
   ```bash
   pnpm exec release init vX.Y.Z
   ```
3. Prepare release files:
   - `releases/{major}/{minor}/vX.Y.Z/release.md`
   - `releases/{major}/{minor}/vX.Y.Z/user.md`
   - `releases/{major}/{minor}/vX.Y.Z/task.spec.js`

### 2. Contract Definition (Contract-First / TDD Red)
1. Each task in `release.md` maps to one or more `it()` tests in `task.spec.js`.
2. Backlog items are registered as `it.todo()`.
3. Active tests **must fail (Red)** before writing implementation code.
4. Verify failing contracts:
   ```bash
   pnpm run release:spec
   ```

### 3. Implementation and Zero-Trust Git Diff Control
1. Modify **only the files** declared in the `Target Files` section of the corresponding task in `release.md`.
2. Procedural `fs` is prohibited — use `@nan0web/db` exclusively.
3. Validate diffs via `git status` and `git diff` ([git-reviewer](/docs/uk/workflows/git-reviewer.md)).
4. Run tests until 100% **Green**.

### 4. Metrics Tracking and Feedback Loop
1. Architect feedback is recorded in `user.md` (Append-Only).
2. Each reported issue triggers at least one new contract test.
3. Update development time, iteration counts, and QA attempts in `user.md`.

### 5. Validation and RRS Gate
1. Validate release readiness:
   ```bash
   pnpm run release:validate
   ```
2. Run package-wide verification:
   ```bash
   pnpm run test:all
   ```
3. Release passes when **RRS (Release Readiness Score) ≥ 324** and all tests pass.

### 6. Sealing and Auto-Regression (Seal & Close)
1. Architect approves the release.
2. Seal the release:
   ```bash
   pnpm exec release seal --message="Release sealed successfully"
   ```
3. Migrate contracts into permanent regression tests:
   ```bash
   pnpm run release:close -- vX.Y.Z
   ```
   *(Files `*.spec.js` automatically move to `src/test/releases/{major}/{minor}/vX.Y.Z/*.test.js`)*.
