/**
 * <olmui-inspector> — Universal CSS Variable Inspector (Vanilla Web Component)
 *
 * Parity with @nan0web/ui-react-bootstrap OlmuiInspector.jsx:
 *   ✅ Collapsible panel (toggle ⚙️ button)
 *   ✅ Undo history (stack of 50, counter badge)
 *   ✅ 2-step Reset confirmation ("Скинути?" → "Так / ✕")
 *   ✅ Export modal with CSS + JSON toggle
 *   ✅ localStorage persistence per component-id
 *   ✅ Live CSS variable injection on :root
 *   ✅ Grouped fields with <details> sections
 *   ✅ Controls: size (range + unit), color (picker), string (text input)
 *
 * Usage:
 *   <olmui-inspector component-id="nav" schema='[...]'></olmui-inspector>
 *
 * Schema format (JSON array):
 *   [{ name, label, type, default, group?, min?, max?, step?, units? }]
 *
 * @element olmui-inspector
 */
class OlmuiInspector extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
		this._schema = []
		this._componentId = 'general'
		this._values = {}
		this._defaults = {}
		this._history = [] // undo stack (max 50)
		this._collapsed = true // panel starts collapsed
		this._showResetConfirm = false
		this._showExportModal = false
		this._exportFormat = 'css' // 'css' | 'json'
		this._exportCopied = false
	}

	static get observedAttributes() {
		return ['component-id', 'schema']
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if (name === 'component-id') this._componentId = newVal
		if (name === 'schema') {
			try {
				this._schema = JSON.parse(newVal)
			} catch {
				this._schema = []
			}
		}
		this._initValues()
		this._render()
	}

	connectedCallback() {
		this._initValues()
		this._render()
	}

	// ═══════════════════════════════════════════════════════
	// State management
	// ═══════════════════════════════════════════════════════

	get _storageKey() {
		return `olmui:inspector:${this._componentId}`
	}

	_initValues() {
		// Build defaults map
		this._defaults = {}
		for (const f of this._schema) this._defaults[f.name] = f.default

		// Load from localStorage or fall back to defaults
		try {
			const saved = localStorage.getItem(this._storageKey)
			if (saved) {
				this._values = { ...this._defaults, ...JSON.parse(saved) }
			} else {
				this._values = { ...this._defaults }
			}
		} catch {
			this._values = { ...this._defaults }
		}
		this._applyAll()
	}

	_saveToStorage() {
		try {
			localStorage.setItem(this._storageKey, JSON.stringify(this._values))
		} catch {}
	}

	_pushHistory() {
		this._history.push({ ...this._values })
		if (this._history.length > 50) this._history.shift()
	}

	_change(name, value) {
		this._pushHistory()
		this._values[name] = value
		this._saveToStorage()
		document.documentElement.style.setProperty(`--${name}`, value)
		this._render()
	}

	_undo() {
		if (!this._history.length) return
		this._values = this._history.pop()
		this._saveToStorage()
		this._applyAll()
		this._render()
	}

	_resetAll() {
		this._history = []
		this._values = { ...this._defaults }
		localStorage.removeItem(this._storageKey)
		// Remove custom properties so browser falls back to component defaults
		for (const f of this._schema) document.documentElement.style.removeProperty(`--${f.name}`)
		this._showResetConfirm = false
		this._render()
	}

	_applyAll() {
		for (const [k, v] of Object.entries(this._values)) {
			document.documentElement.style.setProperty(`--${k}`, v)
		}
	}

	// ═══════════════════════════════════════════════════════
	// Export
	// ═══════════════════════════════════════════════════════

	_generateCss() {
		const lines = Object.entries(this._values)
			.map(([k, v]) => `\t--${k}: ${v};`)
			.join('\n')
		return `:root {\n${lines}\n}`
	}

	_generateJson() {
		return JSON.stringify(this._values, null, 2)
	}

	_copyExport() {
		const text = this._exportFormat === 'css' ? this._generateCss() : this._generateJson()
		navigator.clipboard.writeText(text).then(() => {
			this._exportCopied = true
			this._render()
			setTimeout(() => {
				this._exportCopied = false
				this._render()
			}, 2000)
		})
	}

	// ═══════════════════════════════════════════════════════
	// Helpers
	// ═══════════════════════════════════════════════════════

	_esc(s) {
		return String(s)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
	}

	_rgbToHex(s) {
		if (String(s).startsWith('#')) return String(s).substring(0, 7)
		const m = String(s).match(/\d+/g)
		if (!m || m.length < 3) return '#000000'
		return '#' + [m[0], m[1], m[2]].map((v) => parseInt(v).toString(16).padStart(2, '0')).join('')
	}

	_parseSize(v) {
		const m = String(v).match(/^([0-9]*\.?[0-9]+)\s*(rem|px|em|%|vh|vw)?$/)
		return m ? { num: parseFloat(m[1]), unit: m[2] || 'px' } : { num: 0, unit: 'px' }
	}

	_groupFields() {
		const groups = new Map()
		for (const f of this._schema) {
			const g = f.group || '🎨 Загальне'
			if (!groups.has(g)) groups.set(g, [])
			groups.get(g).push(f)
		}
		return groups
	}

	// ═══════════════════════════════════════════════════════
	// Render
	// ═══════════════════════════════════════════════════════

	_render() {
		if (!this._schema.length) {
			this.shadowRoot.innerHTML = ''
			return
		}

		const fieldCount = this._schema.length
		const historyCount = this._history.length

		// ── Toggle button (always visible) ──
		let html = `
			<div class="toggle-bar">
				<button class="toggle-btn ${this._collapsed ? '' : 'active'}" id="btn-toggle">
					<span>⚙️</span>
					<span class="toggle-label">${this._collapsed ? 'Налаштування OLMUI' : 'Сховати панель'}</span>
					<span class="toggle-arrow">${this._collapsed ? '▼' : '▲'}</span>
				</button>
			</div>
		`

		// ── Panel (only when expanded) ──
		if (!this._collapsed) {
			// Header bar
			html += `<div class="panel">
				<div class="panel-header">
					<strong>⚙️ ${this._esc(this._componentId)} Inspector (${fieldCount} vars)</strong>
					<div class="header-actions">`

			// Undo
			html += `<button class="btn-action btn-undo" id="btn-undo" ${historyCount === 0 ? 'disabled' : ''}>
				↩️ Undo (${historyCount})
			</button>`

			// Reset (2-step)
			if (this._showResetConfirm) {
				html += `<span class="reset-confirm">
					<span class="reset-label">Скинути?</span>
					<button class="btn-action btn-danger-sm" id="btn-reset-yes">✓ Так</button>
					<button class="btn-action btn-outline-sm" id="btn-reset-no">✕</button>
				</span>`
			} else {
				html += `<button class="btn-action btn-reset" id="btn-reset">🔄 Reset</button>`
			}

			// Export
			html += `<button class="btn-action btn-export" id="btn-export">📤 Export</button>`

			html += `</div></div>` // close header-actions + panel-header

			// ── Grouped fields ──
			html += `<div class="fields-scroll">`
			const groups = this._groupFields()
			let gi = 0
			for (const [groupName, fields] of groups) {
				html += `<details class="field-group" ${gi === 0 ? 'open' : ''}>
					<summary class="group-summary">${this._esc(groupName)}</summary>
					<div class="group-body">`

				for (const f of fields) {
					const val = this._values[f.name] !== undefined ? this._values[f.name] : f.default
					html += this._renderField(f, val)
				}

				html += `</div></details>`
				gi++
			}
			html += `</div>` // close fields-scroll

			// ── Export modal ──
			if (this._showExportModal) {
				const code = this._exportFormat === 'css' ? this._generateCss() : this._generateJson()
				html += `
				<div class="modal-overlay" id="modal-overlay">
					<div class="modal-box">
						<div class="modal-header">
							<strong>Експорт стилів</strong>
							<button class="modal-close" id="modal-close">✕</button>
						</div>
						<p class="modal-hint">Скопіюйте згенерований код і вставте його у ваш CSS/SCSS або конфігурацію.</p>
						<div class="format-toggle">
							<button class="fmt-btn ${this._exportFormat === 'css' ? 'active' : ''}" id="fmt-css">🎨 CSS Variables</button>
							<button class="fmt-btn ${this._exportFormat === 'json' ? 'active' : ''}" id="fmt-json">📦 JSON State</button>
						</div>
						<div class="code-container">
							<pre class="code-block">${this._esc(code)}</pre>
							<button class="copy-btn ${this._exportCopied ? 'copied' : ''}" id="btn-copy">
								${this._exportCopied ? '✓ Скопійовано' : '📋 Копіювати код'}
							</button>
						</div>
					</div>
				</div>`
			}

			html += `</div>` // close panel
		}

		this.shadowRoot.innerHTML = `<style>${this._styles()}</style>${html}`
		this._bind()
	}

	// ═══════════════════════════════════════════════════════
	// Field renderers
	// ═══════════════════════════════════════════════════════

	_renderField(f, val) {
		let control = ''

		if (f.type === 'color') {
			const hex = this._rgbToHex(val)
			control = `
				<div class="control-row">
					<input type="color" class="color-input" data-name="${f.name}" value="${hex}" title="${this._esc(val)}">
					<input type="text" class="text-sm mono" data-name="${f.name}" value="${this._esc(val)}" style="flex:1">
				</div>`
		} else if (f.type === 'size') {
			const p = this._parseSize(val)
			const min = f.min ?? 0
			const max = f.max ?? 200
			const step = f.step ?? 1
			const units = f.units || ['px', 'rem', 'em', '%']
			control = `
				<div class="control-row">
					<input type="range" class="range-input" data-name="${f.name}" min="${min}" max="${max}" step="${step}" value="${p.num}">
					<span class="val-display mono">${p.num}</span>
					<select class="unit-select" data-name-unit="${f.name}">
						${units.map((u) => `<option value="${u}" ${u === p.unit ? 'selected' : ''}>${u}</option>`).join('')}
					</select>
				</div>`
		} else {
			// string / fallback
			control = `
				<div class="control-row">
					<input type="text" class="text-sm mono" data-name="${f.name}" value="${this._esc(val)}" style="flex:1">
				</div>`
		}

		return `
			<div class="field">
				<label class="field-label" title="--${f.name}">
					${this._esc(f.label)} <span class="var-hint">(--${f.name})</span>
				</label>
				${control}
			</div>`
	}

	// ═══════════════════════════════════════════════════════
	// Event binding
	// ═══════════════════════════════════════════════════════

	_bind() {
		const $ = (id) => this.shadowRoot.getElementById(id)
		const $$ = (sel) => this.shadowRoot.querySelectorAll(sel)

		// Toggle panel
		$('btn-toggle')?.addEventListener('click', () => {
			this._collapsed = !this._collapsed
			this._render()
		})

		// Undo
		$('btn-undo')?.addEventListener('click', () => this._undo())

		// Reset (2-step)
		$('btn-reset')?.addEventListener('click', () => {
			this._showResetConfirm = true
			this._render()
		})
		$('btn-reset-yes')?.addEventListener('click', () => this._resetAll())
		$('btn-reset-no')?.addEventListener('click', () => {
			this._showResetConfirm = false
			this._render()
		})

		// Export
		$('btn-export')?.addEventListener('click', () => {
			this._showExportModal = true
			this._exportCopied = false
			this._render()
		})
		$('modal-overlay')?.addEventListener('click', (e) => {
			if (e.target.id === 'modal-overlay') {
				this._showExportModal = false
				this._render()
			}
		})
		$('modal-close')?.addEventListener('click', () => {
			this._showExportModal = false
			this._render()
		})
		$('fmt-css')?.addEventListener('click', () => {
			this._exportFormat = 'css'
			this._render()
		})
		$('fmt-json')?.addEventListener('click', () => {
			this._exportFormat = 'json'
			this._render()
		})
		$('btn-copy')?.addEventListener('click', () => this._copyExport())

		// ── Field controls ──

		// Color pickers
		$$('input[type="color"]').forEach((el) => {
			el.addEventListener('input', (e) => {
				const name = e.target.getAttribute('data-name')
				this._change(name, e.target.value)
			})
		})

		// Text inputs (both color text and string fields)
		$$('input[type="text"]').forEach((el) => {
			el.addEventListener('change', (e) => {
				const name = e.target.getAttribute('data-name')
				if (name) this._change(name, e.target.value)
			})
		})

		// Range sliders
		$$('input[type="range"]').forEach((el) => {
			el.addEventListener('input', (e) => {
				const name = e.target.getAttribute('data-name')
				const unitSel = this.shadowRoot.querySelector(`select[data-name-unit="${name}"]`)
				const unit = unitSel ? unitSel.value : 'px'
				this._change(name, e.target.value + unit)
			})
		})

		// Unit selectors
		$$('select[data-name-unit]').forEach((el) => {
			el.addEventListener('change', (e) => {
				const name = e.target.getAttribute('data-name-unit')
				const range = this.shadowRoot.querySelector(`input[type="range"][data-name="${name}"]`)
				if (range) this._change(name, range.value + e.target.value)
			})
		})
	}

	// ═══════════════════════════════════════════════════════
	// Styles
	// ═══════════════════════════════════════════════════════

	_styles() {
		return `
			:host { display: block; font-family: system-ui, -apple-system, sans-serif; }

			/* ── Toggle bar ── */
			.toggle-bar { display: flex; justify-content: flex-end; margin-bottom: 0.5rem; }
			.toggle-btn {
				display: inline-flex; align-items: center; gap: 0.4rem;
				padding: 0.3rem 0.8rem; border-radius: 0.375rem;
				border: 1px solid #dee2e6; background: #fff; color: #495057;
				font-size: 0.8rem; font-weight: 600; cursor: pointer;
				box-shadow: 0 1px 3px rgba(0,0,0,0.08);
				transition: all 0.15s;
			}
			.toggle-btn:hover { background: #f8f9fa; }
			.toggle-btn.active { background: #0d6efd; color: #fff; border-color: #0d6efd; }
			.toggle-arrow { font-size: 0.6rem; }

			/* ── Panel ── */
			.panel {
				border: 1px solid #dee2e6; border-radius: 0.5rem;
				box-shadow: 0 2px 12px rgba(0,0,0,0.08);
				overflow: hidden; margin-bottom: 1rem;
				background: #fff;
			}

			/* ── Panel header ── */
			.panel-header {
				display: flex; align-items: center; justify-content: space-between;
				padding: 0.5rem 0.75rem; border-bottom: 1px solid #dee2e6;
				background: #f8f9fa; position: sticky; top: 0; z-index: 10;
			}
			.panel-header strong {
				font-size: 0.75rem; text-transform: uppercase;
				color: #6c757d; letter-spacing: 0.02em;
			}
			.header-actions { display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap; }

			/* ── Action buttons ── */
			.btn-action {
				display: inline-flex; align-items: center; gap: 0.25rem;
				padding: 0.15rem 0.5rem; border-radius: 0.25rem;
				font-size: 0.72rem; cursor: pointer; border: 1px solid #dee2e6;
				background: #fff; color: #495057; transition: all 0.12s;
			}
			.btn-action:hover:not(:disabled) { background: #e9ecef; }
			.btn-action:disabled { opacity: 0.45; cursor: default; }
			.btn-undo { }
			.btn-reset { border-color: #dc3545; color: #dc3545; }
			.btn-reset:hover { background: #dc3545; color: #fff; }
			.btn-export { border-color: #0d6efd; color: #0d6efd; }
			.btn-export:hover { background: #0d6efd; color: #fff; }
			.reset-confirm { display: inline-flex; align-items: center; gap: 0.25rem; }
			.reset-label { font-size: 0.7rem; color: #dc3545; font-weight: 700; }
			.btn-danger-sm {
				padding: 0.1rem 0.4rem; font-size: 0.7rem; border-radius: 0.2rem;
				background: #dc3545; color: #fff; border: none; cursor: pointer;
			}
			.btn-outline-sm {
				padding: 0.1rem 0.4rem; font-size: 0.7rem; border-radius: 0.2rem;
				background: #fff; color: #6c757d; border: 1px solid #dee2e6; cursor: pointer;
			}

			/* ── Fields scroll ── */
			.fields-scroll { max-height: 65vh; overflow-y: auto; }

			/* ── Field groups (details/summary) ── */
			.field-group { border-bottom: 1px solid #dee2e6; }
			.group-summary {
				padding: 0.5rem 0.75rem; cursor: pointer; user-select: none;
				font-size: 0.75rem; font-weight: 700; color: #6c757d;
				background: #f8f9fa; font-family: monospace;
			}
			.group-summary:hover { background: #e9ecef; }
			.group-body {
				display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
				gap: 0.75rem; padding: 0.75rem;
			}

			/* ── Individual field ── */
			.field { display: flex; flex-direction: column; gap: 0.25rem; }
			.field-label {
				font-size: 0.72rem; font-weight: 600; color: #495057;
				cursor: help; user-select: none;
			}
			.var-hint { font-weight: 400; color: #adb5bd; font-size: 0.62rem; }

			/* ── Controls ── */
			.control-row { display: flex; align-items: center; gap: 0.4rem; }
			.color-input {
				width: 26px; height: 26px; padding: 0; border: none;
				border-radius: 4px; cursor: pointer; flex-shrink: 0;
			}
			.range-input { flex: 1; min-width: 60px; }
			.val-display {
				width: 38px; text-align: right; font-size: 0.72rem; color: #6c757d;
				flex-shrink: 0;
			}
			.unit-select {
				font-size: 0.72rem; padding: 0.1rem 0.2rem;
				border: 1px solid #dee2e6; border-radius: 3px;
				width: 50px; flex-shrink: 0;
			}
			.text-sm {
				font-size: 0.75rem; padding: 0.2rem 0.4rem;
				border: 1px solid #dee2e6; border-radius: 4px;
			}
			.mono { font-family: monospace; }

			/* ── Export modal ── */
			.modal-overlay {
				position: fixed; inset: 0; z-index: 9999;
				background: rgba(0,0,0,0.5); display: flex;
				align-items: center; justify-content: center;
			}
			.modal-box {
				background: #fff; border-radius: 0.75rem;
				box-shadow: 0 8px 40px rgba(0,0,0,0.2);
				width: min(600px, 90vw); max-height: 85vh;
				overflow-y: auto; padding: 1.5rem;
			}
			.modal-header {
				display: flex; align-items: center; justify-content: space-between;
				margin-bottom: 0.5rem;
			}
			.modal-header strong { font-size: 1.1rem; }
			.modal-close {
				background: none; border: none; font-size: 1.2rem;
				cursor: pointer; color: #6c757d; padding: 0.2rem 0.5rem;
			}
			.modal-hint { font-size: 0.8rem; color: #6c757d; margin-bottom: 1rem; }
			.format-toggle { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
			.fmt-btn {
				padding: 0.3rem 0.75rem; font-size: 0.8rem; border-radius: 0.3rem;
				border: 1px solid #dee2e6; background: #fff; color: #495057;
				cursor: pointer; transition: all 0.15s;
			}
			.fmt-btn.active { background: #0d6efd; color: #fff; border-color: #0d6efd; }
			.code-container { position: relative; }
			.code-block {
				background: #212529; color: #f8f9fa; padding: 1rem;
				border-radius: 0.5rem; overflow: auto; max-height: 350px;
				font-size: 0.82rem; font-family: monospace;
				white-space: pre-wrap; word-break: break-all;
				margin: 0;
			}
			.copy-btn {
				position: absolute; top: 0.5rem; right: 0.5rem;
				padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 0.3rem;
				border: none; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
				background: #f8f9fa; color: #212529; transition: all 0.15s;
			}
			.copy-btn.copied { background: #198754; color: #fff; }
		`
	}
}

customElements.define('olmui-inspector', OlmuiInspector)
