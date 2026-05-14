import { LitElement, html, css } from 'lit'

/**
 * Form — auto-generating form wrapper.
 *
 * Accepts a `fields` array and renders the appropriate ui-* components.
 * Collects values into a reactive `values` object.
 * Supports submit with validation state.
 *
 * OLMUI pair: @nan0web/ui-react Form → ui-lit Form
 *
 * CSS Custom Properties:
 *   --ui-form-gap, --ui-form-max-width, --ui-form-bg, --ui-form-padding,
 *   --ui-form-radius, --ui-form-border
 *
 * @element ui-form
 * @prop {Array<FormField>} fields - Field definitions
 * @attr {string} submit-label - Submit button text
 * @attr {boolean} disabled - Disable all fields
 * @attr {boolean} loading - Show loading state on submit
 * @fires form-submit - detail: { values: Object }
 * @fires form-change - detail: { name: string, value: any, values: Object }
 *
 * @typedef {Object} FormField
 * @property {string} name - Field name (key in values)
 * @property {'input'|'select'|'toggle'|'slider'|'autocomplete'} type - Component type
 * @property {string} [label] - Field label
 * @property {string} [placeholder] - Placeholder text
 * @property {string} [hint] - Helper text
 * @property {string} [inputType] - For input: text, email, password, number, etc.
 * @property {boolean} [required] - Required field
 * @property {*} [value] - Default value
 * @property {Array} [options] - For select/autocomplete
 * @property {number} [min] - For slider
 * @property {number} [max] - For slider
 * @property {number} [step] - For slider
 * @property {boolean} [showValue] - For slider
 */
class UIForm extends LitElement {
	static properties = {
		fields: { type: Array },
		submitLabel: { type: String, attribute: 'submit-label' },
		disabled: { type: Boolean, reflect: true },
		loading: { type: Boolean, reflect: true },
		_values: { type: Object, state: true },
		_errors: { type: Object, state: true },
	}

	constructor() {
		super()
		/** @type {FormField[]} */
		this.fields = []
		this.submitLabel = ''
		this.disabled = false
		this.loading = false
		this._values = {}
		this._errors = {}
	}

	/** @returns {Object} Current form values */
	get values() {
		return { ...this._values }
	}

	/** Set form values programmatically */
	set values(v) {
		this._values = { ...v }
	}

	updated(changed) {
		if (changed.has('fields') && this.fields) {
			// Initialize defaults from field definitions
			const vals = { ...this._values }
			for (const f of this.fields) {
				if (f.name && vals[f.name] === undefined && f.value !== undefined) {
					vals[f.name] = f.value
				}
			}
			this._values = vals
		}
	}

	static styles = css`
		:host {
			display: block;
			--_gap: var(--ui-form-gap, 1.2rem);
			--_max-width: var(--ui-form-max-width, 100%);
			--_bg: var(--ui-form-bg, transparent);
			--_padding: var(--ui-form-padding, 0);
			--_radius: var(--ui-form-radius, 0);
			--_border: var(--ui-form-border, none);
		}

		:host([disabled]) {
			opacity: 0.6;
			pointer-events: none;
		}

		.form {
			display: flex;
			flex-direction: column;
			gap: var(--_gap);
			max-width: var(--_max-width);
			background: var(--_bg);
			padding: var(--_padding);
			border-radius: var(--_radius);
			border: var(--_border);
		}

		.actions {
			display: flex;
			gap: 0.8rem;
			align-items: center;
			margin-top: 0.4rem;
		}
	`

	_setValue(name, value) {
		this._values = { ...this._values, [name]: value }
		// Clear error for this field on change
		if (this._errors[name]) {
			const e = { ...this._errors }
			delete e[name]
			this._errors = e
		}
		this.dispatchEvent(
			new CustomEvent('form-change', {
				bubbles: true,
				composed: true,
				detail: { name, value, values: this.values },
			}),
		)
	}

	_onSubmit(e) {
		e?.preventDefault?.()
		if (this.disabled || this.loading) return

		// Basic required validation
		const errors = {}
		for (const f of this.fields) {
			if (f.required) {
				const val = this._values[f.name]
				if (val === undefined || val === null || val === '') {
					errors[f.name] = "Обов'язкове поле"
				}
			}
		}

		if (Object.keys(errors).length > 0) {
			this._errors = errors
			return
		}

		this.dispatchEvent(
			new CustomEvent('form-submit', {
				bubbles: true,
				composed: true,
				detail: { values: this.values },
			}),
		)
	}

	_renderField(field) {
		const val = this._values[field.name]
		const error = this._errors[field.name]

		switch (field.type) {
			case 'input':
				return html`
					<ui-input
						label=${field.label || ''}
						placeholder=${field.placeholder || ''}
						.value=${val || ''}
						type=${field.inputType || 'text'}
						?required=${field.required}
						?disabled=${this.disabled}
						hint=${error || field.hint || ''}
						state=${error ? 'error' : ''}
						@input-change=${(e) => this._setValue(field.name, e.detail.value)}
					></ui-input>
				`

			case 'select':
				return html`
					<ui-select
						label=${field.label || ''}
						placeholder=${field.placeholder || 'Оберіть...'}
						.value=${val || ''}
						.options=${field.options || []}
						?disabled=${this.disabled}
						@select-change=${(e) => this._setValue(field.name, e.detail.value)}
					></ui-select>
				`

			case 'toggle':
				return html`
					<ui-toggle
						label=${field.label || ''}
						?checked=${!!val}
						?disabled=${this.disabled}
						@toggle-change=${(e) => this._setValue(field.name, e.detail.checked)}
					></ui-toggle>
				`

			case 'slider':
				return html`
					<ui-slider
						label=${field.label || ''}
						.value=${val ?? field.value ?? 50}
						min=${field.min ?? 0}
						max=${field.max ?? 100}
						step=${field.step ?? 1}
						?show-value=${field.showValue !== false}
						?disabled=${this.disabled}
						@slider-change=${(e) => this._setValue(field.name, e.detail.value)}
					></ui-slider>
				`

			case 'autocomplete':
				return html`
					<ui-autocomplete
						label=${field.label || ''}
						placeholder=${field.placeholder || ''}
						.value=${val || ''}
						.options=${field.options || []}
						hint=${error || field.hint || ''}
						?disabled=${this.disabled}
						@autocomplete-change=${(e) => this._setValue(field.name, e.detail.value)}
					></ui-autocomplete>
				`

			default:
				return html`<div>Unknown field type: ${field.type}</div>`
		}
	}

	render() {
		return html`
			<div class="form" role="form" @submit=${this._onSubmit}>
				${(this.fields || []).map((f) => this._renderField(f))}
				${this.submitLabel
					? html`
							<div class="actions">
								<ui-button
									label=${this.submitLabel}
									variant="primary"
									?loading=${this.loading}
									?disabled=${this.disabled}
									@btn-click=${this._onSubmit}
								></ui-button>
								<slot name="actions"></slot>
							</div>
						`
					: ''}
				<slot></slot>
			</div>
		`
	}
}

if (!customElements.get('ui-form')) {
	customElements.define('ui-form', UIForm)
}

export default UIForm
