# 🏗️ NaN•Web Documentation (EN)

Main knowledge hub for the NaN•Web ecosystem <v name="version">v3.2.0</v>.

---

## 🌟 Foreword: Mission & Philosophy

**NaN•Web** is a decentralized, crypto-anarchic network of fractal applications designed for the benefit of society and nature as a whole.

> Zero is not a number, it is the universe.

---

## 🏛️ Architectural Determinism (OLMUI & Model-as-App)

The foundation of the platform is strict and universal software determinism:

1.- **Total Logic Isolation (TLI)**: Business logic and validation are strictly separated from visual rendering.
- **Model-as-Schema / Model-as-App**: Data descriptions, validation, and behaviors are unified inside JS domain models.
- **Data-Driven Applications**: All screens, layouts, and pages render strictly from route definitions and models stored in any agnostic database via the `db.fetch()` protocol.
- **One Logic — Multiple User Interfaces (OLMUI)**:

   Fundamental triad of determinism:
   - **Models**: Algorithms and business domain logic.
   - **Styles & Components**: Presentation and formatting of data.
   - **Navigation**: Layout of components into pages for human usability.

Thanks to this, a single layer of business logic by default **works out-of-the-box across all UI implementations**:

- 🖥️ **CLI** (Interactive Terminal)
- 💬 **Chat** (Autonomous LLM Agents)
- 🌐 **Web & SSG** (Next.js / Turbopack / Vanilla DOM)
- ⚛️ **React / Lit** (Web Components)
- 🎙️ **Voice** (Voice Assistant Interface)


- [Architecture Overview](../../ARCHITECTURE.md) — Fundamental principles.
- [AI Knowledge Base Setup](./SETUP_KNOWLEDGE_BASE.md) — **CRITICAL**: How to give your AI agent project context.
- [Package Status](../../STATUS.md) — Current health of every module (v3.2.0).


## 🚀 Quick Start

### 1. Environment Preparation

Ensure you have [pnpm](https://pnpm.io/) installed. NaN•Web uses pnpm workspaces for efficient dependency management.

```bash
pnpm install
```

pnpm is the required manager

### 2. AI Integration (Optional but recommended)

To enable "Sovereign Development" with AI agents, you need to provide them with a Knowledge Base.

1.- **Configure EMBEDDER_URL**:

   Specify the address of your local embedding server (LM Studio or Ollama).

   **For Linux / macOS (zsh, bash):**
   ```bash
   export EMBEDDER_URL="http://localhost:1234/v1"
   ```
   **For Windows (Command Prompt):**
   ```cmd
   set EMBEDDER_URL=http://localhost:1234/v1
   ```
   **For Windows (PowerShell):**
   ```powershell
   $env:EMBEDDER_URL = "http://localhost:1234/v1"
   ```

1.- **Index the workspace**:

   ```bash
   pnpm run ai:index
   ```

1.- **Setup MCP Server**:

   ```bash
   pnpm run ai:setup
   ```

### 3. Global AI Access (nan0ai)

You can install the assistant globally to access NaN•Web knowledge from anywhere in your system:

```bash
pnpm add -g @nan0web/ai
```
> 💡 **Note:** If you run into a native bindings error (`Could not locate the bindings file` for `hnswlib-node`), run: `npm rebuild hnswlib-node --prefix $(pnpm root -g)/..`

Now the `nan0ai` command is available everywhere. Try:

```bash
nan0ai search "How to create a new component?"
```

AI scripts are available

## 📦 Packages

- **@nan0web/ui** — Framework-agnostic UI core and Lit adapters.
- **@nan0web/db-fs** — High-performance document database for the filesystem.
- **@nan0web/ai** — The brain of the ecosystem, handling RAG and MCP search.


---
> This documentation is synchronized automatically via Sovereign Inheritance (ProvenDoc).

Package exports are valid


