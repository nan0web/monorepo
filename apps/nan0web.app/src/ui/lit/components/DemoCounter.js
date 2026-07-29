import { LitElement, html, css } from 'lit'

export class DemoCounter extends LitElement {
	static properties = {
		title: { type: String },
		startValue: { type: Number, attribute: 'startvalue' },
		count: { type: Number, state: true }
	}

	static styles = css`
		:host {
			display: block;
			background: var(--bg-glass, rgba(255, 255, 255, 0.03));
			border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
			padding: 1.5rem;
			border-radius: var(--radius-md, 12px);
			margin: 1.5rem 0;
			font-family: inherit;
		}
		h4 {
			margin: 0 0 0.5rem 0;
			color: var(--accent-secondary, #06b6d4);
			font-size: 1.1rem;
		}
		.counter-val {
			font-size: 2.2rem;
			font-weight: bold;
			margin: 0.5rem 0 1rem;
			font-family: var(--font-mono, 'JetBrains Mono', monospace);
			color: var(--text-primary, #f0f0f5);
		}
		button {
			background: var(--accent-gradient, linear-gradient(135deg, #7c3aed, #06b6d4));
			color: white;
			border: none;
			padding: 0.6rem 1.5rem;
			border-radius: 20px;
			cursor: pointer;
			font-weight: 600;
			font-size: 0.9rem;
			transition: background 0.2s, transform 0.1s;
		}
		button:hover {
			filter: brightness(1.1);
		}
		button:active {
			transform: scale(0.98);
		}
	`

	constructor() {
		super()
		this.title = 'Counter'
		this.startValue = 0
	}

	connectedCallback() {
		super.connectedCallback()
		if (this.count === undefined) {
			this.count = this.startValue ?? 0
		}
	}

	_increment() {
		this.count = (this.count ?? 0) + 1
	}

	render() {
		return html`
			<h4>${this.title}</h4>
			<div class="counter-val">${this.count}</div>
			<button @click=${this._increment}>+1 Incrementor</button>
		`
	}
}

customElements.define('demo-counter', DemoCounter)
