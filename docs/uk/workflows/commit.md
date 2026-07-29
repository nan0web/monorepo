---
description: Safe Commit Workflow (No Auto-Run)
---

# Safe Commit Procedure

1. **Check Status**:
   - Run `git status` to see what is staged/modified.
   - Run `git diff --stat` to see the scope of changes.

2. **Verify Integrity**:
   - IF (and only if) tests exist, run them: `npm run test:all`.
   - Ensure the build passes: `npm run build` (if applicable, must be included in test:all).

3. **Formulate Message**:
   - Create a concise, semantic commit message (e.g., `fix: ...`, `feat: ...`).
   - Describe WHAT changed and WHY.

4. **PROPOSE Command**:
   - **DO NOT RUN THE COMMIT COMMAND.**
   - Output the suggested command string:
     ```bash
     git add . && git commit -m "Your proposed message"
     ```
   - Ask the user: "Shall I execute this?"

5. **Execute (On User Approval)**:
   - Only after receiving explicit "Yes" or "Do it", run the command.
