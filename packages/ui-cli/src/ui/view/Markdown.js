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
		// In non-interactive or render scenarios, avoid blocking TTY pager
		const print = props.print !== undefined ? props.print : !props.interactive
		await markdownViewer({
			content: props.content || props.message || '',
			title,
			print,
			t: adapter?.t || ((k) => k),
			console: adapter?.console,
		})
	})
}
