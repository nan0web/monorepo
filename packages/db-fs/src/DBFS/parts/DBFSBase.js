import DB from '@nan0web/db'
import YAML from 'yaml'
import { NaN0 } from '@nan0web/types'
import Markdown from '@nan0web/markdown'
import FS from '../../FSAdapter.js'
import FSDriver from '../../FSDriver.js'
import { parseToObjects, stringifyCSV } from '../../file-system/csv.js'

/**
 * Base filesystem database class.
 * Foundation layer that inherits from DB and registers filesystem formats.
 *
 * @class
 * @extends {DB}
 */
export default class DBFSBase extends DB {
	static FS = FS
	static Driver = FSDriver

	/**
	 * @param {object} [input={}]
	 */
	constructor(input = {}) {
		super(input)

		// Register default formats for db-fs
		this.registry.register(
			'.jsonl',
			(str) =>
				str
					.split('\n')
					.filter(Boolean)
					.map((x) => JSON.parse(x)),
			(arr) => {
				// Validation: must be an array with non-null/undefined items
				if (!Array.isArray(arr)) {
					throw new Error('JSONL document must be an array')
				}
				for (const item of arr) {
					if (item === undefined || item === null) {
						throw new Error('JSONL array items cannot be null or undefined')
					}
				}
				return arr.map((x) => JSON.stringify(x)).join('\n') + '\n'
			}
		)

		this.registry.register(
			'.txt',
			(str) => str,
			(doc) => String(doc)
		)

		this.registry.register(
			'.md',
			(str) => new Markdown(str),
			(doc) => {
				if (doc instanceof Markdown) return String(doc)
				return String(new Markdown(doc))
			}
		)

		const yamlLoader = (str) => YAML.parse(str)
		const yamlSaver = (doc) => {
			// Validation: cannot be null or undefined, must be object, string, or number
			if (doc === undefined || doc === null) {
				throw new Error('YAML document cannot be null or undefined')
			}
			if (typeof doc !== 'object' && typeof doc !== 'string' && typeof doc !== 'number') {
				throw new Error('YAML document must be an object, string, or number')
			}
			return YAML.stringify(doc)
		}
		this.registry.register('.yaml', yamlLoader, yamlSaver)
		this.registry.register('.yml', yamlLoader, yamlSaver)

		const nan0Loader = (str) => NaN0.parse(str)
		const nan0Saver = (doc) => {
			// Validation: cannot be null or undefined, must be an object
			if (doc === undefined || doc === null) {
				throw new Error('NaN·Web document cannot be null or undefined')
			}
			if (typeof doc !== 'object') {
				throw new Error('NaN·Web document must be an object')
			}
			return NaN0.stringify(doc)
		}
		this.registry.register('.nan0', nan0Loader, nan0Saver)
		this.registry.register('.nan', nan0Loader, nan0Saver)
		this.registry.register('.nano', nan0Loader, nan0Saver)

		const csvLoader = (str, ext) => {
			const delim = ext === '.tsv' ? '\t' : ','
			return parseToObjects(str, delim)
		}
		const csvSaver = (arr, ext) => {
			const delim = ext === '.tsv' ? '\t' : ','
			return stringifyCSV(arr, delim)
		}

		const csv0Loader = (str, ext) => {
			const delim = ext === '.tsv' || ext === '.tsv0' ? '\t' : ','
			const trimmed = str.trimStart()
			let metadata = {}
			let csvContent = str
			if (trimmed.startsWith('---')) {
				const afterFirst = trimmed.indexOf('\n') + 1
				const closingIndex = trimmed.indexOf('\n---', afterFirst)
				if (closingIndex >= 0) {
					const block = trimmed.slice(afterFirst, closingIndex)
					csvContent = trimmed.slice(closingIndex + 4).replace(/^\n+/, '')
					try {
						metadata = NaN0.parse(block) || {}
					} catch (e) {}
				}
			}
			const arr = /** @type {any} */ (parseToObjects(csvContent, delim))
			arr.vars = metadata
			return arr
		}
		const csv0Saver = (arr, ext) => {
			const delim = ext === '.tsv' || ext === '.tsv0' ? '\t' : ','
			const csvStr = stringifyCSV(arr, delim)
			const vars = /** @type {any} */ (arr).vars
			if (vars && Object.keys(vars).length > 0) {
				const block = NaN0.stringify(vars)
				return ['---', block, '---', '', csvStr].join('\n')
			}
			return csvStr
		}

		this.registry.register('.csv', csvLoader, csvSaver)
		this.registry.register('.tsv', csvLoader, csvSaver)
		this.registry.register('.csv0', csv0Loader, csv0Saver)
		this.registry.register('.tsv0', csv0Loader, csv0Saver)

		// Override JSON saver with validation
		this.registry.register(
			'.json',
			(str) => JSON.parse(str),
			(doc) => {
				// Validation: cannot be null or undefined
				if (doc === undefined || doc === null) {
					throw new Error('JSON document cannot be null or undefined')
				}
				return JSON.stringify(doc, null, 2)
			}
		)
	}

	/**
	 * Array of loader functions that attempt to load data from a file path.
	 * Each loader returns false if it cannot handle the data format.
	 * @type {((file: string, data: any, ext: string) => any)[]}
	 */
	loaders = [
		/** @param {string} file @param {any} data @param {string} ext */
		(file, data, ext) => ('.txt' === ext ? this.FS.loadTXT(file, '', true) : false),
		/** @param {string} file @param {any} data @param {string} ext */
		(file, data, ext) => this.FS.load(file),
	]

	/**
	 * Array of saver functions that attempt to save data to a file path.
	 * Each saver returns false if it cannot handle the data format.
	 * @type {((file: string, data: any, ext: string) => any)[]}
	 */
	savers = [
		/** @param {string} file @param {any} data @param {string} ext */
		(file, data, ext) => this.FS.saveAsync(file, data),
	]

	/**
	 * @returns {typeof FS}
	 */
	get FS() {
		return /** @type {typeof DBFSBase} */ (this.constructor).FS
	}

	/**
	 * Creates a new DB instance with a subset of the data and meta.
	 * @param {string} uri The URI to extract from the current DB.
	 * @returns {any}
	 */
	extract(uri) {
		const Class = /** @type {any} */ (this.constructor)
		return Class.from(super.extract(uri))
	}
}
