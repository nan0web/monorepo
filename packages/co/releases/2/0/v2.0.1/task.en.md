*[🇺🇦 Українська](task.md) | 🇬🇧 English*

# CO-4 Release (v2.0.1)

## Patch Summary

This patch release integrates code hygiene improvements (Prettier styling, normalized quotes), strict workspace dependency linking (`workspace:*`), and resolves a major architectural violation. `StackDetector` was incorrectly placed in `@nan0web/protocol` leading to circular dependency graphs via `@nan0web/ui`. It has been purged from `protocol` and returned to the `@nan0web/inspect` module, ensuring the ESM module tree remains pristine and decoupled.

### Changes
*   **Hygiene:** Enforced standard single quotes and module alignment across `co`.
*   **Dependency Resolution:** Enforced `workspace:*` exact linking to eliminate duplicate instances of core `@nan0web` dependencies.
*   **Architectural Correction:** Avoided exporting `StackDetector` through `co/protocol` infrastructure. Release tests have been migrated to regular regression suites.
