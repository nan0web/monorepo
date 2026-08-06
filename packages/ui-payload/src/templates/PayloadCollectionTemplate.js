import { Model } from '@nan0web/types'
import { CodeTemplate } from '@nan0web/ui'

/** @typedef {Object} Field */

/**
 * PayloadCollectionTemplate - Model to generate Payload CMS CollectionConfig using CodeTemplate.
 */
export class PayloadCollectionTemplate extends Model {
	static alias = 'payload-collection-template'

	static collectionSlug = {
		help: 'Collection slug identifier',
		default: 'item',
	}
	static useAsTitle = {
		help: 'Field name used as title in admin',
		default: 'title',
	}
	static labels = {
		help: 'Localized labels object (singular/plural)',
		default: { singular: 'Item', plural: 'Items' },
	}
	static group = {
		help: 'Admin group configuration',
		default: 'Content',
	}
	static fields = {
		help: 'Collection fields array',
		default: [],
	}

	static template = {
		help: 'Raw JavaScript template with CodeTemplate @replace blocks',
		default: `/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'item'
/** @replace */

/**
 * @replace labels
 */
const labels = { singular: { uk: 'Item', en: 'Item' }, plural: { uk: 'Items', en: 'Items' } }
/** @replace */

/**
 * @replace useAsTitle
 */
const useAsTitle = 'title'
/** @replace */

/**
 * @replace group
 */
const group = { uk: 'Content', en: 'Content' }
/** @replace */

/**
 * @replace fields
 */
const fields = []
/** @replace */

/** @type {import('payload').CollectionConfig} */
export const collectionConfig = {
	slug: collectionSlug,
	labels,
	admin: {
		useAsTitle,
		group,
	},
	access: {
		read: () => true,
		create: (/** @type {any} */ { req: { user } }) => Boolean(user),
		update: (/** @type {any} */ { req: { user } }) => Boolean(user),
		delete: (/** @type {any} */ { req: { user } }) => Boolean(user),
	},
	fields,
}
`,
	}

	/**
	 * @param {Partial<PayloadCollectionTemplate>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Collection slug */ this.collectionSlug
		/** @type {string} Label/title field name */ this.useAsTitle
		/** @type {Object} Labels object */ this.labels
		/** @type {Object|string} Group object or string */ this.group
		/** @type {Array<Field>} Collection fields */ this.fields
		/** @type {Object} Custom replace snippets */ this.snippets
	}

	/**
	 * Compiles the CollectionConfig template using native CodeTemplate replace blocks.
	 * @returns {Promise<string>} Generated TS code for the collection
	 */
	async compile() {
		const templateContent = PayloadCollectionTemplate.template.default
		/** @type {Record<string, string>} */
		const input = {
			collectionSlug: `const collectionSlug = '${this.collectionSlug}'`,
			useAsTitle: `const useAsTitle = '${this.useAsTitle}'`,
			labels: `const labels = ${JSON.stringify(this.labels, null, 2)}`,
			group: `const group = ${JSON.stringify(this.group, null, 2)}`,
			fields: `const fields = ${JSON.stringify(this.fields, null, 2)}`,
			.../** @type {Record<string, string>} */ (this.snippets || {}),
		}

		const app = new CodeTemplate({
			template: templateContent,
			input,
		})

		const gen = app.run()
		let step = await gen.next()
		while (!step.done) {
			const res = /** @type {import('@nan0web/ui').ResultIntent | undefined} */ (step.value)
			if (res?.data?.output) {
				return res.data.output
			}
			step = await gen.next()
		}
		const finalRes = /** @type {import('@nan0web/ui').ResultIntent | undefined} */ (step.value)
		return finalRes?.data?.output || templateContent
	}

	/**
	 * Synchronously compiles the CollectionConfig template.
	 * @returns {string} Generated TS code for the collection
	 */
	compileSync() {
		const templateContent = PayloadCollectionTemplate.template.default
		/** @type {Record<string, string>} */
		const input = {
			collectionSlug: `const collectionSlug = '${this.collectionSlug}'`,
			useAsTitle: `const useAsTitle = '${this.useAsTitle}'`,
			labels: `const labels = ${JSON.stringify(this.labels, null, 2)}`,
			group: `const group = ${JSON.stringify(this.group, null, 2)}`,
			fields: `const fields = ${JSON.stringify(this.fields, null, 2)}`,
			.../** @type {Record<string, string>} */ (this.snippets || {}),
		}

		let output = templateContent
		for (const [key, replacement] of Object.entries(input)) {
			const blockRegex = new RegExp(`(\\/\\*\\*\\s*\\n?\\s*\\*\\s*@replace\\s+${key}\\s*\\n?[\\s\\S]*?\\*\\/)([\\s\\S]*?)(\\/\\*\\*\\s*@replace\\s*\\*\\/)`, 'g')
			if (blockRegex.test(output)) {
				output = output.replace(blockRegex, `$1\n${replacement}\n$3`)
			}
		}
		return output
	}
}
