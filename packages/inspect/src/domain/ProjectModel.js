import { Model } from '@nan0web/types'

/**
 * Universal Data Model for manifests (project.md and task.md).
 * Follows the 9-Step Master App Pipeline for Zero-Hallucination Development.
 */
export class ProjectModel extends Model {
	// ==========================================
	// Metadata (YAML Frontmatter)
	// ==========================================
	static version = { help: 'Project or release version (e.g., 1.4.0)', type: 'string', required: false }
	static type = { help: 'Task type', type: 'string', options: ['feature', 'bugfix', 'refactor', 'architecture', 'package'], default: 'feature' }
	static status = { help: 'Current phase status', type: 'string', options: ['planning', 'active', 'done', 'deprecated'], default: 'planning' }
	static locale = { help: 'Document locale', type: 'string', default: 'uk' }
	static models = { help: 'Models created or impacted by this release', type: 'string[]', default: [] }
	static mission = { help: 'Main objective or mission title (H1)', type: 'string', required: true }

	// ==========================================
	// OLMUI 9-Phase Master Pipeline
	// ==========================================

	static seed = { help: 'Phase 1: Seed (Intent Analysis, Generation of Technical Spec)', type: 'string', required: true }

	static model = { help: 'Phase 2: Model (Domain Model and Schema Generation)', type: 'string', required: false }

	static contract = { help: 'Phase 3: Contract (Writing Contract Tests - TDD)', type: 'string[]', default: [] }

	static adapter = { help: 'Phase 4: Adapter (Generation of OLMUI UI Adapter)', type: 'string', required: false }

	static ui_cli = { help: 'Phase 5: UI-CLI (Command Line Interface creation)', type: 'string[]', default: [] }

	static ui_chat = { help: 'Phase 6: UI-CHAT (Conversational AI Interface creation)', type: 'string[]', default: [] }

	static ui_web = { help: 'Phase 7: UI-WEB (Browser Native or React Interface creation)', type: 'string[]', default: [] }

	static ui_mobile = { help: 'Phase 8: UI-MOBILE (Mobile Interface creation)', type: 'string[]', default: [] }

	static qa = { help: 'Phase 9: QA (Final Build, Quality Assurance, and Release)', type: 'string[]', default: [] }

	static get phases() {
		return ['seed', 'model', 'contract', 'adapter', 'ui_cli', 'ui_chat', 'ui_web', 'ui_mobile', 'qa']
	}

	// ==========================================
	// Initialization (Strict JSDoc)
	// ==========================================
	constructor(data = {}, options = {}) {
		super(data, options)

    /** @type {string|undefined} */ this.version
    /** @type {'feature'|'bugfix'|'refactor'|'architecture'|'package'} */ this.type
    /** @type {'planning'|'active'|'done'|'deprecated'} */ this.status
    /** @type {string[]} */ this.models
    /** @type {string} */ this.locale
    /** @type {string} */ this.mission

    /** @type {string} */ this.seed
    /** @type {string|undefined} */ this.model
    /** @type {string[]} */ this.contract
    /** @type {string|undefined} */ this.adapter
    /** @type {string[]} */ this.ui_cli
    /** @type {string[]} */ this.ui_chat
    /** @type {string[]} */ this.ui_web
    /** @type {string[]} */ this.ui_mobile
    /** @type {string[]} */ this.qa
	}
}
