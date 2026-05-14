import View from '../../src/View/View.js'
import Welcome from '../../src/Component/Welcome/index.js'
import Process from '../../src/Component/Process/index.js'
import AppRenderOptions from './RenderOptions.js'

class AppView extends View {
	static RenderOptions = AppRenderOptions
	constructor(props = {}) {
		super(props)
		this.register(Welcome)
		this.register(Process)
	}
}

export default AppView
