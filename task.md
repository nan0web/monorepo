**Title:** Technical Task – Extending `llimo.v3` Agent with Dynamic Workflow Orchestration, Inline Snippet Replacement, and Advanced Validation  

**Scope:**  
Develop and integrate a set of features that enable `llimo.v3` to dynamically select and orchestrate workflow files, replace code snippets in‑place, validate generated content using the existing `StrictBoundaryInterpreter`, and expose rich introspection tools. All changes must preserve the strict boundary communication protocol and maintain zero‑hallucination guarantees.

**1. Dynamic Workflow Selection**  - **Problem:** Currently workflows are selected statically via the `workflow` positional argument or the `@workflow` directive. This limits flexibility when a single session must chain multiple workflows or when a user wants to defer workflow loading until runtime.  
 1. Update `ChatSessionModel._positionals` to support an array of workflow names.  
 2. Modify `packInput` to resolve each identifier using `resolvePaths` and inject the resulting contents into the prompt context.  
 3. Ensure that each loaded workflow is appended to `extraSystemMessages` as a separate system message, preserving locale fallback logic (`@data/<locale>/workflows`).  
 4. Add a method `loadWorkflows()` that returns a map `{workflowName: content}` for later use by the orchestrator.  **2. Inline Snippet Replacement**  
 - After parsing `answer` with `StrictBoundaryInterpreter`, filter files where `file.startLine !== undefined && file.lineCount !== undefined`.  
 - Retrieve the original file content via `os.readFile`.  
 - Apply `applyPatch` to generate `updatedContent`.  
 - Write the updated content back using `os.writeFile`.  

**3. Workflow‑Based Command Execution**  

**4. Validation and Rejecting Illicit Output**  

**5. Expanded `StaticBoundaryInterpreter` Usage**  - The interpreter currently only validates that the surrounding text does not contain stray markdown fences. Extend it to also:  
 1. Record the `filename`, `startLine`, and `lineCount` of each boundary block.  
 2. Return an array `files` where each entry contains `filename`, `content`, `startLine`, `lineCount`.  
 3. Ensure the parsing result is serialisable (no circular references).  

**6. Metadata Injection for Files**  

**7. Metrics Reporting**  

**8. UI‑Level Confirmation for File Writes**  

**9. Test Coverage**  
 - Correct handling of unchanged surrounding lines.  
 - Proper restoration when the user cancels the confirm step.  

**10. Documentation Updates**  

**11. Code Examples (Expected Result)**  
Below are code snippets that illustrate the expected behavior after the changes. These snippets should be placed in the appropriate files and will be automatically validated by the test suite.  

```js
// src/domain/workflow/WorkflowListModel.js (new method)
async loadWorkflows(names, locale = 'uk') {
 const { db } = this._;
 const resolved = [];
 for (const name of names) {
   const path = await this.resolvePaths(name) // using existing resolvePaths
     .find(p => p.isDb);
   if (!path) continue;
   const content = await db.loadDocumentAs('.txt', path.path);
   if (content) resolved.push({ filename: path.path, content });
 }
 return resolved;
}

// src/utils/StrictBoundaryInterpreter.js (enhanced parse)
static parse(source) {
 // ... existing logic ...
 // Additional check for stray markdown fences
 if (hasOutsideMarkdown || (files.length === 0 && source.includes('```'))) {
   return { isValid: false, error: 'markdown_not_allowed_use_boundary', files: [] };
 }
 // Return enriched file objects with startLine/lineCount preserved
 return { isValid: true, files };
}

// src/utils/applyPatch.js (new)
export function applyPatch(original, patch) {
 const originalLines = original.split(/\r?\n/);
 const patchLines = patch.split(/\r?\n/);
 // ... unified diff parsing logic as described ...
 return resultLines.join('\n');
}
```

**8. Rollback Strategy**  

**9. Performance Considerations**  

**10. Acceptance Criteria**  
# 🏗️ Task: v3.1.0 Sovereign Monorepo Stabilization

- [x] Виправити `ERR_MODULE_NOT_FOUND` у `SyncDocsScenario.test.js` (наслідки міграції /src)
- [x] Оновити очікування рендерингу HTML у `runner.test.js`
- [x] Відновити імпорт `ProjectModel` у `bin/project-validator.js` (переїзд у @nan0web/core)
- [x] Виправити ініціалізацію `ProjectModel` (spread metadata) у валідаторі
- [x] Додати ESM CLI guard (`import.meta.url`) у `bin/project-validator.js`
- [x] Усунути стан гонитви (race condition) у тестах `AppLogger` (`Runner.story.js`)
- [x] Додати відсутні залежності у корінь `package.json` (`core`, `inspect`, `co`)
- [x] Підтвердити стабільність `packages/ui/src/domain/migration.test.js`

---
[English Version (task.en.md)](./task.en.md) | [Українська версія (task.md)](./task.md)
