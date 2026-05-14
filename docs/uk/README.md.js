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
	 * # 🏗️ Документація NaN•Web (UA)
	 *
	 * Головний вузол знань екосистеми NaN•Web <v name="version">v3.0.0</v>.
	 *
	 * ## 🏛️ Архітектура
	 *
	 * NaN•Web базується на принципі **One Logic, Many UI (OLMUI)**. Бізнес-логіка (моделі, валідація) суворо ізольована від візуального представлення.
	 *
	 * - [Огляд Архітектури](../../ARCHITECTURE.md) — Фундаментальні принципи.
	 * - [Налаштування Бази Знань ШІ](./SETUP_KNOWLEDGE_BASE.md) — **ВАЖЛИВО**: Як надати вашому ШІ-агенту контекст проекту.
	 * - [Статус Пакетів](../../STATUS.md) — Поточний стан кожного модуля.
	 *
	 * ## 🚀 Швидкий Старт
	 *
	 * ### 1. Підготовка середовища
	 *
	 * Переконайтеся, що у вас встановлено [pnpm](https://pnpm.io/). Ми використовуємо pnpm workspaces для ефективного керування залежностями.
	 *
	 * ```bash
	 * pnpm install
	 * ```
	 */
	it('pnpm є обовʼязковим менеджером', () => {
		assert.equal(pkg.packageManager?.split('@')[0], 'pnpm')
	})

	/**
	 * @docs
	 * ### 2. Інтеграція з ШІ (Рекомендовано)
	 *
	 * Для «Суверенної Розробки» з ШІ-агентами потрібно надати їм доступ до бази знань проекту.
	 *
	 * 1. **Налаштування EMBEDDER_URL**:
	 *    Вкажіть адресу вашого локального сервера ембедінгів (LM Studio або Ollama).
	 *
	 *    **Для Linux / macOS (zsh, bash):**
	 *    ```bash
	 *    export EMBEDDER_URL="http://localhost:1234/v1"
	 *    ```
	 *    **Для Windows (Command Prompt):**
	 *    ```cmd
	 *    set EMBEDDER_URL=http://localhost:1234/v1
	 *    ```
	 *    **Для Windows (PowerShell):**
	 *    ```powershell
	 *    $env:EMBEDDER_URL = "http://localhost:1234/v1"
	 *    ```
	 *
	 * 2. **Індексація воркспейсу**:
	 *    ```bash
	 *    pnpm run ai:index
	 *    ```
	 *
	 * 3. **Налаштування MCP сервера**:
	 *    ```bash
	 *    pnpm run ai:setup
	 *    ```
	 *
	 * ### 3. Глобальний доступ до ШІ (nan0ai)
	 *
	 * Ви можете встановити асистента глобально, щоб мати доступ до знань NaN•Web з будь-якої точки системи:
	 *
	 * ```bash
	 * pnpm add -g @nan0web/ai
	 * ```
	 * Тепер команда `nan0ai` доступна всюди. Спробуйте:
	 * ```bash
	 * nan0ai search "Як створити новий компонент?"
	 * ```
	 */
	it('Скрипти ШІ доступні', () => {
		assert.ok(pkg.scripts['ai:index'])
		assert.ok(pkg.scripts['ai:setup'])
	})

	/**
	 * @docs
	 * ## 📦 Компоненти
	 *
	 * - **@nan0web/ui** — Ядро UI та адаптери для Lit/React.
	 * - **@nan0web/db-fs** — Високопродуктивна документо-орієнтована БД для файлової системи.
	 * - **@nan0web/ai** — «Мозок» екосистеми, що відповідає за RAG та MCP пошук.
	 *
	 * ---
	 * > Ця документація синхронізується автоматично через Sovereign Inheritance (ProvenDoc).
	 */
	it('Експорти пакетів валідні', () => {
		assert.ok(pkg.dependencies['@nan0web/log'])
	})
}

describe('Ukrainian Documentation rendering', async () => {
	const parser = new DocsParser()
	const text = String(parser.decode(testRender))
	await fs.saveDocument('docs/uk/README.md', text)

	it('renders README.md correctly', async () => {
		const doc = await fs.loadDocument('docs/uk/README.md')
		assert.ok(String(doc?.content || doc).includes('# 🏗️ Документація'))
	})
})
