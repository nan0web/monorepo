import { Message } from '@nan0web/co'
import View from '../../View/View.js'
import CoreApp from './CoreApp.js'
import Widget from './Widget.js'

/** @typedef {import("../../View/View.js").ComponentFn} ComponentFn */

/**
 * Abstract UI class to connect apps and widgets.
 * Supports input/output data typed classes and views.
 */
export default class UI extends Widget {
	/** @type {CoreApp} The app instance connected to this UI */
	app

	/**
	 * Creates a new UI instance.
	 * @param {CoreApp} app - The app to connect to this UI
	 * @param {View} [view] - View instance for rendering (default: new View())
	 */
	constructor(app, view = new View()) {
		super(view)
		this.app = app
	}

	/**
	 * Convert raw input to Message array.
	 * Must be implemented by subclasses.
	 * @param {any} rawInput - Raw input to convert
	 * @returns {Message[]} Array of command messages
	 * @throws {Error} Always thrown as this method must be implemented by subclasses
	 */
	convertInput(rawInput) {
		throw new Error('convertInput must be implemented by subclass')
	}

	/**
	 * Sets up event handlers for UI process events.
	 * @param {ComponentFn} UIProcess - Process view component
	 */
	show(UIProcess) {
		if (!UIProcess) return
		const onStart = () => {
			// this.view.render(UIProcess)
		}
		const onData = () => {}
		const onEnd = () => {}

		this.on('start', onStart)
		this.on('data', onData)
		this.on('end', onEnd)
	}

	/**
	 * Output results to the interface.
	 * @param {any[]} results - Results to output
	 */
	output(results) {
		results.forEach((result) => {
			this.view.info(JSON.stringify(result))
		})
	}
}
