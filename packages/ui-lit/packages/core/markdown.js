import { LitElement, html, css } from 'lit'

/**
 * Markdown — a styling wrapper for rendered HTML content (typography, spacing, colors).
 *
 * OLMUI pair: @nan0web/ui-react-bootstrap Markdown → ui-lit Markdown
 *
 * Does NOT parse Markdown itself. Receives pre-rendered HTML (via `content` prop
 * or `<slot>`) and applies typography styles.
 *
 * CSS Custom Properties:
 *   --ui-md-font, --ui-md-heading-font, --ui-md-fg, --ui-md-link,
 *   --ui-md-code-bg, --ui-md-code-fg, --ui-md-border
 *
 * @element ui-markdown
 * @prop {string} content - Pre-rendered HTML string
 */
class UIMarkdown extends LitElement {
	static properties = {
		content: { type: String },
	}

	constructor() {
		super()
		this.content = ''
	}

	static styles = css`
		:host {
			display: block;
			--_font: var(--ui-md-font, var(--sans, system-ui, -apple-system, sans-serif));
			--_heading-font: var(--ui-md-heading-font, var(--_font));
			--_fg: var(--ui-md-fg, var(--fg, currentColor));
			--_link: var(--ui-md-link, var(--co, #818cf8));
			--_code-bg: var(--ui-md-code-bg, var(--ba-code, rgba(0, 0, 0, 0.2)));
			--_code-fg: var(--ui-md-code-fg, var(--fg-dim, rgba(255, 255, 255, 0.8)));
			--_border: var(--ui-md-border, var(--border, rgba(255, 255, 255, 0.1)));
			--_mono: var(--mono, 'JetBrains Mono', monospace);
			font-family: var(--_font);
			color: var(--_fg);
			line-height: 1.75;
		}

		.prose {
			max-width: 72ch;
		}

		/* Headings */
		.prose h1,
		.prose h2,
		.prose h3,
		.prose h4,
		.prose h5,
		.prose h6 {
			font-family: var(--_heading-font);
			font-weight: 700;
			margin-top: 2em;
			margin-bottom: 0.8em;
			line-height: 1.3;
			letter-spacing: -0.02em;
		}

		.prose h1 {
			font-size: clamp(1.8rem, 4vw, 2.5rem);
			border-bottom: 1px solid var(--_border);
			padding-bottom: 0.4em;
		}

		.prose h2 {
			font-size: clamp(1.4rem, 3vw, 1.9rem);
			border-bottom: 1px solid color-mix(in srgb, var(--_border) 60%, transparent);
			padding-bottom: 0.3em;
		}

		.prose h3 {
			font-size: clamp(1.15rem, 2.5vw, 1.4rem);
		}

		.prose h4 {
			font-size: 1.1rem;
		}

		/* Paragraphs and text */
		.prose p {
			margin: 1em 0;
		}

		.prose strong {
			font-weight: 700;
		}

		/* Links */
		.prose a {
			color: var(--_link);
			text-decoration: none;
			border-bottom: 1px solid color-mix(in srgb, var(--_link) 30%, transparent);
			transition:
				border-color 0.2s,
				color 0.2s;
		}

		.prose a:hover {
			border-color: var(--_link);
		}

		/* Lists */
		.prose ul,
		.prose ol {
			padding-left: 1.6em;
			margin: 1em 0;
		}

		.prose li {
			margin: 0.3em 0;
		}

		.prose li::marker {
			color: var(--_link);
		}

		/* Blockquote */
		.prose blockquote {
			border-left: 3px solid var(--_link);
			margin: 1.5em 0;
			padding: 0.6em 1.2em;
			background: color-mix(in srgb, var(--_link) 6%, transparent);
			border-radius: 0 var(--ra-sm, 4px) var(--ra-sm, 4px) 0;
		}

		.prose blockquote p {
			margin: 0.4em 0;
		}

		/* Inline code */
		.prose code {
			font-family: var(--_mono);
			font-size: 0.88em;
			background: var(--_code-bg);
			color: var(--_code-fg);
			padding: 0.15em 0.4em;
			border-radius: var(--ra-sm, 4px);
		}

		/* Code blocks */
		.prose pre {
			background: var(--_code-bg);
			border: 1px solid var(--_border);
			border-radius: var(--ra-md, 8px);
			padding: 1.2em 1.5em;
			overflow-x: auto;
			margin: 1.5em 0;
			line-height: 1.6;
		}

		.prose pre code {
			background: none;
			padding: 0;
			font-size: 0.85rem;
			color: var(--_code-fg);
		}

		/* Horizontal rule */
		.prose hr {
			border: none;
			height: 1px;
			background: var(--_border);
			margin: 2em 0;
		}

		/* Tables */
		.prose table {
			width: 100%;
			border-collapse: collapse;
			margin: 1.5em 0;
			font-size: 0.9rem;
		}

		.prose th {
			text-align: left;
			padding: 0.6em 0.8em;
			border-bottom: 2px solid var(--_border);
			font-weight: 600;
		}

		.prose td {
			padding: 0.5em 0.8em;
			border-bottom: 1px solid color-mix(in srgb, var(--_border) 50%, transparent);
		}

		/* Images */
		.prose img {
			max-width: 100%;
			height: auto;
			border-radius: var(--ra-md, 8px);
		}
	`

	render() {
		if (this.content) {
			return html`<div class="prose" .innerHTML=${this.content}></div>`
		}
		return html`<div class="prose"><slot></slot></div>`
	}
}

if (!customElements.get('ui-markdown')) {
	customElements.define('ui-markdown', UIMarkdown)
}

export default UIMarkdown
