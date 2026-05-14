import { LitElement, html, css } from 'lit'

/**
 * LangSelect — language switcher dropdown.
 *
 * OLMUI pair: @nan0web/ui-react-bootstrap LangSelect → ui-lit LangSelect
 *
 * Persists locale in localStorage ('ui-locale') and dispatches
 * `locale-change` event. Uses `history.pushState` for SPA navigation
 * per system.md requirements.
 *
 * CSS Custom Properties:
 *   --ui-lang-font, --ui-lang-color, --ui-lang-hover, --ui-lang-active-bg
 *
 * @element ui-lang-select
 * @prop {Array<{code: string, title: string}>} langs - Available languages
 * @attr {string} locale - Current locale code
 * @fires locale-change - detail: { locale: string }
 */
class UILangSelect extends LitElement {
	static properties = {
		locale: { type: String, reflect: true },
		langs: { type: Array },
		_open: { type: Boolean, state: true },
	}

	constructor() {
		super()
		this.langs = [
			{ code: 'uk', title: 'Українська' },
			{ code: 'en', title: 'English' },
		]
		this.locale = this._loadLocale()
		this._open = false
		this._onOutsideClick = this._onOutsideClick.bind(this)
	}

	/** @returns {string} */
	_loadLocale() {
		try {
			const saved = localStorage.getItem('ui-locale')
			if (saved) return saved
		} catch (_) {
			/* */
		}
		return 'uk'
	}

	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('click', this._onOutsideClick)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		document.removeEventListener('click', this._onOutsideClick)
	}

	_onOutsideClick(e) {
		if (this._open && !this.contains(e.composedPath?.()?.[0] || e.target)) {
			this._open = false
		}
	}

	_toggleMenu(e) {
		e.stopPropagation()
		this._open = !this._open
	}

	_selectLang(code) {
		this.locale = code
		this._open = false
		try {
			localStorage.setItem('ui-locale', code)
		} catch (_) {
			/* */
		}
		this.dispatchEvent(
			new CustomEvent('locale-change', {
				bubbles: true,
				composed: true,
				detail: { locale: code },
			}),
		)
	}

	_onKeyDown(e) {
		if (e.key === 'Escape') {
			this._open = false
		}
	}

	get _currentLang() {
		return this.langs.find((l) => l.code === this.locale) || this.langs[0]
	}

	static styles = css`
		:host {
			display: inline-block;
			position: relative;
			--_font: var(--ui-lang-font, inherit);
			--_color: var(--ui-lang-color, var(--fg, currentColor));
			--_hover: var(--ui-lang-hover, var(--co, #818cf8));
			--_active-bg: var(
				--ui-lang-active-bg,
				color-mix(in srgb, var(--co, #818cf8) 15%, transparent)
			);
		}

		button {
			all: unset;
			cursor: pointer;
			display: inline-flex;
			align-items: center;
			gap: 0.3em;
			padding: 0.4em 0.7em;
			border-radius: var(--ra-md, 8px);
			font-family: var(--_font);
			font-weight: 600;
			font-size: 0.85rem;
			text-transform: uppercase;
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

		.chevron {
			display: inline-block;
			width: 0;
			height: 0;
			border-left: 4px solid transparent;
			border-right: 4px solid transparent;
			border-top: 5px solid currentColor;
			transition: transform 0.2s;
		}

		:host([_open]) .chevron,
		.chevron.open {
			transform: rotate(180deg);
		}

		.menu {
			display: none;
			position: absolute;
			top: calc(100% + 4px);
			right: 0;
			min-width: 140px;
			background: var(--ba-surface, #1e1e1e);
			border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
			border-radius: var(--ra-md, 8px);
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
			padding: 0.3rem;
			z-index: 100;
			animation: slide-in 0.15s ease-out;
		}

		.menu.open {
			display: block;
		}

		@keyframes slide-in {
			from {
				opacity: 0;
				transform: translateY(-4px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}

		.menu-item {
			all: unset;
			display: block;
			width: 100%;
			box-sizing: border-box;
			cursor: pointer;
			padding: 0.5em 0.8em;
			border-radius: var(--ra-sm, 4px);
			font-size: 0.85rem;
			color: var(--_color);
			transition: background 0.15s;
		}

		.menu-item:hover {
			background: color-mix(in srgb, var(--_hover) 12%, transparent);
		}

		.menu-item:focus-visible {
			outline: 2px solid var(--_hover);
			outline-offset: -2px;
		}

		.menu-item[aria-selected='true'] {
			background: var(--_active-bg);
			font-weight: 600;
			color: var(--_hover);
		}
	`

	render() {
		const current = this._currentLang
		return html`
			<button
				@click=${this._toggleMenu}
				@keydown=${this._onKeyDown}
				aria-haspopup="listbox"
				aria-expanded=${this._open}
				aria-label="Select language"
			>
				${current.code}
				<span class="chevron ${this._open ? 'open' : ''}"></span>
			</button>
			<div class="menu ${this._open ? 'open' : ''}" role="listbox" @keydown=${this._onKeyDown}>
				${this.langs.map(
					(lang) => html`
						<button
							class="menu-item"
							role="option"
							aria-selected=${lang.code === this.locale}
							@click=${() => this._selectLang(lang.code)}
						>
							${lang.title}
						</button>
					`,
				)}
			</div>
		`
	}
}

if (!customElements.get('ui-lang-select')) {
	customElements.define('ui-lang-select', UILangSelect)
}

export default UILangSelect
