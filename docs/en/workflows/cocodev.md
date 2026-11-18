---
description: CoCoDev — Continuous Collaborative Development (Fractal Cycle K <= 7)
---

# CoCoDev — Continuous Collaborative Development (Fractal Cycle $K \le 7$)

> **Paradigm:** Any task (software, architecture, game, design) is modeled as a transformation $T: (\mathcal{I}, \mathcal{P}, \mathcal{E}) \xrightarrow{\mathcal{R}} \mathcal{O}$ (Intent $\mathcal{I}$, Patterns/Protocols $\mathcal{P}$, Environment $\mathcal{E}$ via Resources $\mathcal{R}$ → Output artifact $\mathcal{O}$) and unfolds into a fractal cycle of at most **7 steps** per level.

---

## Level 1: Universal 7-Step Cycle

1. **Intent ($\mathcal{I}$):** Human or agent defines the goal and $\le 7$ acceptance criteria (`task.md`, `plan.md`, GDD, spec).
2. **Knowledge ($\mathcal{K}$ via MCP + `targetFiles`):** Before any `grep` or `read_file`, the agent **must** query active MCP servers (`search_knowledge_base`, `get_resource`, `inspect_api_contract`). At the end of this step, the agent **must lock the `targetFiles` whitelist** (`[NEW]` / `[MODIFY]`) before editing code.
   - *Fallback (when local vector embedder is unavailable):* `nan0inspect api <path>` → `README.md` → `types/**/*.d.ts`.
3. **Model ($\mathcal{M}$):** Design a pure model (`Model-as-Schema` for data/config, `ModelAsApp` for executable commands) decoupled from OS/UI — using only virtual mounts via `this.$db`.
4. **Contract ($\mathcal{C}$ / TDD):** Create scenario/contract tests (`*.story.js`, `task.spec.js`) on In-Memory `@nan0web/db` before writing implementation.
5. **Build ($\mathcal{B}$):** Minimal clean code or content to pass the contract.
6. **Inspect ($\mathcal{V}$):** Automated verification: `test:all`, `release:spec`, `nan0inspect`, `tsc`, plus scope isolation `git diff --name-only` against the declared `targetFiles`.
7. **Sync ($\mathcal{S}$):** Release cycle (`@nan0web/release`: `validate` / `seal` / `close` for `releases/X/Y/vX.Y.Z/`), update knowledge index (`pnpm run ai:index`), record Architect decisions in `user.md` / `task.md`, and log remaining gaps in `releases/backlog.md`.

---

## Level 2: Configurable Standard for `nan0web` (`nan0web.nan0`)

Each step has a two-layer configuration (**global default** `~/.nan0web/nan0web.nan0` + **local repo/project** `nan0web.nan0` and `inspect.config.nan0`), typed via `NaN0WebConfig`:

- **1. Intent (`IntentStep`):** `task.md` + `user.md` (feedback) in `releases/X/Y/vX.Y.Z/`, limit `maxCriteria <= 7`.
- **2. Knowledge (`KnowledgeStep`):** Priority for active MCP (`nan0web-knowledge`, `nan0web-inspect`), fallback to `README.md` / `*.d.ts`, mandatory `targetFiles` declaration.
- **3. Model (`ModelStep`):** Pure `ModelAsApp` / `Model`, dependencies via `this.$db` / `this.$UI`, constructor JSDoc `Partial<import('@nan0web/types').ModelOptions>`.
- **4. Contract (`ContractStep`):** `*.story.js` and `task.spec.js` on In-Memory `@nan0web/db` with virtual mounts (`@app`, `@gemini`, `@cursor`, `~`, etc.).
- **5. Build (`BuildStep`):** Implementation without `fs`/`path`/`os`/`process` in domain; run scripts exclusively via `pnpm run ...`; no explicit extensions in `saveDocument`/`loadDocument`.
- **6. Inspect (`InspectStep`):** `pnpm run release:spec`, `pnpm run test:all`, `pnpm run inspect` (exceptions declaratively via `inspect.config.nan0`), `git diff` scoped to `targetFiles`.
- **7. Sync (`SyncStep`):** Release per `release.md`, update `nan0web-knowledge` index (`pnpm run ai:index`) and `releases/backlog.md`.
