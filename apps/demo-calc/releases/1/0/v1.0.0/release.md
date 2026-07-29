# Project Overview

**Name:** Nan0Web Calculator  
**Version:** 1.0.0  
**Description:** A minimal calculator application built following the Nan0Web “Seed → Model → Contract → Adapter” development flow. The seed stage establishes the multilingual foundation, packaging, and release documentation. Subsequent phases will incrementally add business logic, testing, and user‑interface components.

## SEED Phase Goals (Phase 1)

1. **Language Configuration** – Provide a language catalog (`data/_/langs.nan0`) enumerating supported locales (English and Ukrainian).  
2. **Release Specification** – Create a complete release markdown (`releases/1/0/v1.0.0/release.md`) describing the project, current seed objectives, and a roadmap for later phases.  
3. **Package Manifest** – Supply a `package.json` with required metadata, dependencies, and npm scripts to enable testing in later phases.  

All three artifacts are now present and validated, establishing a solid foundation for the next development steps.

## Future Roadmap

| Phase | Focus | Deliverables |
|------|-------|--------------|
| **2 – Model** | Domain model implementation | `src/domain/CalculatorModel.js` extending `ModelAsApp`, field definitions, no UI logic. |
| **3 – Contract** | Unit testing of the model | Test suite under `src/domain/` or `releases/1/0/v1.0.0/domain.spec.js`. |
| **4 – Adapter** | UI/CLI adapters | UI components in `src/ui/` that instantiate the model and render results, adhering to late‑bound i18n (`t()`). |

Each phase will respect the Nan0Web architectural constraints: pure‑JS model classes, late‑bound i18n, and strict separation of concerns.