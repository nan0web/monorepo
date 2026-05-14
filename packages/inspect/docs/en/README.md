# @nan0web/inspect
<!-- %PACKAGE_STATUS% -->

## Description
`@nan0web/inspect` is an autonomous architectural auditing engine designed to enforce Zero-Hallucination (0HCnAI) standards across monorepos.
It performs multi-layered verification of project structure, hygiene, domain isolation, and export integrity.

## Installation

How to install with npm?
```bash
npm install @nan0web/inspect
```

## Usage

### Architecture Audit
The `ArchitectureAuditor` orchestrates all specialized auditors to provide a comprehensive health report.

How to run a full architecture audit?
```js
import { ArchitectureAuditor } from '@nan0web/inspect'
import { DB } from '@nan0web/db'
const auditor = new ArchitectureAuditor()
const gen = auditor.run()
let res = await gen.next()
while (!res.done) {
	res = await gen.next()
}
const score = res.value.data.score
console.info(`Project Health Score: ${score}%`) // Project Health Score: 100%
```
### Phase Detection
`PhaseAuditor` identifies the current stage of the project lifecycle (Incubation, Transformation, Stable) based on the presence of `seed.md` and `project.md`.

How to detect project lifecycle phase?
```js
import { PhaseAuditor } from '@nan0web/inspect'
const auditor = new PhaseAuditor()
const gen = auditor.run()
let res = await gen.next()
while (!res.done) res = await gen.next()
console.info(`Phase: ${res.value.data.phase}`) // Phase: stable
```
### Circular Dependencies
`CircularDependencyAuditor` uses `madge` to detect circular dependency chains.

How to check for circular dependencies?
```js
import { CircularDependencyAuditor } from '@nan0web/inspect'
const auditor = new CircularDependencyAuditor()
const gen = auditor.run()
let res = await gen.next()
while (!res.done) res = await gen.next()
console.info(res.value.data.success) // true
```
## CLI Usage

The inspector is available via the `nan0inspect` command (or `npx @nan0web/inspect`).

### Full Audit
Runs all available auditors and generates a healing report.
```bash
npx @nan0web/inspect .
```

### Specific Auditor
You can run individual auditors by their alias:
```bash
npx @nan0web/inspect hygiene .
npx @nan0web/inspect exports .
```

### Auto-Fixing
Some auditors support automatic fixes (e.g., missing package.json scripts).
```bash
npx @nan0web/inspect hygiene . --fix
```

## Healing Report
When `audit` finds violations, it generates a `next.md` file in the project root.
This file contains a structured list of tasks for AI agents (**Antigravity**, **Copilot**, **LLiMo**) to fix the detected architectural issues.

How to use the CLI?
```js
// The CLI is bootstrapped from InspectorApp
```
## Auditors List
- **PhaseAuditor**: Verifies `seed.md`, `project.md` and release history.
- **HygieneAuditor**: Checks `package.json` scripts, `node_modules` hygiene, and mandatory configs.
- **ExportAuditor**: Validates ESM exports and `index.js` gateway integrity.
- **DomainAuditor**: Enforces Model-as-Schema strictness and domain/UI isolation.
- **VerificationAuditor**: Ensures existence of tests, playgrounds, and ProvenDocs.
- **CircularDependencyAuditor**: Detects circular imports.

## License
ISC

How to license?
