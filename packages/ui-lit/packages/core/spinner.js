import { LitElement, html, css } from 'lit'

/**
 * Spinner — loading indicator with multiple styles.
 *
 * OLMUI pair: @nan0web/ui-cli Spinner → ui-lit Spinner
 *
 * CSS Custom Properties:
 *   --ui-spinner-color, --ui-spinner-size, --ui-spinner-width,
 *   --ui-spinner-speed
 *
 * @element ui-spinner
 * @attr {'ring'|'dots'|'pulse'} variant - Animation style
 * @attr {'sm'|'md'|'lg'} size - Spinner size
 * @attr {string} label - Accessible label text
 */
class UISpinner extends LitElement {
	static properties = {
		variant: { type: String, reflect: true },
		size: { type: String, reflect: true },
		label: { type: String },
	}

	constructor() {
		super()
		this.variant = 'ring'
		this.size = 'md'
		this.label = 'Loading...'
	}

	static styles = css`
		:host {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			--_color: var(--ui-spinner-color, var(--co, #818cf8));
			--_speed: var(--ui-spinner-speed, 0.8s);
		}

		/* Sizes */
		:host([size='sm']) {
			--_size: 1rem;
			--_width: 2px;
		}
		:host,
		:host([size='md']) {
			--_size: 1.8rem;
			--_width: 2.5px;
		}
		:host([size='lg']) {
			--_size: 3rem;
			--_width: 3px;
		}

		/* Ring variant */
		.ring {
			width: var(--_size);
			height: var(--_size);
			border: var(--_width) solid color-mix(in srgb, var(--_color) 20%, transparent);
			border-top-color: var(--_color);
			border-radius: 50%;
			animation: spin var(--_speed) linear infinite;
		}

		@keyframes spin {
			to {
				transform: rotate(360deg);
			}
		}

		/* Dots variant */
		.dots {
			display: flex;
			align-items: center;
			gap: calc(var(--_size) * 0.25);
		}

		.dot {
			width: calc(var(--_size) * 0.3);
			height: calc(var(--_size) * 0.3);
			border-radius: 50%;
			background: var(--_color);
			animation: dot-bounce var(--_speed) ease-in-out infinite;
		}

		.dot:nth-child(2) {
			animation-delay: 0.15s;
		}
		.dot:nth-child(3) {
			animation-delay: 0.3s;
		}

		@keyframes dot-bounce {
			0%,
			80%,
			100% {
				transform: scale(0.6);
				opacity: 0.4;
			}
			40% {
				transform: scale(1);
				opacity: 1;
			}
		}

		/* Pulse variant */
		.pulse {
			width: var(--_size);
			height: var(--_size);
			border-radius: 50%;
			background: var(--_color);
			animation: pulse-anim calc(var(--_speed) * 1.5) ease-out infinite;
		}

		@keyframes pulse-anim {
			0% {
				transform: scale(0.5);
				opacity: 1;
			}
			100% {
				transform: scale(1.8);
				opacity: 0;
			}
		}

		.sr-only {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			border: 0;
		}
	`

	render() {
		if (this.variant === 'dots') {
			return html`
				<div class="dots" role="status" aria-label=${this.label}>
					<div class="dot"></div>
					<div class="dot"></div>
					<div class="dot"></div>
				</div>
				<span class="sr-only">${this.label}</span>
			`
		}
		if (this.variant === 'pulse') {
			return html`
				<div class="pulse" role="status" aria-label=${this.label}></div>
				<span class="sr-only">${this.label}</span>
			`
		}
		return html`
			<div class="ring" role="status" aria-label=${this.label}></div>
			<span class="sr-only">${this.label}</span>
		`
	}
}

if (!customElements.get('ui-spinner')) {
	customElements.define('ui-spinner', UISpinner)
}

export default UISpinner
