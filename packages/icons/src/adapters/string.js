/**
 * @nan0web/icons — String/vanilla adapter
 *
 * Re-exports toSvg and toElement for non-framework usage.
 *
 * @example
 * import { toSvg } from '@nan0web/icons/adapters/string'
 * import { BsBank2 } from '@nan0web/icons/bs'
 *
 * element.innerHTML = toSvg(BsBank2, { size: 24 })
 */

export { toSvg, toElement } from '../index.js'
