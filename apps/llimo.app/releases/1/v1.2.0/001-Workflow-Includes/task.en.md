# Release v1.2.0 - Workflow Orchestration & Commands

**English** | [Українською](./task.md)

## Release Scope

- **@workflow Command**: Created a full-fledged `WorkflowCommand` that allows the model to dynamically request files from the templates directory (configured in `.llimorc` -> `@workflow`), generating a checklist formatted as `- [](@workflow/filename.md)`.
- **Architectural Cleanup**: Removed the workaround implementations `handleIncludes` and `extractIncludes`. The system no longer searches for `!include` directives in the model text; it exclusively relies on a single command parsing standard (OLMUI).
- **Security Validation for Workflow**: Added the proxy `@llimo` to the allowed list in `SecurityGateModel.js`. Previously, steps such as `- @llimo index` in `WorkflowModel` were blocked at the security level, throwing the error *Security Violation: Proxy tool not allowed: @llimo*.

## Acceptance Criteria
- [x] Are the ecosystem indexes read?
- [x] Are there similar implementations in other packages?
- [x] Do all existing tests pass successfully? (Regression Tests: `pass 295`)
- [x] Does the contract `task.spec.js` verify the workflow template injection and the `@workflow` command functionality?
