import { Model } from '@nan0web/types'

/**
 * @typedef {'flow'|'sticky-bottom'|'sticky-top'|'dialog-modal'|'spatial-xyz'} LayoutType
 */

/**
 * Universal Layout Interface for OLMUI.
 * Defines the semantic spatial placement of a component in any renderer.
 */
export class LayoutModel extends Model {
	static type = {
		help: 'Base layout type',
		default: 'flow',
		options: [
			{ value: 'flow', label: 'Inline Flow' },
			{ value: 'sticky-bottom', label: 'Sticky Bottom' },
			{ value: 'sticky-top', label: 'Sticky Top' },
			{ value: 'dialog-modal', label: 'Modal / Dialog' },
			{ value: 'spatial-xyz', label: 'Spatial XYZ Coordinates' }
		]
	}

	static coordinates = {
		help: 'Physical, screen, or audio coordinates if type requires it',
		default: null,
		type: 'object'
	}

	/**
	 * Creates a new LayoutModel instance to define spatial placement.
	 * @param {Partial<LayoutModel> | Record<string, any>} [data] Input model data.
	 * @param {object} [options] Model options.
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {LayoutType} Base layout type */
		this.type
		
		/** @type {object | null} Configuration or specific layout parameters */
		this.coordinates
	}
}
