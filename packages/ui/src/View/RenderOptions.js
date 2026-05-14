import Frame from '../Frame/Frame.js'

class RenderOptions {
	static DEFAULTS = {
		resizeToView: false,
		translateFrame: false,
		render: true,
		renderMethod: Frame.RenderMethod.VISIBLE,
	}
	/** @type {boolean} [false] */
	resizeToView
	/** @type {boolean} [false] */
	translateFrame
	/** @type {boolean} [true] */
	render
	/** @type {string} */
	renderMethod
	/** @type {number} */
	width
	/** @type {number} */
	height
	constructor(props = {}) {
		const DEFAULTS = this.DEFAULTS
		const {
			resizeToView = DEFAULTS.resizeToView,
			translateFrame = DEFAULTS.translateFrame,
			render = DEFAULTS.render,
			renderMethod = DEFAULTS.renderMethod,
			width = 0,
			height = 0,
		} = props
		this.resizeToView = resizeToView
		this.translateFrame = translateFrame
		this.render = render
		this.renderMethod = renderMethod
		this.width = width
		this.height = height
	}
	get DEFAULTS() {
		return /** @type {typeof RenderOptions} */ (this.constructor).DEFAULTS
	}
	static from(props = {}) {
		if (props instanceof RenderOptions) return props
		return new this(props)
	}
}

export default RenderOptions
