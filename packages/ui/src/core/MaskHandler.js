/**
 * MaskHandler — Universal interactive mask controller.
 *
 * Supports masks where:
 *   `9`, `0`, `#` = digit placeholder
 *   `A` = letter placeholder
 *   `_` = any character placeholder
 *   anything else = literal (displayed as-is)
 *
 * Recognises the mask's static prefix (e.g. "+38" in "+38 (099) 999 9999")
 * and strips it from raw user input to avoid duplication.
 *
 * @module core/MaskHandler
 */

/**
 * @param {string} ch - single mask character
 * @returns {boolean}
 */
function isPlaceholder(ch) {
	return ch === '9' || ch === '0' || ch === '#' || ch === '_' || ch === 'A'
}

export class MaskHandler {
	constructor(mask) {
		this.mask = mask // e.g. "+38 (099) 999 9999"
		this.raw = '' // raw user digits (without mask prefix)
	}

	/** How many placeholder positions the mask has */
	get _slotCount() {
		let n = 0
		for (const ch of this.mask) if (isPlaceholder(ch)) n++
		return n
	}

	/** Static prefix of the mask (literal characters before first placeholder) */
	get _prefix() {
		let p = ''
		for (const ch of this.mask) {
			if (isPlaceholder(ch)) break
			p += ch
		}
		return p
	}

	get isComplete() {
		return this.raw.length >= this._slotCount
	}

	get formatted() {
		let result = ''
		let rawIndex = 0

		for (let i = 0; i < this.mask.length; i++) {
			const m = this.mask[i]

			if (isPlaceholder(m)) {
				if (rawIndex < this.raw.length) {
					result += this.raw[rawIndex++]
				} else {
					result += '_' // visual unfilled placeholder
				}
			} else {
				// Literal character in the mask
				result += m
			}
		}
		return result
	}

	/**
	 * Append a digit/letter character.
	 * Only accepts characters that fit into placeholders.
	 *
	 * @param {string} char
	 * @returns {boolean} true if accepted
	 */
	input(char) {
		if (this.raw.length >= this._slotCount) return false // already full

		if (/[0-9a-zA-Z]/.test(char)) {
			this.raw += char
			return true
		}
		return false
	}

	/**
	 * Remove last character
	 */
	backspace() {
		if (this.raw.length > 0) {
			this.raw = this.raw.slice(0, -1)
			return true
		}
		return false
	}

	/**
	 * Set a full value, intelligently stripping the mask's static prefix
	 * if the user pasted or injected the full formatted number.
	 *
	 * e.g. setValue('+380660848404') with mask '+38 (099) 999 9999'
	 *      strips "+38" → raw = '0660848404'
	 *
	 * @param {string} val
	 */
	setValue(val) {
		this.raw = ''
		// Strip all non-alphanumeric from the value
		let clean = String(val).replace(/[^a-zA-Z0-9]/g, '')

		// Strip mask's static prefix digits if present
		const prefixDigits = this._prefix.replace(/[^a-zA-Z0-9]/g, '')
		if (prefixDigits && clean.startsWith(prefixDigits)) {
			clean = clean.substring(prefixDigits.length)
		}

		// Feed only as many characters as we have slots
		for (const c of clean) {
			if (!this.input(c)) break
		}
	}
}
