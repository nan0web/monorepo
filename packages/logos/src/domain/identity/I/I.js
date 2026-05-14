class I {
	/** @type {string} */
	value
	constructor(value) {
		this.value = String(value)
	}
	toString() {
		return this.value
	}
	static from(value) {
		if (value instanceof I) return value
		return new I(value)
	}
}

export default I
