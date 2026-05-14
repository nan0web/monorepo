# Task: Hardening Phase Detection & UI Reporting

## 1. Phase Detection (Numeric Stages)
Standardize project phases into 4 stages:
- **Phase 1 (Seed)**: `seed.md` exists. Initial intent and requirements.
- **Phase 2 (Design/Model)**: `project.md` exists. Architecture and schema defined.
- **Phase 3 (Stable)**: Tests, ProvenDoc, and Playground exist. Code is verified.
- **Phase 4 (Production)**: `releases/` history exists. Project is mature.

## 2. UI Reporting Refinement
- **i18n Standards**: Change `log('info', ...)` to `show(..., 'success')`. Remove emoji checkmarks (let UI handle it).
- **ContentViewer**: Ensure it's rendered as the final summary in the CLI.

## 3. Verification
- Write `task.test.js` for `PhaseAuditor` covering all 4 stages.
- Verify `next.md` deduplication.

## Timeline
- [ ] PhaseAuditor numeric stages
- [ ] i18n status reporting
- [ ] ContentViewer rendering fix
- [ ] Comprehensive tests
