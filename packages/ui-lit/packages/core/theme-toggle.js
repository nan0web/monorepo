import { LitElement, html, css } from 'lit'

/**
 * ThemeToggle — Light/Dark mode toggle button.
 *
 * OLMUI pair: @nan0web/ui-react-bootstrap ThemeToggle → ui-lit ThemeToggle
 *
 * Persists theme in localStorage ('ui-theme') and sets `data-theme` on
 * `document.documentElement` to 'light' or 'dark'.
 * Reads synchronously on construct to avoid flash of unstyled content.
 *
 * CSS Custom Properties:
 *   --ui-toggle-size, --ui-toggle-color, --ui-toggle-hover
 *
 * @element ui-theme-toggle
 * @fires theme-change - Dispatched when theme changes, detail: { theme: 'light'|'dark' }
 */
class UIThemeToggle extends LitElement {
	static properties = {
		theme: { type: String, reflect: true },
	}

	constructor() {
		super()
		this.theme = this._loadTheme()
		this._applyTheme()
	}

	/** @returns {'light'|'dark'} */
	_loadTheme() {
		try {
			const saved = localStorage.getItem('ui-theme')
			if (saved === 'dark' || saved === 'light') return saved
		} catch (_) {
			/* SSR / restricted */
		}

		if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches) {
			return 'dark'
		}
		return 'light'
	}

	_applyTheme() {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', this.theme)
		}
	}

	_toggle() {
		this.theme = this.theme === 'dark' ? 'light' : 'dark'
		try {
			localStorage.setItem('ui-theme', this.theme)
		} catch (_) {
			/* */
		}
		this._applyTheme()
		this.dispatchEvent(
			new CustomEvent('theme-change', {
				bubbles: true,
				composed: true,
				detail: { theme: this.theme },
			}),
		)
	}

	static styles = css`
		:host {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			--_size: var(--ui-toggle-size, 2.4rem);
			--_color: var(--ui-toggle-color, var(--fg, currentColor));
			--_hover: var(--ui-toggle-hover, var(--co, #818cf8));
		}

		button {
			all: unset;
			cursor: pointer;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: var(--_size);
			height: var(--_size);
			border-radius: var(--ra-md, 8px);
			color: var(--_color);
			transition:
				color 0.2s,
				background 0.2s;
		}

		button:hover {
			color: var(--_hover);
			background: color-mix(in srgb, var(--_hover) 12%, transparent);
		}

		button:focus-visible {
			outline: 2px solid var(--_hover);
			outline-offset: 2px;
		}

		svg {
			width: 1.25em;
			height: 1.25em;
			fill: currentColor;
		}
	`

	/** Sun icon (shown in dark mode → click to go light) */
	get _sunIcon() {
		return html`<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85 1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z"
			/>
		</svg>`
	}

	/** Moon icon (shown in light mode → click to go dark) */
	get _moonIcon() {
		return html`<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M10 7a7 7 0 0 0 12 4.9v.1c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2h.1A6.979 6.979 0 0 0 10 7zm-6 5a8 8 0 0 0 15.062 3.762A9 9 0 0 1 8.238 4.938 7.999 7.999 0 0 0 4 12z"
			/>
		</svg>`
	}

	render() {
		const isDark = this.theme === 'dark'
		return html`
			<button
				@click=${this._toggle}
				title=${isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
				aria-label="Toggle theme"
			>
				${isDark ? this._sunIcon : this._moonIcon}
			</button>
		`
	}
}

if (!customElements.get('ui-theme-toggle')) {
	customElements.define('ui-theme-toggle', UIThemeToggle)
}

export default UIThemeToggle
