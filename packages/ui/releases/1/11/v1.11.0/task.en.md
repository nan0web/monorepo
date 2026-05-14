---
version: 1.11.0
type: architecture
status: done
locale: en
models: []
---

# Release Task v1.11.0 — Architecture Consolidation

[English](./task.en.md) | [Українська](./task.md)

## Scope

This release focuses on stabilizing the architectural contracts of `@nan0web/ui`, improving `Intent.js`, and integrating the testing patch (OLMUI v2.0 Hardening Patch).

### 1. OLMUI v2.0 Hardening Patch (Testing)
Completed the extraction of logic for `.jsonl` snapshot saving and Fail-Fast testing. `verifySnapshot` is publicly exported and correctly saves arrays of logic intents to `snapshots/jsonl/`.

### 2. Intent API Stabilization
Transitioned from arrow constants to named functions for Intent generators (`ask`, `progress`, `result`, `show`, `agent`) resolving `TS2694`. `show()` replaces the deprecated `log()`. Introduced `AgentIntent`. Adapter timeouts respect Node.js timeout limits (3333ms) to prevent blocking the Event Loop.

### 3. ShellModel and Snapshot Auditor
`ShellModel` was migrated to static `UI` dictionaries, eliminating string hardcoding and manual parameter switching. Internal inspectors transformed into `SnapshotRunner.js` and `SnapshotAuditor.js` to detect structural hallucinations (NaN, undefined).

### 4. V8 Optimization & Typization
Eliminated the **"Class field outside constructor"** anti-pattern from domain classes. `EmptyStateModel`, `BannerModel`, and `ProfileDropdownModel` are now properly exposed via the `Model` object.

## Definition of Done (Acceptance Criteria)

- [x] Intent Stability: Functions are proper named exports.
- [x] `verifySnapshot` saves snapshot histories properly.
- [x] AdapterTimeouts tests respect Node limits.
- [x] Snapshot Auditor effectively calculates `SnapshotScore`.
- [x] No `class field outside constructor` declarations.
- [x] All backwards-compatible regression tests pass.

## Architecture Audit (Checklist)

- [x] Ecosystem indices read? (Explored `@nan0web/ui`).
- [x] Reusing existing patterns? (Expanding the Intent mechanism).
- [x] Data sources: Core JS files and test intents.
- [x] Fits UI-standards? Yes.
