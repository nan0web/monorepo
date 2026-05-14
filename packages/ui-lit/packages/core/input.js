import { LitElement, html, css } from 'lit'

/**
 * Input — text input field with label, placeholder, and validation.
 *
 * OLMUI pair: @nan0web/ui-cli Input → ui-react-bootstrap Input → ui-lit Input
 *
 * CSS Custom Properties:
 *   --ui-input-bg, --ui-input-fg, --ui-input-border, --ui-input-focus,
 *   --ui-input-radius, --ui-input-font, --ui-input-label-color,
 *   --ui-input-placeholder, --ui-input-error, --ui-input-success
 *
 * @element ui-input
 * @attr {string} label - Label text
 * @attr {string} placeholder - Placeholder text
 * @attr {string} value - Current value
 * @attr {'text'|'password'|'email'|'number'|'search'|'url'|'tel'} type - Input type
 * @attr {boolean} disabled - Disabled state
 * @attr {boolean} required - Required field
 * @attr {'error'|'success'|''} state - Validation state
 * @attr {string} hint - Helper/error text below input
 * @fires input-change - detail: { value: string }
 */
class UIInput extends LitElement {
	static properties = {
		label: { type: String },
		placeholder: { type: String },
		value: { type: String },
		type: { type: String },
		disabled: { type: Boolean, reflect: true },
		required: { type: Boolean },
		state: { type: String, reflect: true },
		hint: { type: String },
	}

	constructor() {
		super()
		this.label = ''
		this.placeholder = ''
		this.value = ''
		this.type = 'text'
		this.disabled = false
		this.required = false
		this.state = ''
		this.hint = ''
	}

	static styles = css`
		:host {
			display: block;
			--_bg: var(--ui-input-bg, var(--ba-surface, rgba(255, 255, 255, 0.05)));
			--_fg: var(--ui-input-fg, var(--fg, currentColor));
			--_border: var(--ui-input-border, var(--border, rgba(255, 255, 255, 0.12)));
			--_focus: var(--ui-input-focus, var(--co, #818cf8));
			--_radius: var(--ui-input-radius, var(--ra-md, 8px));
			--_font: var(--ui-input-font, inherit);
			--_label-color: var(--ui-input-label-color, var(--fg-dim, rgba(255, 255, 255, 0.6)));
			--_placeholder: var(--ui-input-placeholder, var(--fg-dim, rgba(255, 255, 255, 0.3)));
			--_error: var(--ui-input-error, var(--co-danger, #ef4444));
			--_success: var(--ui-input-success, var(--co-success, #22c55e));
		}

		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}

		.field {
			display: flex;
			flex-direction: column;
			gap: 0.4rem;
		}

		label {
			font-size: 0.82rem;
			font-weight: 600;
			color: var(--_label-color);
			letter-spacing: 0.02em;
		}

		input {
			all: unset;
			box-sizing: border-box;
			width: 100%;
			padding: 0.65em 0.9em;
			background: var(--_bg);
			color: var(--_fg);
			font-family: var(--_font);
			font-size: 0.9rem;
			border: 1.5px solid var(--_border);
			border-radius: var(--_radius);
			transition:
				border-color 0.2s,
				box-shadow 0.2s;
		}

		input::placeholder {
			color: var(--_placeholder);
		}

		input:focus {
			border-color: var(--_focus);
			box-shadow: 0 0 0 3px color-mix(in srgb, var(--_focus) 20%, transparent);
		}

		:host([state='error']) input {
			border-color: var(--_error);
		}

		:host([state='error']) input:focus {
			box-shadow: 0 0 0 3px color-mix(in srgb, var(--_error) 20%, transparent);
		}

		:host([state='success']) input {
			border-color: var(--_success);
		}

		:host([state='success']) input:focus {
			box-shadow: 0 0 0 3px color-mix(in srgb, var(--_success) 20%, transparent);
		}

		.hint {
			font-size: 0.78rem;
			color: var(--_label-color);
			margin-top: 0.1rem;
		}

		:host([state='error']) .hint {
			color: var(--_error);
		}

		:host([state='success']) .hint {
			color: var(--_success);
		}
	`

	_onInput(e) {
		this.value = e.target.value
		this.dispatchEvent(
			new CustomEvent('input-change', {
				bubbles: true,
				composed: true,
				detail: { value: this.value },
			}),
		)
	}

	render() {
		return html`
			<div class="field">
				${this.label
					? html`<label
							>${this.label}${this.required
								? html` <span style="color:var(--_error)">*</span>`
								: ''}</label
						>`
					: ''}
				<input
					type=${this.type}
					.value=${this.value}
					placeholder=${this.placeholder}
					?disabled=${this.disabled}
					?required=${this.required}
					@input=${this._onInput}
					aria-label=${this.label || this.placeholder || 'Input'}
				/>
				${this.hint ? html`<div class="hint">${this.hint}</div>` : ''}
			</div>
		`
	}
}

if (!customElements.get('ui-input')) {
	customElements.define('ui-input', UIInput)
}

export default UIInput
