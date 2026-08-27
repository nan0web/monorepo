---
description: Release task standard (task.md), contract tests (task.spec.js), and pipeline execution (pipeline.md)
---

# 🚀 Workflow: Release Contract & Pipeline Protocol

This document is the Single Source of Truth for structuring and executing releases within the `NaN•Web` ecosystem.

Every release is isolated in its own three-tier versioning directory:
`releases/{major}/{minor}/v{major}.{minor}.{patch}/`

It strictly consists of three essential artifacts:

1. **`task.md`** — Mission, architecture, and task declaration (Data-Driven Contract).
2. **`task.spec.js`** — Specification contract tests (Contract-First).
3. **`pipeline.md`** — Concise pipeline for autonomous execution and full verification.

---

## 1. Specification `task.md` (Mission & Spec)

The `task.md` file contains a strict YAML Frontmatter for automated parsing by `nan0ai task`, `@nan0web/inspect`, and LLM agents.

- **Reference Template:** [templates/task.md](./templates/task.md)

---

## 2. Specification `task.spec.js` (Contract Tests)

The contract test defines release requirements using native `node:test`.

### Rules for `task.spec.js`:

- Direct imports: imports functions/models directly from project source code (`src/`).
- Tests specific scenarios from `task.md` (not a meta-test).
- Fast execution (mock/in-memory, no heavy external latency).
- **Reference Template:** [templates/task.spec.js](./templates/task.spec.js)

---

## 3. Specification `pipeline.md` (Execution Pipeline)

`pipeline.md` is a sequential execution pipeline read and executed by the `nan0ai pipeline` engine.
Each step is defined by an `##` heading, and the executed bash command by a ` ```bash ` block.

### Key Principles:

- **Relative Paths**: commands run with the release directory as working context.
- **Execution Sync**: fast syntax check -> contract tests -> agent task execution -> full verification suite.
- **Polyglot & Agnostic**: works seamlessly with Node.js/JavaScript, Python/Pytest, Rust/Cargo, or CLI tools.
- **Reference Templates:**
  - **Node.js / JS:** [templates/pipeline.md](./templates/pipeline.md) | Contract: [templates/task.spec.js](./templates/task.spec.js)
  - **Python / Mistral-Vibe:** [templates/pipeline.python.md](./templates/pipeline.python.md) | Contract: [templates/test_task.py](./templates/test_task.py)

---

## 4. Running the Pipeline

Run the full lifecycle from repository or project root:

```bash
nan0ai pipeline releases/{major}/{minor}/v{X.Y.Z}/pipeline.md
```

Or autonomously via Vibe / Mistral / Antigravity:

```bash
vibe -p "Run and complete pipeline releases/{major}/{minor}/v{X.Y.Z}/pipeline.md" --trust --auto-approve
```

