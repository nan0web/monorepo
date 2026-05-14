# Environment Setup & Knowledge Base Deployment (MCP)

This document describes the process of setting up the NaN•Web environment for a new developer, specifically focusing on the AI Knowledge Base (MCP) integration.

## Step 1: Clone & Install

1. Clone the monorepo.
2. Install dependencies:
```bash
pnpm install
```

## Step 2: Configure Local LLM (EMBEDDER)

The vector search requires an embedding model to convert text into vectors.

1. Start **LM Studio** or **Ollama** locally.
2. Enable the Local API Server (usually `http://localhost:1234/v1` or `http://localhost:11434/v1`).
3. Set the `EMBEDDER_URL` environment variable or create a `.env` file in the root:
```env
EMBEDDER_URL=http://localhost:1234/v1
```

## Step 3: Install MCP Server

To integrate NaN•Web knowledge into your IDE (Cursor, Windsurf, Claude):

```bash
pnpm run ai:setup
```

This script registers the `@nan0web/ai` MCP server in your local AI client configurations. **Restart your IDE after installation.**

## Step 4: Indexing the Workspace

To make the code searchable by the agent, run:

```bash
pnpm run ai:index
```

This command scans all `project.md` files and source code, generating a `nan0web_agents.index.nan0` vector index.

## Step 5: Verification

### via CLI
```bash
npx nan0ai search "What is OLMUI?"
```

### via IDE
Ask your agent: *"Search the nan0web knowledge base for application architecture and explain it."*
Check if the agent calls the `mcp_nan0web-knowledge_search_knowledge_base` tool.

---
> NanoWeb v3.0.0 — AI-Augmented Engineering.
