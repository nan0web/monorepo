# 🛸 NaN0 Editor: Capabilities & API Manifest (v0.5.1)

## 🏗️ Core Architecture: "Graph-as-Document"

The NaN0 Editor is not a simple form builder; it's a **recursive graph navigator**. Each JSON document is a node, and each reference (`$ref`) is an edge.

---

### ✅ Current Capabilities (Production Ready)

#### 1. Recursive Stack Management (`ModalStack`)

- Handles up to **7 levels** of nested editing.
- Each level has its own `EditorModel` instance.
- Visual depth indication (Scale/Blur animation).
- Global **Esc** to pop stack, **Ctrl+S** to save top layer.

#### 2. Pure Logic Core (`@nan0web/editor`)

- UI-agnostic: works with React, Lit, or CLI.
- State management with `onChange` subscriptions.
- Unified Persistence: Cache ($db.set), Commit, and Git strategies.

#### 3. Smart Field Adapters

- **ReferenceField**: Search catalog (🔍) or follow link (🔗).
- **ListField**: Live-parsing text into badges/tags on space or comma.
- **Autofocus**: Intelligent focus on modal open.
- **Shadow DOM Piercing**: Full E2E verification through Playwright.

---

### 🎨 Media & File Capabilities (Next Steps)

| Feature            | Implementation Plan                            | API / Tools                   |
| :----------------- | :--------------------------------------------- | :---------------------------- |
| **Media Library**  | Filtered catalog for `/assets/*.{png,jpg,svg}` | `@nan0web/db-browser`         |
| **Image Upload**   | Drag & Drop + Multipart form submission        | `fetch() + ObjectBlob`        |
| **Photo Preview**  | Inline thumbnail rendering for `type: 'image'` | `Lit.html <img src="${src}">` |
| **DB Persistence** | Save recursive changes back to `nan0web/data`  | `nan0web/db/dbfs`             |

---

### 📡 API Interface (Mock/Prod)

Editor expects a `db` object with these methods:

- `get(uri)`: Returns JSON content.
- `set(uri, data)`: Saves content to storage.
- `meta(uri)`: (Optional) Metadata for friendly display titles.

_Status: Industrial Bank v3.0 Concept Validated._
