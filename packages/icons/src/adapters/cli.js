/**
 * @nan0web/icons — CLI/terminal adapter
 *
 * Renders icons as Unicode approximations for terminal output.
 * Optionally supports Kitty/iTerm2 image protocol for pixel-perfect SVGs.
 *
 * @example
 * import { iconChar, iconBraille } from '@nan0web/icons/adapters/cli'
 * import { BsBank2 } from '@nan0web/icons/bs'
 *
 * console.log(iconChar(BsBank2) + ' Bank branch')
 * // → 🏦 Bank branch
 */

/**
 * Well-known icon → Unicode char mapping.
 * Covers the most common icons used in CLI output.
 */
const UNICODE_MAP = {
	BsBank: '🏦',
	BsBank2: '🏦',
	BsLightningCharge: '⚡',
	BsLightningChargeFill: '⚡',
	BsCheck: '✓',
	BsCheckLg: '✓',
	BsCheck2: '✓',
	BsX: '✗',
	BsXLg: '✗',
	BsStar: '★',
	BsStarFill: '★',
	BsHeart: '♥',
	BsHeartFill: '♥',
	BsSun: '☀',
	BsSunFill: '☀',
	BsMoon: '☾',
	BsMoonFill: '☾',
	BsGear: '⚙',
	BsGearFill: '⚙',
	BsSearch: '🔍',
	BsTelephone: '☎',
	BsTelephoneFill: '☎',
	BsEnvelope: '✉',
	BsEnvelopeFill: '✉',
	BsHouse: '⌂',
	BsHouseFill: '⌂',
	BsPerson: '👤',
	BsPersonFill: '👤',
	BsFolder: '📁',
	BsFolderFill: '📁',
	BsFile: '📄',
	BsFileFill: '📄',
	BsArrowRight: '→',
	BsArrowLeft: '←',
	BsArrowUp: '↑',
	BsArrowDown: '↓',
	BsChevronRight: '›',
	BsChevronLeft: '‹',
	BsChevronUp: '⌃',
	BsChevronDown: '⌄',
	BsExclamationTriangle: '⚠',
	BsExclamationTriangleFill: '⚠',
	BsInfoCircle: 'ℹ',
	BsInfoCircleFill: 'ℹ',
	BsQuestionCircle: '?',
	BsQuestionCircleFill: '?',
}

/**
 * Get a Unicode character approximation for an icon.
 * Falls back to '●' if no mapping exists.
 *
 * @param {Object} data - Icon data
 * @param {string} [data._name] - Icon name (set by generator)
 * @returns {string} Unicode character
 */
export function iconChar(data, fallback = '●') {
	if (data?._name && UNICODE_MAP[data._name]) return UNICODE_MAP[data._name]
	return fallback
}

/**
 * Render an icon as a small block of braille characters (8×4 grid).
 * Parses SVG path data to approximate the icon shape in terminal.
 * (Future: implement proper SVG→braille rasterization)
 *
 * @param {Object} data - Icon data
 * @returns {string} Multi-line braille art string
 */
export function iconBraille(data) {
	// Placeholder — will implement SVG→braille rasterizer
	return iconChar(data)
}
