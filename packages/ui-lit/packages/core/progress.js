import { LitElement, html, css } from 'lit'

/**
 * ProgressBar — determinate/indeterminate progress indicator.
 *
 * OLMUI pair: @nan0web/ui-cli ProgressBar → ui-lit ProgressBar
 *
 * CSS Custom Properties:
 *   --ui-progress-bg, --ui-progress-fill, --ui-progress-height,
 *   --ui-progress-radius, --ui-progress-label-color
 *
 * @element ui-progress
 * @attr {number} value - Current progress (0-100)
 * @attr {number} max - Maximum value (default 100)
 * @attr {boolean} indeterminate - Indeterminate mode (animated shimmer)
 * @attr {boolean} show-label - Show percentage label
 * @attr {'sm'|'md'|'lg'} size - Bar thickness
 */
class UIProgressBar extends LitElement {
	static properties = {
		value: { type: Number },
		max: { type: Number },
		indeterminate: { type: Boolean, reflect: true },
		showLabel: { type: Boolean, attribute: 'show-label' },
		size: { type: String, reflect: true },
	}

	constructor() {
		super()
		this.value = 0
		this.max = 100
		this.indeterminate = false
		this.showLabel = false
		this.size = 'md'
	}

	static styles = css`
		:host {
			display: block;
			--_bg: var(--ui-progress-bg, rgba(255, 255, 255, 0.08));
			--_fill: var(--ui-progress-fill, var(--co, #818cf8));
			--_radius: var(--ui-progress-radius, 999px);
			--_label-color: var(--ui-progress-label-color, var(--fg-dim, rgba(255, 255, 255, 0.6)));
		}

		:host([size='sm']) {
			--_height: 4px;
		}
		:host,
		:host([size='md']) {
			--_height: 8px;
		}
		:host([size='lg']) {
			--_height: 14px;
		}

		.wrapper {
			display: flex;
			align-items: center;
			gap: 0.8rem;
		}

		.track {
			flex: 1;
			height: var(--_height);
			background: var(--_bg);
			border-radius: var(--_radius);
			overflow: hidden;
			position: relative;
		}

		.fill {
			height: 100%;
			background: var(--_fill);
			border-radius: var(--_radius);
			transition: width 0.4s ease;
			position: relative;
		}

		.fill::after {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
			animation: progress-shimmer 2s ease-in-out infinite;
		}

		@keyframes progress-shimmer {
			0% {
				transform: translateX(-100%);
			}
			100% {
				transform: translateX(100%);
			}
		}

		/* Indeterminate */
		:host([indeterminate]) .fill {
			width: 40% !important;
			animation: indeterminate 1.5s ease-in-out infinite;
		}

		@keyframes indeterminate {
			0% {
				transform: translateX(-100%);
			}
			100% {
				transform: translateX(350%);
			}
		}

		.label {
			font-size: 0.78rem;
			font-weight: 600;
			color: var(--_label-color);
			min-width: 3ch;
			text-align: right;
			font-variant-numeric: tabular-nums;
		}
	`

	get _percent() {
		if (this.max <= 0) return 0
		return Math.min(100, Math.max(0, (this.value / this.max) * 100))
	}

	render() {
		const pct = this._percent
		return html`
			<div
				class="wrapper"
				role="progressbar"
				aria-valuenow=${this.indeterminate ? undefined : this.value}
				aria-valuemin="0"
				aria-valuemax=${this.max}
				aria-label="Progress"
			>
				<div class="track">
					<div class="fill" style="width: ${this.indeterminate ? '40' : pct}%"></div>
				</div>
				${this.showLabel && !this.indeterminate
					? html`<span class="label">${Math.round(pct)}%</span>`
					: ''}
			</div>
		`
	}
}

if (!customElements.get('ui-progress')) {
	customElements.define('ui-progress', UIProgressBar)
}

export default UIProgressBar
