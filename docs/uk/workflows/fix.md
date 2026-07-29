---
description: TDD Fix Workflow (Red-Green-Refactor)
---

# TDD Bug Fix Protocol

1. **Analyze**:
   - Understand the reported bug.
   - Locate the relevant file(s).

2. **Reproduction (Red)**:
   - Create a NEW test file (or add a test case to an existing one) that reproduces the bug.
   - Run the test to confirm it FAILS.
   - **Artifact**: Show the failing test output.

3. **Implement Fix (Green)**:
   - Modify the source code to address the issue.
   - Keep changes minimal and focused.
   - Run the reproduction test again.
   - **Artifact**: Show the passing test output.

4. **Verify Regression**:
   - Run related legacy tests to ensure nothing else broke.

5. **Finalize**:
   - Save the fix.
   - (Optional) Delete the reproduction test if it was temporary, or keep it as a regression test.
   - Initiate the `/commit` workflow.
