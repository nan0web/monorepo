# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-05-08

### Added
- **Polymorphic Architecture**: Implemented 5-level interface hierarchy (CLI, Agent, Voice, Mobile, Web).
- **Model-as-Schema**: Core validation logic integrated into `Document` and `EditorModel`.
- **Directory-level Inheritance**: Support for `_.nan0` cascade configuration.
- **Unified Document Model**: Single polymorphic `Document` class for all content types.
- **Self-Hosting Demo**: Presentation site driven by the editor's own domain logic.
- **DSN Abstraction**: Data Source Name support for platform-agnostic storage (fs, s3, sync).
- **Extension-less References**: Support for dynamic `$ref` resolution (nan0, md, yaml).

### Initialized
- Comprehensive architectural documentation in `docs/uk/architecture/`.
- Project specification in `project.md`.
- Basic CLI and Lit-based UI adapters.
