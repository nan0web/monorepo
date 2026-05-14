/**
 * @typedef {{
 *   level?: number,
 *   children?: ContainerObject[],
 * }} ContainerObjectArgs
 */

export default class ContainerObject {
	/** @type {number} */
	level = 0

	/** @type {ContainerObject[]} */
	children = []

	/**
	 * @param {ContainerObjectArgs} [options]
	 */
	constructor(options = {}) {
		const { level = 0, children = [] } = options
		this.level = Number(level)
		this.children = children.map((child) => {
			if (child instanceof ContainerObject) {
				child.level = this.level + 1
				child._updateLevel()
				return child
			}
			return ContainerObject.from(child)
		})
	}

	/**
	 * Returns the most recent (deepest) container.
	 *
	 * @returns {ContainerObject | null}
	 */
	get recent() {
		if (this.children.length === 0) return null
		const lastChild = this.children[this.children.length - 1]
		if (lastChild instanceof ContainerObject) {
			const rec = lastChild.recent
			return rec || lastChild
		}
		return null
	}

	/**
	 * Adds element to the container.
	 * @param {Partial<ContainerObject>} element
	 * @returns {ContainerObject}
	 */
	add(element) {
		const el = ContainerObject.from(element)
		el.level = this.level + 1
		this.children.push(el)
		el._updateLevel()
		return this
	}

	/**
	 * Updates level for all nested children recursively.
	 */
	_updateLevel() {
		for (const child of this.children) {
			if (child instanceof ContainerObject) {
				child.level = this.level + 1
				child._updateLevel()
			}
		}
	}

	/**
	 * Removes the element from the container.
	 * @param {*} element
	 * @returns {this}
	 */
	remove(element) {
		this.children = this.children.filter((e) => e !== element)
		return this
	}

	clear() {
		this.children = []
		return this
	}

	/**
	 * Finds an element by filter.
	 *
	 * @param {(v:any)=>boolean} filter
	 * @param {boolean} [recursively=false]
	 * @returns {ContainerObject | null}
	 */
	find(filter = () => true, recursively = false) {
		if (recursively) {
			for (const child of this.flat()) {
				if (filter(child)) return child
			}
			return null
		}
		return this.children.find(filter) || null
	}

	/**
	 * Flattens the tree into an array.
	 *
	 * @returns {ContainerObject[]}
	 */
	flat() {
		/** @type {ContainerObject[]} */
		const result = [this]
		for (const child of this.children) {
			if (child instanceof ContainerObject) {
				result.push(...child.flat())
			}
		}
		return result
	}

	toArray() {
		return this.flat()
	}

	/**
	 * Filters children.
	 *
	 * @param {(v:any)=>boolean} [filter=()=>true]
	 * @param {boolean} [recursively=false]
	 * @returns {Array}
	 */
	filter(filter = () => true, recursively = false) {
		if (recursively) {
			return this.flat().filter(filter)
		}
		return this.children.filter(filter)
	}

	/**
	 * Maps over children.
	 *
	 * @param {(value: ContainerObject, index: number, arr: ContainerObject[]) => any[]} callback
	 * @param {boolean} [recursively=false]
	 * @returns {Array}
	 */
	map(callback, recursively = false) {
		if (recursively) {
			return this.flat().map(callback)
		}
		return this.children.map(callback)
	}

	/**
	 * Asynchronously maps over children.
	 *
	 * @param {(value: ContainerObject, index: number, arr: ContainerObject[]) => Promise<any[]>} callback
	 * @param {boolean} [recursively=false]
	 * @returns {Promise<Array>}
	 */
	async asyncMap(callback, recursively = false) {
		if (recursively) {
			return Promise.all(this.flat().map(callback))
		}
		return Promise.all(this.children.map(callback))
	}

	/**
	 * Factory method that returns an existing instance or creates a new one.
	 *
	 * @param {object|ContainerObject} [props={}]
	 * @returns {ContainerObject}
	 */
	static from(props) {
		if (props instanceof ContainerObject) return props
		return new this({ ...props })
	}
}
