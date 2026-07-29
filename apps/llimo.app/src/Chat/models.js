import { Ui } from "../cli/Ui.js"
import { ModelInfo } from "../llm/ModelInfo.js"
import { ModelProvider } from "../llm/ModelProvider.js"

/**
 * @param {{ noCache?: boolean, ui?: Ui }} [opts={}]
 * @returns {Promise<Map<string, ModelInfo>>}
 */
export async function loadModels(opts = {}) {
	const { ui } = opts
	const provider = new ModelProvider()

	let name = "", raw = "", models = [], pros = new Set()
	let loading
	if (ui && process.env.NODE_ENV !== 'test') {
		let str = "Loading models …"
		ui.console.info(str)
		if (typeof ui.createProgress === 'function') {
			loading = ui.createProgress(({ elapsed }) => {
				let str = "Loading models …"
				if (name) str = `Loading models @${name} (${models.length} in ${elapsed}ms)`
				if (typeof ui.overwriteLine === 'function') ui.overwriteLine(str)
			})
		}
	}
	const map = await provider.getAll({
		onBefore: (n) => { name = n },
		onData: (n, r, m) => {
			pros.add(n)
			name = n
			raw = r
			models.push(...m)
		},
		...opts
	})
	if (ui && process.env.NODE_ENV !== 'test') {
		if (typeof ui.overwriteLine === 'function') ui.overwriteLine("")
		if (typeof ui.cursorUp === 'function') ui.cursorUp(1)
		const arr = Array.from(pros).sort()
		if (typeof ui.overwriteLine === 'function') {
			ui.overwriteLine(`@ Loaded ${map.size} inference models from ${pros.size} providers`)
		} else {
			ui.console.info(`@ Loaded ${map.size} inference models from ${pros.size} providers`)
		}
		ui.console.info("")
		arr.forEach(pro => ui.console.info(`> ${pro}`))
		if (loading) clearInterval(loading)
	}
	return map
}
