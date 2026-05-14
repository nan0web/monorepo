import { LitElement, html, css } from 'lit'

/**
 * Slider — range slider input.
 *
 * OLMUI pair: @nan0web/ui-cli Slider → ui-lit Slider
 *
 * CSS Custom Properties:
 *   --ui-slider-track-bg, --ui-slider-track-fill, --ui-slider-thumb,
 *   --ui-slider-thumb-size, --ui-slider-height
 *
 * @element ui-slider
 * @attr {string} label - Label text
 * @attr {number} value - Current value
 * @attr {number} min - Minimum value
 * @attr {number} max - Maximum value
 * @attr {number} step - Step increment
 * @attr {boolean} show-value - Show value label
 * @attr {boolean} disabled - Disabled state
 * @fires slider-change - detail: { value: number }
 */
class UISlider extends LitElement {
	static properties = {
		label: { type: String },
		value: { type: Number },
		min: { type: Number },
		max: { type: Number },
		step: { type: Number },
		showValue: { type: Boolean, attribute: 'show-value' },
		disabled: { type: Boolean, reflect: true },
	}

	constructor() {
		super()
		this.label = ''
		this.value = 50
		this.min = 0
		this.max = 100
		this.step = 1
		this.showValue = false
		this.disabled = false
	}

	static styles = css`
		:host {
			display: block;
			--_track-bg: var(--ui-slider-track-bg, rgba(255, 255, 255, 0.1));
			--_track-fill: var(--ui-slider-track-fill, var(--co, #818cf8));
			--_thumb: var(--ui-slider-thumb, #fff);
			--_thumb-size: var(--ui-slider-thumb-size, 18px);
			--_height: var(--ui-slider-height, 6px);
			--_label-color: var(--fg-dim, rgba(255, 255, 255, 0.6));
		}

		:host([disabled]) {
			opacity: 0.45;
			pointer-events: none;
		}

		.field {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}

		.label-row {
			display: flex;
			justify-content: space-between;
			align-items: baseline;
		}

		label {
			font-size: 0.82rem;
			font-weight: 600;
			color: var(--_label-color);
		}

		.value-label {
			font-size: 0.82rem;
			font-weight: 700;
			color: var(--_track-fill);
			font-variant-numeric: tabular-nums;
		}

		input[type='range'] {
			-webkit-appearance: none;
			appearance: none;
			width: 100%;
			height: var(--_height);
			background: var(--_track-bg); /* fallback */
			border-radius: 999px;
			outline: none;
			cursor: pointer;
		}

		input[type='range']::-webkit-slider-thumb {
			-webkit-appearance: none;
			width: var(--_thumb-size);
			height: var(--_thumb-size);
			border-radius: 50%;
			background: var(--_thumb);
			box-shadow:
				0 1px 4px rgba(0, 0, 0, 0.3),
				0 0 0 2px var(--_track-fill);
			cursor: grab;
			transition:
				transform 0.15s,
				box-shadow 0.15s;
		}

		input[type='range']::-webkit-slider-thumb:hover {
			transform: scale(1.15);
			box-shadow:
				0 2px 8px rgba(0, 0, 0, 0.4),
				0 0 0 3px var(--_track-fill);
		}

		input[type='range']::-webkit-slider-thumb:active {
			cursor: grabbing;
			transform: scale(1.05);
		}

		input[type='range']::-moz-range-thumb {
			width: var(--_thumb-size);
			height: var(--_thumb-size);
			border: none;
			border-radius: 50%;
			background: var(--_thumb);
			box-shadow:
				0 1px 4px rgba(0, 0, 0, 0.3),
				0 0 0 2px var(--_track-fill);
			cursor: grab;
		}

		input[type='range']:focus-visible {
			outline: 2px solid var(--_track-fill);
			outline-offset: 4px;
		}

		.range-labels {
			display: flex;
			justify-content: space-between;
			font-size: 0.72rem;
			color: var(--fg-dim, rgba(255, 255, 255, 0.35));
		}
	`

	_onInput(e) {
		this.value = Number(e.target.value)
		this.dispatchEvent(
			new CustomEvent('slider-change', {
				bubbles: true,
				composed: true,
				detail: { value: this.value },
			}),
		)
	}

	_getPercentage() {
		const range = this.max - this.min
		if (range <= 0) return 0
		return Math.max(0, Math.min(100, ((this.value - this.min) / range) * 100))
	}

	render() {
		const pct = this._getPercentage()
		return html`
			<div class="field">
				${this.label || this.showValue
					? html` <div class="label-row">
							${this.label ? html`<label>${this.label}</label>` : html`<span></span>`}
							${this.showValue ? html`<span class="value-label">${this.value}</span>` : ''}
						</div>`
					: ''}
				<input
					type="range"
					.value=${String(this.value)}
					min=${this.min}
					max=${this.max}
					step=${this.step}
					?disabled=${this.disabled}
					@input=${this._onInput}
					aria-label=${this.label || 'Slider'}
					style="background: linear-gradient(to right, var(--_track-fill) ${pct}%, var(--_track-bg) ${pct}%)"
				/>
				<div class="range-labels">
					<span>${this.min}</span>
					<span>${this.max}</span>
				</div>
			</div>
		`
	}
}

if (!customElements.get('ui-slider')) {
	customElements.define('ui-slider', UISlider)
}

export default UISlider
