import RenderOptions from '../../src/View/RenderOptions.js'

class AppRenderOptions extends RenderOptions {
	static DEFAULTS = {
		...RenderOptions.DEFAULTS,
		resizeToView: true,
	}
	static from(props = {}) {
		if (props instanceof AppRenderOptions) return props
		return new this(props)
	}
}

export default AppRenderOptions
