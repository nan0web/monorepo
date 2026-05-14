class E2eExample extends HTMLElement {
	connectedCallback() {
		if (this._rendered) return
		this._rendered = true

		const label = this.getAttribute('label')
		let htmlCode = ''
		const htmlSlot = this.querySelector('template[slot="html-code"]')
		if (htmlSlot) htmlCode = htmlSlot.innerHTML.trim()

		let yamlCode = ''
		const yamlSlot = this.querySelector('template[slot="yaml-code"]')
		if (yamlSlot) yamlCode = yamlSlot.innerHTML.trim()

		const previewNodes = Array.from(this.childNodes).filter(
			(n) => !(n.nodeType === 1 && n.tagName === 'TEMPLATE'),
		)
		previewNodes.forEach((n) => n.parentNode && n.parentNode.removeChild(n))

		const escapeHtml = (str) =>
			str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

		let htmlCodeHtml = ''
		if (htmlCode) {
			htmlCodeHtml =
				'<div class="col-12 col-xl-6">' +
				'<div class="card border-0 shadow-sm h-100">' +
				'<div class="card-header bg-primary text-white py-2 px-3 fw-bold" style="font-size: 0.8rem">HTML / JS (Client)</div>' +
				'<div class="card-body bg-dark p-3" style="border-bottom-left-radius: 0.375rem; border-bottom-right-radius: 0.375rem;">' +
				'<pre class="mb-0 text-white" style="font-size: 0.8rem; overflow-x: auto; white-space: pre-wrap;">' +
				escapeHtml(htmlCode) +
				'</pre></div></div></div>'
		}

		let yamlCodeHtml = ''
		if (yamlCode) {
			yamlCodeHtml =
				'<div class="col-12 col-xl-6">' +
				'<div class="card border-0 shadow-sm h-100">' +
				'<div class="card-header bg-success text-white py-2 px-3 fw-bold" style="font-size: 0.8rem">Meta Data (YAML)</div>' +
				'<div class="card-body bg-dark p-3" style="border-bottom-left-radius: 0.375rem; border-bottom-right-radius: 0.375rem;">' +
				'<pre class="mb-0 text-white" style="font-size: 0.8rem; overflow-x: auto; white-space: pre-wrap;">' +
				escapeHtml(yamlCode) +
				'</pre></div></div></div>'
		}

		const containerId = 'preview-container-' + this.id

		this.innerHTML =
			'<div class="mb-4">' +
			(label
				? '<h6 class="text-muted text-uppercase small fw-semibold mb-2">' + label + '</h6>'
				: '') +
			'<div class="card border-0 shadow-sm mb-3"><div class="card-body example-preview py-4 position-relative z-3" id="' +
			containerId +
			'"></div></div>' +
			'<div class="row g-2">' +
			htmlCodeHtml +
			yamlCodeHtml +
			'</div></div>'

		const container = this.querySelector('#' + containerId)
		previewNodes.forEach((n) => container.appendChild(n))
	}
}

let exampleCounter = 0
customElements.define(
	'e2e-example',
	class extends E2eExample {
		constructor() {
			super()
			this.id = 'e2e-exp-' + exampleCounter++
		}
	},
)
