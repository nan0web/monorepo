import { LitElement, html, css } from 'lit'

/**
 * CodeBlock — styled terminal code display with title bar.
 *
 * All colors via CSS Custom Properties — override in your theme:
 *   --ui-code-bg, --ui-code-border, --ui-code-fg, --ui-code-title-fg
 *   --ui-code-font, --ui-code-radius
 *   --ui-code-dot-red, --ui-code-dot-yellow, --ui-code-dot-green
 *
 * @element ui-code-block
 * @attr {string} title - Title text shown in the header bar
 * @attr {string} lang - Language hint (for future syntax highlighting)
 * @prop {string} code - Code content to display
 */
class UICodeBlock extends LitElement {
	static properties = {
		title: { type: String },
		lang: { type: String },
		code: { type: String },
	}

	constructor() {
		super()
		this.title = ''
		this.lang = ''
		this.code = ''
	}

	static styles = css`
		:host {
			display: block;
			--_bg: var(--ui-code-bg, var(--ba-code, rgba(0, 0, 0, 0.3)));
			--_border: var(--ui-code-border, var(--border, rgba(255, 255, 255, 0.06)));
			--_fg: var(--ui-code-fg, var(--fg, currentColor));
			--_title-fg: var(--ui-code-title-fg, var(--fg-dim, rgba(255, 255, 255, 0.35)));
			--_font: var(--ui-code-font, var(--mono, 'JetBrains Mono', monospace));
			--_radius: var(--ui-code-radius, var(--ra-md, 12px));
		}

		.block {
			background: var(--_bg);
			border: 1px solid var(--_border);
			border-radius: var(--_radius);
			overflow: hidden;
		}

		.header {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.8rem 1rem;
			border-bottom: 1px solid var(--_border);
		}

		.dot {
			width: 10px;
			height: 10px;
			border-radius: 50%;
		}

		.dot.red {
			background: var(--ui-code-dot-red, var(--co-danger, #ef4444));
			opacity: 0.7;
		}
		.dot.yellow {
			background: var(--ui-code-dot-yellow, var(--co-warn, #f59e0b));
			opacity: 0.7;
		}
		.dot.green {
			background: var(--ui-code-dot-green, var(--co-success, #22c55e));
			opacity: 0.7;
		}

		.title {
			margin-left: 0.5rem;
			font-size: 0.8rem;
			color: var(--_title-fg);
			font-family: var(--_font);
		}

		pre {
			margin: 0;
			padding: 1.5rem 2rem;
			overflow-x: auto;
			font-size: 0.85rem;
			line-height: 1.8;
			font-family: var(--_font);
			color: var(--_fg);
		}

		code {
			white-space: pre;
		}
	`

	render() {
		return html`
			<div class="block">
				<div class="header">
					<span class="dot red"></span>
					<span class="dot yellow"></span>
					<span class="dot green"></span>
					<span class="title">${this.title}</span>
				</div>
				<pre><code>${this.code}</code></pre>
			</div>
		`
	}
}

if (!customElements.get('ui-code-block')) {
	customElements.define('ui-code-block', UICodeBlock)
}

export default UICodeBlock
