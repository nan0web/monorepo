# 🏛️ @nan0web/monorepo

> **NaN•Web — One Logic, Many UI.**
> The universal engine where business logic is decoupled from presentation.

---

## 🧭 Documentation Portal

Please select your preferred language for technical documentation, setup guides, and architectural standards:

### [🇺🇦 Українська (Ukrainian)](./docs/uk/README.md)
*Повний посібник з архітектури, встановлення та налаштування локальної бази знань ШІ.*

### [🇺🇸 English (English)](./docs/en/README.md)
*Comprehensive guide for architecture, setup, and AI knowledge base integration.*

---

## 🚀 Quick Start

For developers who want to contribute or build on top of NaN•Web:

1. Clone and Install
```bash
git clone https://github.com/nan0web/monorepo.git
cd monorepo
pnpm install
```

2. Verify installation
```bash
pnpm test
```

## 🤖 AI-Powered Development (MCP)

NaN•Web is designed to be developed alongside AI agents. To give your agent full context, follow these steps:

### 1. Configure EMBEDDER_URL
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

### 2. Index the Workspace (docs, source, data)
Index all packages and the global documentation to build the knowledge base:
```bash
pnpm run ai:index
```

### 3. Index Agent configurations
Generate the agent registry for specialized tasks:
```bash
pnpm run ai:index --agents
```

### 4. Setup MCP Server
Register the `@nan0web/ai` server in your AI client (e.g. Claude Desktop or Antigravity):
```bash
pnpm run ai:setup
```

Verify AI scripts

### 5. Global AI Access (nan0ai)

You can install the assistant globally to access NaN•Web knowledge from anywhere in your system:

```bash
pnpm add -g @nan0web/ai
```
Now the `nan0ai` command is available everywhere. Try:
```bash
nan0ai search "How to create a new component?"
```

4. Global AI access

## 🏛️ Ecosystem Highlights

- **LLiMo** — AI-native developer assistant.
- **Auth.app** — Sovereign identity and authorization.
- **Editor.app** — Data-driven document editor.
- **UI-CLI** — Premium terminal interface with "Lux-level" aesthetics.

---
> NaN•Web v3.0.0 — Designed for Sovereign Developers & AI Agents.

## Contributing

How to contribute? [check here](./CONTRIBUTING.md)

## License

How to license? See the [ISC LICENSE](./LICENSE) file.
