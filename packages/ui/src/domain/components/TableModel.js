import { Model } from '@nan0web/types'
import { show, result } from '../../core/Intent.js'

/**
 * Model-as-Schema for Table Data component.
 * Displays tabular string data in rows and columns.
 */
export class TableModel extends Model {
	static $id = '@nan0web/ui/TableModel'

	static UI = {
		displayingTable: 'Displaying table with {count} rows',
	}

	static columns = {
		help: 'Array of column headers',
		type: 'string[]',
		default: ['Header 1', 'Header 2'],
	}

	static rows = {
		help: '2D Array of table cells matching column length',
		type: 'string[][]',
		default: [
			['Cell 1.1', 'Cell 1.2'],
			['Cell 2.1', 'Cell 2.2'],
		],
	}

	/**
	 * @param {Partial<TableModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string[]} Array of column headers */ this.columns
		/** @type {string[][]} 2D Array of table cells matching column length */ this.rows
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		yield show(this._.t(TableModel.UI.displayingTable, { count: this.rows?.length || 0 }), 'info', {
			component: 'Table',
			model: this,
		})

		return result({ rowsCount: this.rows?.length || 0 })
	}
}
