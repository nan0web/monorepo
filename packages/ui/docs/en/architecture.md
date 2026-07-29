# Package Architecture: @nan0web/ui

[🏠 Main (README)](../../README.md) | [📦 Component Models Map](./architecture-models.md) | 🇺🇦 [Українська](./../../uk/architecture.md)

The `@nan0web/ui` ecosystem is designed around the **"One Logic — Many UI" (OLMUI)** concept. Instead of defining *how* to render components (React, CLI), this package exclusively defines *intents* and *data schemas* (Model-as-Schema).

To prevent diagram overload from micro-imports, the package architecture is simplified into key conceptual layers:

```mermaid
graph TD
    %% Layers
    subgraph Orchestration ["Orchestration Layer (Routing & Composition)"]
        UIApp["UIApp (Main Flow)"]
        ShellModel["ShellModel (App Orchestrator)"]
        UIApp --> ShellModel
    end

    subgraph Core ["Core Intent Layer (The Protocol)"]
        IntentAPI["Intent API (show, ask, progress, agent)"]
        Model["Base Model Class"]
    end

    subgraph Domain ["Domain Layouts & Form Models (v1.1 - v1.10.0)"]
        Forms["Forms (InputModel, SelectModel...)"]
        Layouts["Layouts (Header, Hero, Pricing...)"]
        Widgets["Widgets (Tabs, Gallery, Toast...)"]
    end

    subgraph Verification ["Verification & Testing Layer (v1.11.0 Hardening)"]
        SnapshotAuditor["SnapshotAuditor (No-Hallucination)"]
        verifySnapshot["verifySnapshot (.jsonl)"]
        SandboxModel["SandboxModel (Visual Isolation)"]
        SnapshotAuditor --> verifySnapshot
    end

    %% Relationships
    ShellModel -. "composes" .-> Domain
    Domain -. "extends" .-> Model
    Domain -. "yields" .-> IntentAPI
    Verification -. "renders & verifies" .-> Domain
    Verification -. "intercepts" .-> IntentAPI
```

## Functional Layers

### 1. Orchestration Layer
This is the top level. `src/cli.js` exports `UIApp` as the default entry point. Its job is to bootstrap the system and pass routing control to `ShellModel`, which handles cross-platform view transitions.

### 2. Core Intent Layer
Instead of executing side-effects directly (like `console.log` or IO calls), the domain code `yields` intent objects. This was fully stabilized in **v1.11.0** into reliable functions (`show()`, `agent()`, `ask()`), which are ultimately resolved by environment Adapters.

### 3. Domain Models Layer
This is the schema "dictionary" (see [architecture-models.md](./architecture-models.md) for the full map). In **v1.10.0** (*The Domain Bloom*), this layer was expanded with over 20 structural elements (`HeaderModel`, `FooterModel`, `PricingModel`), cementing the package as a comprehensive schema layout framework.

### 4. Verification & Testing Layer
This layer was the primary focus of **v1.11.0**. 
- `SnapshotAuditor` and `verifySnapshot` provide "Zero-Hallucination" guarantees, ensuring intents produced by models contain no artifacts like `NaN` or `undefined`. 
- `SandboxModel` serves as a container to isolate UI domain components for localized visual Playwright testing.

---

## 📥 Unified Result Contract (`result()`)

Every Domain Model or Auditor, upon completing its execution cycle, returns a final result intent using the `result(data)` helper. To ensure consistency and pipeline reliability across the NaN•Web platform, the return payload is standardized with the following required properties:

1.  **`ok: boolean`**: The primary execution status indicator (analogous to native Fetch `Response.ok`). This completely replaces the legacy `success` property.
2.  **`code: number`**: A standard HTTP-like status code:
    -   `200` — Successful execution with no issues.
    -   `400` — Validation/audit failure (business rule violations, styling/lint errors).
    -   `404` — Missing targets or files.
    -   `500` — Critical system or database crash.
3.  **Backward Compatibility**: All tools and orchestrator models (such as `ArchitectureAuditor`) must verify results by supporting both the modern `ok` parameter and fallback legacy `success` property:
    ```javascript
    const isOk = data.ok !== undefined ? data.ok : data.success
    if (isOk === false) overallSuccess = false
    ```

