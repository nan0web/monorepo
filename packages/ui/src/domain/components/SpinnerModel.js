import { Model } from '@nan0web/types'

/**
 * Model-as-Schema for Spinner component.
 * Represents a loading or progress state without user interaction.
 */
export class SpinnerModel extends Model {
	static size = {
		help: 'Spinner diameter',
		default: 'md',
		options: ['sm', 'md', 'lg'],
	}

	static color = {
		help: 'Override for base color token',
		type: 'color',
		default: '',
	}

	/**
	 * @param {Partial<SpinnerModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {'sm'|'md'|'lg'} Spinner diameter */ this.size
		/** @type {string} Override for base color token */ this.color
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		yield {
			type: 'progress',
			message: 'Loading...',
			component: 'Spinner',
			model: this,
		}

		return { type: 'result', data: { completed: true } }
	}
}
