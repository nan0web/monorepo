import { LitElement, html, css } from 'lit'
import './EditorItem.js'
import './EditorCatalog.js'

/**
 * nan0-editor-stack
 *
 * Container for recursive editor windows.
 * Subscribes to ModalStack and renders a stack of modals.
 * Handles Global Keyboard shortcuts.
 */
export class EditorStack extends LitElement {
	static properties = {
		stack: { type: Array },
		modalStack: { type: Object },
	}

	// Enable delegatesFocus for better autofocus support
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }

	static styles = css`
		:host {
			display: block;
			position: relative;
			width: 100%;
			height: 100%;
			overflow: hidden;
			background: #111;
		}
		.modal-layer {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: white;
			transition:
				transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
				opacity 0.3s ease;
			box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4);
		}
		.modal-layer:not(:last-child) {
			transform: translateX(-30px) scale(0.96);
			filter: brightness(0.6) blur(2px);
			pointer-events: none;
			opacity: 0.6;
		}
		.empty {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 100%;
			color: #aaa;
			font-family: ui-monospace, monospace;
			gap: 1.5rem;
		}
	`

	constructor() {
		super()
		this.stack = []
		this._unsubscribe = null
	}

	updated(changedProperties) {
		if (changedProperties.has('modalStack') && this.modalStack) {
			if (this._unsubscribe) this._unsubscribe()
			this._unsubscribe = this.modalStack.onChange((newStack) => {
				this.stack = [...newStack]
				this.requestUpdate()
			})
			this.stack = [...(this.modalStack.items || [])]
		}
	}

	render() {
		return html`
			${this.stack.map(
				(item, index) => html`
					<div class="modal-layer" style="z-index: ${index}">
						${typeof item.load === 'function'
							? html`
									<nan0-editor-item .model="${item}" .stack="${this.modalStack}"></nan0-editor-item>
								`
							: html`
									<nan0-editor-catalog
										.path="${item.path}"
										.items="${item.items}"
										.onSelect="${item.onSelect}"
										@close="${() => this.modalStack.pop()}"
									></nan0-editor-catalog>
								`}
					</div>
				`,
			)}
			${this.stack.length === 0
				? html`<div class="empty">NaN0 Editor — Waiting for Data</div>`
				: ''}
		`
	}
}

customElements.define('nan0-editor-stack', EditorStack)
