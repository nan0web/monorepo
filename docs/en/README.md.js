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
	 * Main knowledge hub for the NaN•Web ecosystem <v name="version">v3.2.0</v>.
	 *
	 * ---
	 *
	 * ## 🌟 Foreword: Mission & Philosophy
	 *
	 * **NaN•Web** is a decentralized, crypto-anarchic network of fractal applications designed for the benefit of society and nature as a whole.
	 *
	 * > Zero is not a number, it is the universe.
	 *
	 * ---
	 *
	 * ## 🏛️ Architectural Determinism (OLMUI & Model-as-App)
	 *
	 * The foundation of the platform is strict and universal software determinism:
	 *
	 * 1. **Total Logic Isolation (TLI)**: Business logic and validation are strictly separated from visual rendering.
	 * 2. **Model-as-Schema / Model-as-App**: Data descriptions, validation, and behaviors are unified inside JS domain models.
	 * 3. **Data-Driven Applications**: All screens, layouts, and pages render strictly from route definitions and models stored in any agnostic database via the `db.fetch()` protocol.
	 * 4. **One Logic — Multiple User Interfaces (OLMUI)**:
	 *    Fundamental triad of determinism:
	 *    - **Models**: Algorithms and business domain logic.
	 *    - **Styles & Components**: Presentation and formatting of data.
	 *    - **Navigation**: Layout of components into pages for human usability.
	 *
	 * Thanks to this, a single layer of business logic by default **works out-of-the-box across all UI implementations**:
	 *
	 * - 🖥️ **CLI** (Interactive Terminal)
	 * - 💬 **Chat** (Autonomous LLM Agents)
	 * - 🌐 **Web & SSG** (Next.js / Turbopack / Vanilla DOM)
	 * - ⚛️ **React / Lit** (Web Components)
	 * - 🎙️ **Voice** (Voice Assistant Interface)
	 *
	 * - [Architecture Overview](../../ARCHITECTURE.md) — Fundamental principles.
	 * - [AI Knowledge Base Setup](./SETUP_KNOWLEDGE_BASE.md) — **CRITICAL**: How to give your AI agent project context.
	 * - [Package Status](../../STATUS.md) — Current health of every module (v3.2.0).
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
	 * > 💡 **Note:** If you run into a native bindings error (`Could not locate the bindings file` for `hnswlib-node`), run: `npm rebuild hnswlib-node --prefix $(pnpm root -g)/..`
	 *
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
