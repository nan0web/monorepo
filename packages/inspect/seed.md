# 🏗️ NaN0Web Inspector Roadmap

## 🔄 CIDMD: Fix CLI Summary Serialization (The [object Object] Bug)

**Problem**: Running `nan0inspect circular` outputs `· [object Object]` as the final summary.
**Context**: This happens when the command is run with default arguments. Explicit paths like `circular src` work correctly.

**Tasks**:
1. [ ] Create a regression test in `src/test/cli.test.js` that captures the `[object Object]` output.
2. [ ] Investigate `InspectorApp.js` return value handling in `bootstrapApp`.
3. [ ] Ensure `ResultIntent` is properly stringified in the terminal adapter.

**Success Criteria**:
- `nan0inspect circular` outputs `✓ No circular dependencies found` as the final line.
- Full snapshot test suite passes.

## 🚀 Ongoing Stabilization
- [x] In-process Madge integration (Circular Auditor).
- [x] Hard timeouts (7s) for individual auditors.
- [x] Dynamic discovery of external auditors.
