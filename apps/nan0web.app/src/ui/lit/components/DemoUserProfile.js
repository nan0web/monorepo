import { LitElement, html, css } from 'lit'

export class DemoUserProfile extends LitElement {
	static properties = {
		name: { type: String },
		role: { type: String },
		status: { type: String }
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
		.card {
			display: flex;
			align-items: center;
			gap: 1rem;
		}
		.avatar {
			width: 48px;
			height: 48px;
			border-radius: 50%;
			background: var(--accent-gradient, linear-gradient(135deg, #7c3aed, #06b6d4));
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
			font-size: 1.2rem;
			color: white;
		}
		.details {
			display: flex;
			flex-direction: column;
		}
		.name {
			font-weight: 600;
			font-size: 1.1rem;
			color: var(--text-primary, #f0f0f5);
		}
		.role {
			font-size: 0.85rem;
			color: var(--text-secondary, #a0a0b8);
		}
		.status-badge {
			display: inline-flex;
			align-items: center;
			gap: 0.4rem;
			font-size: 0.75rem;
			margin-top: 0.25rem;
			color: var(--text-muted, #6b6b80);
		}
		.dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: #22c55e;
			box-shadow: 0 0 6px #22c55e;
		}
		.dot.offline {
			background: var(--text-muted, #6b6b80);
			box-shadow: none;
		}
	`

	render() {
		const initial = this.name ? this.name.charAt(0).toUpperCase() : '?'
		const isOnline = this.status === 'online'

		return html`
			<div class="card">
				<div class="avatar">${initial}</div>
				<div class="details">
					<div class="name">${this.name || 'Anonymous'}</div>
					<div class="role">${this.role || 'Guest'}</div>
					<div class="status-badge">
						<span class="dot ${isOnline ? 'online' : 'offline'}"></span>
						<span>${this.status || 'unknown'}</span>
					</div>
				</div>
			</div>
		`
	}
}

customElements.define('demo-userprofile', DemoUserProfile)
