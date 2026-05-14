/**
 * @nan0web/icons — Framework-agnostic SVG icons
 *
 * Converts icon data (extracted from react-icons at build time)
 * into pure SVG strings. Zero runtime dependencies.
 *
 * @example
 * import { toSvg, toElement } from '@nan0web/icons'
 * import { BsBank2 } from '@nan0web/icons/bs'
 *
 * const svg = toSvg(BsBank2, { size: 20, class: 'me-1' })
 * // → '<svg xmlns="..." width="20" height="20" ...>...</svg>'
 */

/**
 * Render children nodes recursively to SVG string.
 * @param {Array} children
 * @returns {string}
 */
function renderChildren(children) {
	if (!children) return ''
	return children
		.map((c) => {
			const attrs = Object.entries(c.attr || {})
				.map(([k, v]) => `${k}="${v}"`)
				.join(' ')
			const inner = c.child ? renderChildren(c.child) : ''
			return `<${c.tag} ${attrs}>${inner}</${c.tag}>`
		})
		.join('')
}

/**
 * Convert icon data to SVG string.
 *
 * @param {Object} data - Icon data object { tag, attr, child }
 * @param {Object} [opts]
 * @param {number} [opts.size=16] - Icon size (width & height)
 * @param {string} [opts.class=''] - CSS class to add
 * @param {string} [opts.color] - Override fill color
 * @returns {string} SVG markup string
 */
export function toSvg(data, { size = 16, class: cls = '', color } = {}) {
	if (!data || !data.attr) return ''
	const a = { ...data.attr }
	if (color) a.fill = color
	const attrStr = Object.entries(a)
		.map(([k, v]) => `${k}="${v}"`)
		.join(' ')
	const classAttr = cls ? ` class="${cls}"` : ''
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ${attrStr}${classAttr}>${renderChildren(data.child)}</svg>`
}

/**
 * Convert icon data to a DOM SVG element.
 *
 * @param {Object} data - Icon data object
 * @param {Object} [opts] - Same options as toSvg
 * @returns {SVGSVGElement}
 */
export function toElement(data, opts) {
	const svgStr = toSvg(data, opts)
	const template = document.createElement('template')
	template.innerHTML = svgStr
	return template.content.firstChild
}
