import { LitElement, html, css } from 'lit'

/**
 * Page — responsive documentation page layout (nav + sidebar + content).
 *
 * OLMUI pair: @nan0web/ui-react-bootstrap Blocks.Page → ui-lit Page
 *
 * CSS Custom Properties:
 *   --ui-page-bg, --ui-page-max-width, --ui-page-sidebar-width,
 *   --ui-page-content-padding, --ui-page-gap
 *
 * @element ui-page
 * @attr {string} title - Page title
 * @slot nav - Navigation bar slot
 * @slot sidebar - Sidebar slot
 * @slot - Default slot for main content
 * @slot footer - Footer slot
 */
class UIPage extends LitElement {
	static properties = {
		title: { type: String },
		_sidebarOpen: { type: Boolean, state: true },
	}

	constructor() {
		super()
		this.title = ''
		this._sidebarOpen = false
	}

	static styles = css`
		:host {
			display: block;
			min-height: 100vh;
			--_bg: var(--ui-page-bg, var(--ba, #0f0f0f));
			--_max-w: var(--ui-page-max-width, 1400px);
			--_sidebar-w: var(--ui-page-sidebar-width, 260px);
			--_padding: var(--ui-page-content-padding, 2rem);
			--_gap: var(--ui-page-gap, 0);
			background: var(--_bg);
			color: var(--fg, currentColor);
		}

		.layout {
			display: flex;
			min-height: calc(100vh - var(--ui-nav-height, 60px));
		}

		.sidebar-area {
			width: var(--_sidebar-w);
			flex-shrink: 0;
			position: sticky;
			top: var(--ui-nav-height, 60px);
			height: calc(100vh - var(--ui-nav-height, 60px));
			overflow-y: auto;
		}

		.content-area {
			flex: 1;
			min-width: 0;
			max-width: var(--_max-w);
			padding: var(--_padding);
		}

		.footer-area {
			border-top: 1px solid var(--border, rgba(255, 255, 255, 0.06));
		}

		/* Mobile sidebar toggle */
		.sidebar-toggle {
			display: none;
			all: unset;
			position: fixed;
			bottom: 1.5rem;
			right: 1.5rem;
			z-index: 1001;
			width: 44px;
			height: 44px;
			border-radius: 50%;
			background: var(--co, #818cf8);
			color: var(--co-on, #fff);
			cursor: pointer;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		}

		.sidebar-toggle svg {
			width: 20px;
			height: 20px;
			fill: currentColor;
		}

		@media (max-width: 768px) {
			.sidebar-area {
				position: fixed;
				top: var(--ui-nav-height, 60px);
				left: 0;
				bottom: 0;
				z-index: 999;
				background: var(--_bg);
				transform: translateX(-100%);
				transition: transform 0.3s ease;
				width: min(var(--_sidebar-w), 85vw);
				box-shadow: 4px 0 16px rgba(0, 0, 0, 0.3);
			}

			.sidebar-area.open {
				transform: translateX(0);
			}

			.sidebar-toggle {
				display: inline-flex;
			}

			.content-area {
				padding: 1rem;
			}
		}
	`

	_toggleSidebar() {
		this._sidebarOpen = !this._sidebarOpen
	}

	render() {
		return html`
			<slot name="nav"></slot>
			<div class="layout">
				<div class="sidebar-area ${this._sidebarOpen ? 'open' : ''}">
					<slot name="sidebar"></slot>
				</div>
				<main class="content-area">
					<slot></slot>
				</main>
			</div>
			<div class="footer-area">
				<slot name="footer"></slot>
			</div>
			<button class="sidebar-toggle" @click=${this._toggleSidebar} aria-label="Toggle sidebar">
				<svg viewBox="0 0 24 24">
					<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
				</svg>
			</button>
		`
	}
}

if (!customElements.get('ui-page')) {
	customElements.define('ui-page', UIPage)
}

export default UIPage
