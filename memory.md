# 💾 MEMORY & HANDOVER

**Date**: 2026-02-11
**Context**: Industrial Bank Micro-Apps Migration & Activation.

## 🚦 Current Status

### 1. `@industrialbank` Micro-Apps

- **Active**: `cards`, `credits`, `branches`.
- **Scaffold**: `deposits`, `currencies`, `metals`.
- **Standard**: React 19, Bootstrap 5, @industrialbank/ui (shared).
- **Infrastructure**: Releases moved to `releases/X/vX.Y.Z/`.

## 🤖 AI GOVERNANCE & DISCIPLINE (CRITICAL)

1.  **Index First**: Agents MUST read `packages/index.md` and `apps/index.md`.
2.  **NanoWebDB Only (Zero-Fetch)**: NO `fetch()`. Usage of `@nan0web/db` is mandatory for portability.
3.  **Component Constructor**: Build apps using existing platform components.
4.  **Hands-Off Execution**: Once a release task is defined in `task.md`, the agent must be able to complete it autonomously to the "Green" state.

## 📝 INSTRUCTIONS (Next Session)

1.  **Activate Deposits/Metals**: Follow the protocol in `.agent/rules/ui-standard.md`.
2.  **Consistency Check**: Use `cards` as the gold standard for UI and i18n logic.
3.  **Deep Linking**: Ensure all UI states (views, tabs) are synced with URL.

## 🔗 References

- Index: `packages/index.md`, `apps/index.md`.
- Rules: `.agent/RULES.md`, `apps/@/industrialbank/.agent/RULES.md`.
