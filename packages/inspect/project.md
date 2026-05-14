# @nan0web/inspect

Zero-Hallucination Architecture Auditor and Sovereign Healing pipeline for the NaN•Web ecosystem.

## Vision

The Inspector is not just a linter; it is the **Sovereign Guardian** of the NaN•Web architectural standards. Its primary goal is to ensure that every package and application follows the **Model-as-Schema** and **Data-Driven UI** principles without deviation. It enforces these standards through autonomous "healing" (auto-fixing) and detailed reporting.

## Core Principles

### 1. Zero-Hallucination Enforcement
- Every architectural violation is treated as a "hallucination" of the developer or the AI assistant.
- The Inspector provides **Canonical Truth** through its audit results.
- If a standard is missing (e.g., `package.json` scripts, `tsconfig.json`), the Inspector creates it using predefined templates.

### 2. Sovereign Healing (Auto-Fixing)
- Use the `--fix` flag to allow the Inspector to mutate the physical state of the project.
- Healing includes:
  - Injecting missing `package.json` scripts (`test:all`, `play`, `knip`, etc.).
  - Adding required `devDependencies` (`knip`, `c8`, `typescript`).
  - Creating mandatory configuration files (`knip.json`, `tsconfig.json`).
  - Normalizing file structures (ensuring `src/` existence).

### 3. Resilient Orchestration
- **Sequential Execution**: To maintain CLI stability and clean output, auditors run one by one.
- **Safety Timeouts**: Heavy operations (like `madge` for circular dependencies) are capped (e.g., 7 seconds) to prevent blocking the developer workflow.
- **Deep Scanning**: Replaces manual recursion with `db.browse()` to ensure virtual mounts (like `@app/`) are correctly traversed.

## Architectural Patterns

### Auditor Initialization (`init`)
Every auditor must call `await this.init()` at the start of its `run()` method. This ensures:
- **Platform Detection**: Identifies if the project is JavaScript/Node.js or Python.
- **Metadata Loading**: Loads `package.json` or `pyproject.toml` into the auditor's context.
- **I18n Readiness**: Hydrates localization dictionaries for consistent user feedback.

### Path Resolution
- Auditors must resolve paths relative to the target directory provided by the orchestrator.
- Use `this._.db.resolveSync(this.dir, 'path')` for filesystem operations.
- Circular dependency checks must focus on the `src/` directory to avoid scanning `node_modules`.

## Auditor Catalog

| Auditor | Purpose | Healing Capability |
|---------|---------|-------------------|
| `PhaseAuditor` | Validates project lifecycle phase (`seed.md`, `project.md`). | Flags missing phase documents. |
| `HygieneAuditor` | Checks scripts, configs, and devDependencies. | Injects scripts, creates configs, adds packages. |
| `ExportAuditor` | Ensures correct UI adapter and domain exports. | Detects missing entry points. |
| `DomainAuditor` | Validates Model-as-Schema and Domain/UI separation. | Reports architectural leaks. |
| `VerificationAuditor` | Checks for unit tests, stories, and ProvenDocs. | Flags missing verification files. |
| `CircularDependencyAuditor` | Detects circular chains in `src/`. | Reports cycles (human-fix required). |
| `SnapshotAuditor` | Audits UI snapshots and logic consistency. | Validates visual/data state. |

## Documentation (ProvenDoc)
Every package must have a `src/README.md.js` file (ProvenDoc) which is audited by the `VerificationAuditor`. This ensures that documentation is treated as code and remains synchronized with the implementation.
