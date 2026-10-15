import { Model } from '@nan0web/types'
import { ReleaseMemberModel } from './ReleaseMemberModel.js'
import { ReleaseTaskModel } from './ReleaseTaskModel.js'
import { ReleaseParityModel } from './ReleaseParityModel.js'
import { ReleaseIssueModel } from './ReleaseIssueModel.js'

export class ReleaseModel extends Model {
	static version = { type: 'string', required: true }
	static title = { type: 'string', required: true }
	static status = { type: 'string', default: 'todo' } // 'todo' | 'work' | 'done' | 'fail'
	static type = { type: 'string', default: 'minor' } // 'major' | 'minor' | 'patch' | 'hotfix' | 'chore'
	static summary = { type: 'string' }
	static epic = { type: 'string' }
	static sprint = { type: 'string' }
	static tracker = { type: 'string' }

	// Sub-collections
	static team = { type: 'array', itemType: ReleaseMemberModel, default: [] }
	static tasks = { type: 'array', itemType: ReleaseTaskModel, default: [] }
	static criteria = { type: 'array', itemType: ReleaseTaskModel, default: [] }
	static parity = { type: 'array', itemType: ReleaseParityModel, default: [] }
	static issues = { type: 'array', itemType: ReleaseIssueModel, default: [] }
	static files = { type: 'array', default: [] }
	static meta = { type: 'object', default: {} }

	/**
	 * @param {Partial<ReleaseModel>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Release version */
		this.version
		/** @type {string} Release title */
		this.title
		/** @type {'todo' | 'work' | 'done' | 'fail'} Release status */
		this.status
		/** @type {'major' | 'minor' | 'patch' | 'hotfix' | 'chore'} Release type */
		this.type
		/** @type {string} Release summary / description */
		this.summary
		/** @type {string} Epic identifier */
		this.epic
		/** @type {string} Sprint name */
		this.sprint
		/** @type {string} External tracker URL template */
		this.tracker
		/** @type {ReleaseMemberModel[]} Team members (ролі, імена, логіни) */
		this.team
		/** @type {ReleaseTaskModel[]} Tasks in scope */
		this.tasks
		/** @type {ReleaseTaskModel[]} Acceptance criteria (DoD) */
		this.criteria
		/** @type {ReleaseParityModel[]} Data parity verification items */
		this.parity
		/** @type {ReleaseIssueModel[]} Issues and risks */
		this.issues
		/** @type {Array<{file: string, size?: string, hash?: string, type?: string}>} Artifact files */
		this.files
		/** @type {Record<string, any>} Frontmatter / metadata */
		this.meta
	}

	static SECTIONS = {
		summary: [
			// EN (English)
			'summary', 'objective', 'description', 'overview',
			// UK (Українська)
			'опис', 'мета', 'ціль', 'огляд',
			// ES (Español)
			'resumen', 'objetivo', 'descripcion',
			// FR (Français)
			'resume', 'objectif',
			// DE (Deutsch)
			'zusammenfassung', 'ziel', 'beschreibung',
			// ZH (中文 - Chinese)
			'摘要', '目标', '描述',
			// RU (Російська - для сумісності з двомовними українцями)
			'описание', 'цель', 'обзор',
		],
		team: [
			// EN (English)
			'team', 'members', 'contributors', 'roles',
			// UK (Українська)
			'команда', 'учасники', 'ролі',
			// ES (Español)
			'equipo', 'miembros',
			// FR (Français)
			'equipe', 'membres',
			// DE (Deutsch)
			'mitglieder',
			// ZH (中文 - Chinese)
			'团队', '成员',
			// RU (Російська)
			'участники', 'роли',
		],
		tasks: [
			// EN (English)
			'tasks', 'scope', 'work plan', 'wbs', 'backlog', 'plan',
			// UK (Українська)
			'план', 'задачі', 'робочий план', 'обсяг',
			// ES (Español)
			'tareas', 'plan de trabajo',
			// FR (Français)
			'taches', 'plan de travail',
			// DE (Deutsch)
			'aufgaben', 'arbeitsplan',
			// ZH (中文 - Chinese)
			'任务', '工作计划',
			// RU (Російська)
			'задачи', 'рабочий план',
		],
		criteria: [
			// EN (English)
			'acceptance', 'acceptance criteria', 'dod', 'definition of done', 'requirements',
			// UK (Українська)
			'критерії', 'критерії прийнятності', 'вимоги',
			// ES (Español)
			'criterios', 'criterios de aceptacion', 'requisitos',
			// FR (Français)
			'criteres', 'criteres d acceptation', 'exigences',
			// DE (Deutsch)
			'akzeptanzkriterien', 'anforderungen',
			// ZH (中文 - Chinese)
			'验收标准', '准入条件', '要求',
			// RU (Російська)
			'критерии', 'критерии приемки', 'требования',
		],
		parity: [
			// EN (English)
			'parity', 'data parity', 'audit', 'verification',
			// UK (Українська)
			'паритет', 'аудит', 'паритет даних', 'верифікація',
			// ES (Español)
			'paridad', 'auditoria',
			// FR (Français)
			'parite',
			// DE (Deutsch)
			'datenparitaet',
			// ZH (中文 - Chinese)
			'数据对齐', '数据一致性', '审计',
			// RU (Російська)
			'паритет данных', 'верификация',
		],
		issues: [
			// EN (English)
			'issues', 'risks', 'blockers', 'problems', 'notes',
			// UK (Українська)
			'ризики', 'зауваження', 'блокери', 'проблеми',
			// ES (Español)
			'riesgos', 'problemas',
			// FR (Français)
			'risques',
			// DE (Deutsch)
			'risiken', 'hinweise',
			// ZH (中文 - Chinese)
			'风险', '问题', '注意事项',
			// RU (Російська)
			'риски', 'замечания', 'блокеры',
		],
		artifacts: [
			// EN (English)
			'artifacts', 'files', 'provenance', 'deliverables',
			// UK (Українська)
			'артефакти', 'файли',
			// ES (Español)
			'artefactos', 'archivos',
			// FR (Français)
			'artefacts', 'fichiers',
			// DE (Deutsch)
			'artefakte', 'dateien',
			// ZH (中文 - Chinese)
			'产物', '文件',
			// RU (Російська)
			'артефакты',
		],
	}

	/**
	 * Extend section synonyms dictionary with custom locale mappings.
	 * @param {Record<string, string[]>} localeMap
	 */
	static addLocaleSections(localeMap) {
		for (const [section, words] of Object.entries(localeMap)) {
			if (this.SECTIONS[section]) {
				this.SECTIONS[section].push(...words)
			}
		}
	}
}

