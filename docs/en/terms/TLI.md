# TLI (Total Logic Isolation)

- **Definition**: Complete decoupling of application and domain logic from environmental side-effects (such as direct `node:fs` calls, raw `console.log` statements, or system `process.stdout` writes).
- **Isolation Rule**: Models must be pure and communicate with the outside world _only_ by yielding OLMUI Intents (`yield show()`, `yield log()`, etc.). Raw prints or writes are strictly forbidden and audited.
- **Detailed Workflows**: See [intentions.md](../../../packages/ui/docs/en/intentions.md)
- **Audit Implementation**: [IntentAuditor.js](../../../packages/ui/src/domain/app/IntentAuditor.js)