import { LitElement, html, css } from 'lit'

/**
 * Nav — top navigation bar with logo, links, and right-side controls.
 *
 * OLMUI pair: @nan0web/ui-react-bootstrap Nav → ui-lit Nav
 *
 * Implements sticky header with glassmorphism (per system.md requirements),
 * responsive hamburger menu for mobile, and fluid layout.
 *
 * CSS Custom Properties:
 *   --ui-nav-bg, --ui-nav-blur, --ui-nav-border, --ui-nav-height,
 *   --ui-nav-fg, --ui-nav-link-hover
 *
 * @element ui-nav
 * @prop {Object} brand - { title: string, logo?: string, url?: string }
 * @prop {Array<{label: string, url: string, children?: Array}>} items - Navigation links
 */
class UINav extends LitElement {
	static properties = {
		brand: { type: Object },
		items: { type: Array },
		_menuOpen: { type: Boolean, state: true },
	}

	constructor() {
		super()
		this.brand = null
		this.items = []
		this._menuOpen = false
	}

	_toggleMenu() {
		this._menuOpen = !this._menuOpen
	}

	static styles = css`
		:host {
			display: block;
			position: sticky;
			top: 0;
			z-index: 1000;
			--_height: var(--ui-nav-height, 60px);
			--_bg: var(--ui-nav-bg, color-mix(in srgb, var(--ba, #0f0f0f) 80%, transparent));
			--_blur: var(--ui-nav-blur, saturate(180%) blur(20px));
			--_border: var(--ui-nav-border, var(--border, rgba(255, 255, 255, 0.06)));
			--_fg: var(--ui-nav-fg, var(--fg, currentColor));
			--_link-hover: var(--ui-nav-link-hover, var(--co, #818cf8));
		}

		nav {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: var(--_height);
			padding: 0 1.5rem;
			background: var(--_bg);
			backdrop-filter: var(--_blur);
			-webkit-backdrop-filter: var(--_blur);
			border-bottom: 1px solid var(--_border);
			color: var(--_fg);
		}

		.brand {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			text-decoration: none;
			color: var(--_fg);
			font-weight: 700;
			font-size: 1.1rem;
		}

		.brand img {
			height: 28px;
			width: auto;
		}

		.links {
			display: flex;
			align-items: center;
			gap: 0.3rem;
			list-style: none;
			margin: 0;
			padding: 0;
		}

		.links a {
			display: inline-flex;
			align-items: center;
			padding: 0.4em 0.8em;
			border-radius: var(--ra-md, 8px);
			text-decoration: none;
			color: var(--_fg);
			font-size: 0.9rem;
			font-weight: 500;
			transition:
				color 0.2s,
				background 0.2s;
		}

		.links a:hover {
			color: var(--_link-hover);
			background: color-mix(in srgb, var(--_link-hover) 10%, transparent);
		}

		.right-slot {
			display: flex;
			align-items: center;
			gap: 0.3rem;
		}

		/* Hamburger button (mobile) */
		.hamburger {
			display: none;
			all: unset;
			cursor: pointer;
			width: 44px;
			height: 44px;
			align-items: center;
			justify-content: center;
			color: var(--_fg);
			border-radius: var(--ra-md, 8px);
		}

		.hamburger:hover {
			background: color-mix(in srgb, var(--_link-hover) 10%, transparent);
		}

		.hamburger svg {
			width: 24px;
			height: 24px;
			fill: currentColor;
		}

		/* Mobile menu */
		.mobile-menu {
			display: none;
			position: fixed;
			top: var(--_height);
			left: 0;
			right: 0;
			bottom: 0;
			background: var(--ba, #0f0f0f);
			padding: 1rem;
			z-index: 999;
			overflow-y: auto;
			animation: fade-in 0.2s ease-out;
		}

		.mobile-menu.open {
			display: block;
		}

		.mobile-menu a {
			display: block;
			padding: 0.8em 1em;
			border-radius: var(--ra-md, 8px);
			text-decoration: none;
			color: var(--_fg);
			font-size: 1rem;
			font-weight: 500;
			min-height: 44px;
			display: flex;
			align-items: center;
			transition: background 0.15s;
		}

		.mobile-menu a:hover {
			background: color-mix(in srgb, var(--_link-hover) 10%, transparent);
		}

		@keyframes fade-in {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}

		@media (max-width: 768px) {
			.links {
				display: none;
			}
			.hamburger {
				display: inline-flex;
			}
		}
	`

	_renderLink(item) {
		return html`<a href=${item.url || '#'}>${item.label || item.title}</a>`
	}

	render() {
		return html`
			<nav>
				${this.brand
					? html`<a class="brand" href=${this.brand.url || '/'}>
							${this.brand.logo
								? html`<img src=${this.brand.logo} alt=${this.brand.title || ''} />`
								: ''}
							${this.brand.title || ''}
						</a>`
					: html`<span></span>`}

				<div class="links">${(this.items || []).map((item) => this._renderLink(item))}</div>

				<div class="right-slot">
					<slot></slot>
					<button class="hamburger" @click=${this._toggleMenu} aria-label="Toggle menu">
						<svg viewBox="0 0 24 24">
							${this._menuOpen
								? html`<path
										d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
									/>`
								: html`<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />`}
						</svg>
					</button>
				</div>
			</nav>

			<div class="mobile-menu ${this._menuOpen ? 'open' : ''}">
				${(this.items || []).map((item) => this._renderLink(item))}
			</div>
		`
	}
}

if (!customElements.get('ui-nav')) {
	customElements.define('ui-nav', UINav)
}

export default UINav
