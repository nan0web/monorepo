/**
 * @nan0web/icons — Lit adapter
 *
 * @example
 * import { icon } from '@nan0web/icons/adapters/lit'
 * import { BsBank2 } from '@nan0web/icons/bs'
 *
 * render() {
 *   return html`${icon(BsBank2, { size: 20, class: 'me-1' })} Відділення`
 * }
 */

import { html } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { toSvg } from '../index.js'

/**
 * Render icon as Lit template result (inline SVG).
 *
 * @param {Object} data - Icon data from @nan0web/icons sets
 * @param {Object} [opts] - { size, class, color }
 * @returns {import('lit').TemplateResult}
 */
export function icon(data, opts) {
	return html`${unsafeHTML(toSvg(data, opts))}`
}
