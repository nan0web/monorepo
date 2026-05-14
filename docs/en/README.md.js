import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import DB from '../../packages/db-fs/src/index.js'
import { DocsParser } from '../../packages/test/src/index.js'

const fs = new DB()
let pkg

before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

async function testRender() {
	/**
	 * @docs
	 * # 🏗️ NaN•Web Documentation (EN)
	 *
	 * The main knowledge hub for the NaN•Web ecosystem <v name="version">v3.0.0</v>.
	 *
	 * ## 🏛️ Architecture
	 *
	 * NaN•Web follows the **One Logic, Many UI (OLMUI)** principle. Business logic is strictly isolated in `src/`, while UI adapters live in `src/ui/`.
	 *
	 * - [Architecture Overview](../../ARCHITECTURE.md) — Fundamental principles.
	 * - [AI Knowledge Base Setup](./SETUP_KNOWLEDGE_BASE.md) — **CRITICAL**: How to give your AI agent project context.
	 * - [Package Status](../../STATUS.md) — Current health of every module.
	 *
	 * ## 🚀 Quick Start
	 *
	 * ### 1. Environment Preparation
	 *
	 * Ensure you have [pnpm](https://pnpm.io/) installed. NaN•Web uses pnpm workspaces for efficient dependency management.
	 *
	 * ```bash
	 * pnpm install
	 * ```
	 */
	it('pnpm is the required manager', () => {
		assert.equal(pkg.packageManager?.split('@')[0], 'pnpm')
	})

	/**
	 * @docs
	 * ### 2. AI Integration (Optional but recommended)
	 *
	 * To enable "Sovereign Development" with AI agents, you need to provide them with a Knowledge Base.
	 *
	 * 1. **Configure EMBEDDER_URL**:
	 *    Specify the address of your local embedding server (LM Studio or Ollama).
	 *
	 *    **For Linux / macOS (zsh, bash):**
	 *    ```bash
	 *    export EMBEDDER_URL="http://localhost:1234/v1"
	 *    ```
	 *    **For Windows (Command Prompt):**
	 *    ```cmd
	 *    set EMBEDDER_URL=http://localhost:1234/v1
	 *    ```
	 *    **For Windows (PowerShell):**
	 *    ```powershell
	 *    $env:EMBEDDER_URL = "http://localhost:1234/v1"
	 *    ```
	 *
	 * 2. **Index the workspace**:
	 *    ```bash
	 *    pnpm run ai:index
	 *    ```
	 *
	 * 3. **Setup MCP Server**:
	 *    ```bash
	 *    pnpm run ai:setup
	 *    ```
	 *
	 * ### 3. Global AI Access (nan0ai)
	 *
	 * You can install the assistant globally to access NaN•Web knowledge from anywhere in your system:
	 *
	 * ```bash
	 * pnpm add -g @nan0web/ai
	 * ```
	 * Now the `nan0ai` command is available everywhere. Try:
	 * ```bash
	 * nan0ai search "How to create a new component?"
	 * ```
	 */
	it('AI scripts are available', () => {
		assert.ok(pkg.scripts['ai:index'])
		assert.ok(pkg.scripts['ai:setup'])
	})

	/**
	 * @docs
	 * ## 📦 Packages
	 *
	 * - **@nan0web/ui** — Framework-agnostic UI core and Lit adapters.
	 * - **@nan0web/db-fs** — High-performance document database for the filesystem.
	 * - **@nan0web/ai** — The brain of the ecosystem, handling RAG and MCP search.
	 *
	 * ---
	 * > This documentation is synchronized automatically via Sovereign Inheritance (ProvenDoc).
	 */
	it('Package exports are valid', () => {
		assert.ok(pkg.dependencies['@nan0web/log'])
	})
}

describe('English Documentation rendering', async () => {
	const parser = new DocsParser()
	const text = String(parser.decode(testRender))
	await fs.saveDocument('docs/en/README.md', text)

	it('renders README.md correctly', async () => {
		const doc = await fs.loadDocument('docs/en/README.md')
		assert.ok(String(doc?.content || doc).includes('# 🏗️ NaN•Web'))
	})
})
