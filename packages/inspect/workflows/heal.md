# 🏗️ NaN0Web Inspector: Sovereign Healing Workflow

This workflow implements the **"Auditor Boundary & Context"** approach. Instead of broad fixes, we apply targeted remediations with explicitly defined file contexts and expectations.

## 1. Discovery Phase

Run the full architecture audit to generate the `next.md` report.
// turbo

```bash
node bin/inspect.js all
```

## 2. Targeted Remediation

For each failed check in `next.md`, identify the **Boundary** (affected files) and **Context** (files needed for the fix).

### 🛠️ Remediation Patterns:

#### A. Hygiene Healing

- **Boundary**: `package.json`, `tsconfig.json`, `knip.json`
- **Context**: Project `seed.md`, `project.md`
- **Goal**: Ensure mandatory scripts and configs are present and correctly configured.

#### B. Export & Domain Healing

- **Boundary**: `src/index.js`, `src/domain/index.js`
- **Context**: All files in `src/domain/`
- **Goal**: Standardize named exports and ensure Model-as-Schema canonical structure.

#### C. Verification Coverage

- **Boundary**: `play/`, `src/**/*.test.js`, `README.md.js`
- **Context**: Domain models and contract specifications.

* **Goal**: Achieve 100% ProvenDoc coverage and functional playground.

## 3. Sequential Verification

After each remediation step, re-run the inspector to verify the **Boundary** is now clean.

// turbo

```bash
node bin/inspect.js all
```

## 4. Final Review

Verify that the `score` has improved and `next.md` contains no more critical violations.
 
