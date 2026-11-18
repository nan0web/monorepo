import { Model } from '@nan0web/types'

/**
 * Step 1: Intent (I) — goal and acceptance criteria (<= 7).
 */
export class IntentStep extends Model {
	static maxCriteria = {
		help: 'Maximum number of acceptance criteria per task (<= 7)',
		default: 7,
	}
	static releaseDir = {
		help: 'Directory pattern for release artifacts',
		default: 'releases',
	}

	/**
	 * @param {Partial<IntentStep>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {number} Maximum number of acceptance criteria per task (<= 7) */
		this.maxCriteria
		/** @type {string} Directory pattern for release artifacts */
		this.releaseDir
		if (this.maxCriteria > 7 || this.maxCriteria < 1) {
			throw new RangeError('IntentStep.maxCriteria must be between 1 and 7')
		}
	}
}

/**
 * Step 2: Knowledge (K) — MCP-first research & targetFiles whitelist.
 */
export class KnowledgeStep extends Model {
	static preferMcp = {
		help: 'Prefer active MCP servers before grep/read_file',
		default: true,
	}
	static requireTargetFiles = {
		help: 'Require explicit targetFiles whitelist before code changes',
		default: true,
	}

	/**
	 * @param {Partial<KnowledgeStep>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Prefer active MCP servers before grep/read_file */
		this.preferMcp
		/** @type {boolean} Require explicit targetFiles whitelist before code changes */
		this.requireTargetFiles
	}
}

/**
 * Step 3: Model (M) — pure Model-as-Schema / ModelAsApp domain design.
 */
export class ModelStep extends Model {
	static pureDomain = {
		help: 'Enforce pure domain models without OS/UI coupling',
		default: true,
	}
	static dbMount = {
		help: 'Use virtual DB mounts (this.$db) for all I/O',
		default: true,
	}

	/**
	 * @param {Partial<ModelStep>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Enforce pure domain models without OS/UI coupling */
		this.pureDomain
		/** @type {boolean} Use virtual DB mounts (this.$db) for all I/O */
		this.dbMount
	}
}

/**
 * Step 4: Contract (C) — TDD contract tests on In-Memory @nan0web/db.
 */
export class ContractStep extends Model {
	static inMemoryDb = {
		help: 'Run scenario/contract tests against In-Memory @nan0web/db',
		default: true,
	}

	/**
	 * @param {Partial<ContractStep>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Run scenario/contract tests against In-Memory @nan0web/db */
		this.inMemoryDb
	}
}

/**
 * Step 5: Build (B) — minimal clean implementation.
 */
export class BuildStep extends Model {
	static forbidDirectFs = {
		help: 'Forbid direct fs/path/os/process usage in domain code',
		default: true,
	}
	static forbidDbExtensions = {
		help: 'Forbid explicit file extensions in saveDocument/loadDocument',
		default: true,
	}

	/**
	 * @param {Partial<BuildStep>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Forbid direct fs/path/os/process usage in domain code */
		this.forbidDirectFs
		/** @type {boolean} Forbid explicit file extensions in saveDocument/loadDocument */
		this.forbidDbExtensions
	}
}

/**
 * Step 6: Inspect (V) — automated verification & scope isolation.
 */
export class InspectStep extends Model {
	static runTests = {
		help: 'Run test:all before completion',
		default: true,
	}
	static runInspect = {
		help: 'Run nan0inspect domain audit before completion',
		default: true,
	}
	static checkScope = {
		help: 'Verify git diff stays within declared targetFiles',
		default: true,
	}

	/**
	 * @param {Partial<InspectStep>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Run test:all before completion */
		this.runTests
		/** @type {boolean} Run nan0inspect domain audit before completion */
		this.runInspect
		/** @type {boolean} Verify git diff stays within declared targetFiles */
		this.checkScope
	}
}

/**
 * Step 7: Sync (S) — release cycle, knowledge index & backlog sync.
 */
export class SyncStep extends Model {
	static updateIndex = {
		help: 'Update nan0web-knowledge index (pnpm run ai:index)',
		default: true,
	}
	static updateBacklog = {
		help: 'Record discovered gaps in releases/backlog.md',
		default: true,
	}

	/**
	 * @param {Partial<SyncStep>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Update nan0web-knowledge index (pnpm run ai:index) */
		this.updateIndex
		/** @type {boolean} Record discovered gaps in releases/backlog.md */
		this.updateBacklog
	}
}

/**
 * 7-step CoCoDev configuration container.
 */
export default class StepsConfig extends Model {
	static intent = {
		help: 'Step 1: Intent (I)',
		type: 'IntentStep',
		hint: IntentStep,
		default: {},
	}
	static knowledge = {
		help: 'Step 2: Knowledge (K)',
		type: 'KnowledgeStep',
		hint: KnowledgeStep,
		default: {},
	}
	static model = {
		help: 'Step 3: Model (M)',
		type: 'ModelStep',
		hint: ModelStep,
		default: {},
	}
	static contract = {
		help: 'Step 4: Contract (C)',
		type: 'ContractStep',
		hint: ContractStep,
		default: {},
	}
	static build = {
		help: 'Step 5: Build (B)',
		type: 'BuildStep',
		hint: BuildStep,
		default: {},
	}
	static inspect = {
		help: 'Step 6: Inspect (V)',
		type: 'InspectStep',
		hint: InspectStep,
		default: {},
	}
	static sync = {
		help: 'Step 7: Sync (S)',
		type: 'SyncStep',
		hint: SyncStep,
		default: {},
	}

	/**
	 * @param {Partial<StepsConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {IntentStep} Step 1: Intent (I) */
		this.intent = data.intent instanceof IntentStep ? data.intent : new IntentStep(data.intent, options)
		/** @type {KnowledgeStep} Step 2: Knowledge (K) */
		this.knowledge =
			data.knowledge instanceof KnowledgeStep ? data.knowledge : new KnowledgeStep(data.knowledge, options)
		/** @type {ModelStep} Step 3: Model (M) */
		this.model = data.model instanceof ModelStep ? data.model : new ModelStep(data.model, options)
		/** @type {ContractStep} Step 4: Contract (C) */
		this.contract =
			data.contract instanceof ContractStep ? data.contract : new ContractStep(data.contract, options)
		/** @type {BuildStep} Step 5: Build (B) */
		this.build = data.build instanceof BuildStep ? data.build : new BuildStep(data.build, options)
		/** @type {InspectStep} Step 6: Inspect (V) */
		this.inspect =
			data.inspect instanceof InspectStep ? data.inspect : new InspectStep(data.inspect, options)
		/** @type {SyncStep} Step 7: Sync (S) */
		this.sync = data.sync instanceof SyncStep ? data.sync : new SyncStep(data.sync, options)
	}
}
