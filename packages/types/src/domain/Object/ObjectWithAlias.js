/**
 * Class that supports property aliasing via static ALIAS map.
 * This is just a template that you can use for extension of your classes.
 * If you extend this class you need to overwrite `static from` anyway.
 *
 * @class ObjectWithAlias
 */
class ObjectWithAlias {
	static ALIAS = {}

	constructor(input = {}) {
		Object.assign(this, typeof input === 'object' ? input : {})
	}

	/**
	 * Factory method that maps aliased keys to their target names.
	 *
	 * @param {object} [props={}] - Source properties
	 * @returns {ObjectWithAlias} Instance with aliases resolved
	 */
	static from(props = {}) {
		if (props instanceof ObjectWithAlias) return props
		if (typeof props !== 'object' || props === null) {
			props = {}
		}
		const mapped = { ...props }
		for (const [key, value] of Object.entries(this.ALIAS)) {
			if (key in mapped) {
				mapped[value] = mapped[key]
				delete mapped[key]
			}
		}
		return new this(mapped)
	}
}

export default ObjectWithAlias
