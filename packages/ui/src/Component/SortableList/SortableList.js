/**
 * Headless Sortable List — pure data model with callbacks.
 * Platform-agnostic: works in Node.js, browser, CLI, anywhere.
 *
 * @example
 * const list = SortableList.create({
 *   items: ['a', 'b', 'c'],
 *   onChange: (items) => console.log(items),
 * })
 * list.moveUp(1) // ['b', 'a', 'c']
 */
class SortableList {
	/** @type {any[]} */
	#items

	/** @type {any[]} */
	#initial

	/** @type {function|undefined} */
	#onChange

	/**
	 * @param {object} [opts]
	 * @param {any[]} [opts.items]
	 * @param {function} [opts.onChange]
	 */
	constructor({ items = [], onChange } = {}) {
		this.#initial = [...items]
		this.#items = [...items]
		this.#onChange = onChange
	}

	/**
	 * Factory method.
	 * @param {object} opts
	 * @returns {SortableList}
	 */
	static create(opts) {
		return new SortableList(opts)
	}

	/**
	 * Move item at index up (swap with previous).
	 * No-op if already at top.
	 * @param {number} index
	 */
	moveUp(index) {
		if (index <= 0 || index >= this.#items.length) return
		const temp = this.#items[index - 1]
		this.#items[index - 1] = this.#items[index]
		this.#items[index] = temp
		this.#onChange?.(this.getItems())
	}

	/**
	 * Move item at index down (swap with next).
	 * No-op if already at bottom.
	 * @param {number} index
	 */
	moveDown(index) {
		if (index < 0 || index >= this.#items.length - 1) return
		const temp = this.#items[index + 1]
		this.#items[index + 1] = this.#items[index]
		this.#items[index] = temp
		this.#onChange?.(this.getItems())
	}

	/**
	 * Returns a copy of the current item order.
	 * @returns {any[]}
	 */
	getItems() {
		return [...this.#items]
	}

	/**
	 * Move item from one position to another (drag-n-drop).
	 * No-op if indices are equal or out of bounds.
	 * @param {number} from - source index
	 * @param {number} to - target index
	 */
	moveTo(from, to) {
		if (from === to) return
		if (from < 0 || from >= this.#items.length) return
		if (to < 0 || to >= this.#items.length) return
		const [item] = this.#items.splice(from, 1)
		this.#items.splice(to, 0, item)
		this.#onChange?.(this.getItems())
	}

	/**
	 * Restores the initial order.
	 */
	reset() {
		this.#items = [...this.#initial]
		this.#onChange?.(this.getItems())
	}
}

export default SortableList
