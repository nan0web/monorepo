// @ts-nocheck
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import '@nan0web/ui-lit/core' // Imports UIInput, UIButton, UIForm

@customElement('auth-login-form')
export class AuthLoginForm extends LitElement {
	@property({ type: String }) actionUrl = '/api/auth/login'
	@state() error = ''

	createRenderRoot() {
		// Use light DOM or standard Shadow DOM
		return this
	}

	async handleSubmit(e) {
		e.preventDefault()
		this.error = ''
		const form = e.target
		const data = new FormData(form)
		const body = Object.fromEntries(data.entries())

		try {
			const res = await fetch(this.actionUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})

			const result = await res.json()

			if (!res.ok) {
				this.error = result.message || 'Login failed'
				return
			}

			this.dispatchEvent(new CustomEvent('login-success', { detail: result, bubbles: true }))
		} catch (err) {
			this.error = 'Network error occurred'
		}
	}

	render() {
		return html`
			<ui-card>
				<form @submit=${this.handleSubmit} class="flex flex-col gap-4 p-4">
					<h2 class="text-xl font-bold mb-4">Login</h2>

					${this.error ? html`<ui-alert variant="danger">${this.error}</ui-alert>` : ''}

					<ui-input name="identifier" label="Username or Email" required></ui-input>
					<ui-input name="password" type="password" label="Password" required></ui-input>

					<ui-button type="submit" variant="primary">Access Portal</ui-button>
				</form>
			</ui-card>
		`
	}
}
