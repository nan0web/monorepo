import { Model } from './Model.js'

const LANGS = ['en', 'uk', 'de', 'fr', 'es', 'pl']

/**
 * Domain Data Model for a Project Configuration
 * Implements Model-as-Schema (Project-as-Data)
 *
 * Ця модель є дзеркалом `project.schema.yaml` та джерелом правди
 * для автоматичних інструментів валідації та генерації ТЗ.
 *
 * Instance field defaults come from static metadata via resolveDefaults()
 * in the parent Model constructor. Do NOT use class field initializers here
 * as they execute AFTER super() and would overwrite resolved values.
 *
 * @example
 * import { ProjectModel } from '@nan0web/core'
 * const project = new ProjectModel({ description: 'My App', tags: ['ui'] })
 */
export class ProjectModel extends Model {
	static UI = {
		title: 'Project Data',
	}
	static description = {
		help: 'Project description (1-2 sentences)',
		type: 'string',
		default: '',
		positional: true,
	}
	static tags = {
		help: 'Tags (ui, core, cli...)',
		type: 'string[]',
		default: [],
	}
	static locale = {
		help: 'Primary locale',
		type: 'string',
		options: LANGS,
		default: 'uk',
		errorInvalid: 'Invalid primary locale',
		validate: (val) => LANGS.includes(val) || ProjectModel.locale.errorInvalid,
	}
	static i18n = {
		help: 'Additional translation locales',
		type: 'array',
		options: LANGS,
		default: [],
		errorInvalid: 'Invalid translation locales',
		validate: (val) => (Array.isArray(val) && val.every((l) => LANGS.includes(l))) || ProjectModel.i18n.errorInvalid,
	}
	static status = {
		help: 'Project status',
		type: 'string',
		default: 'planned',
		options: ['done', 'active', 'early', 'planned', 'idle', 'legacy'],
		errorInvalid: 'Invalid project status',
		validate: (val) => ProjectModel.status.options.includes(val) || ProjectModel.status.errorInvalid,
	}

	/**
	 * @param {Partial<ProjectModel>} data Data from YAML or Markdown frontmatter
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)

		if (typeof this.tags === 'string') {
			this.tags = /** @type {string} */ (this.tags)
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean)
		}
	}
}
