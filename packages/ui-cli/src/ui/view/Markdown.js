import { markdownViewer } from '../impl/markdown.js'
import { createPrompt } from '../core/Component.js'

/**
 * Renders Markdown content block.
 * @param {{ content?: string|Array, message?: string|Array, title?: string }} props
 * @returns {any}
 */
export function Markdown(props = {}) {
	const adapter = this

	return createPrompt('Markdown', props, async () => {
		const title = props.title || 'Markdown View'
		await markdownViewer({
			content: props.content || props.message || '',
			title,
			t: adapter?.t || ((k) => k),
			console: adapter?.console,
		})
	})
}
