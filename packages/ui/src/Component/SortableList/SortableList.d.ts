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
declare class SortableList {
    #private;
    /**
     * @param {object} [opts]
     * @param {any[]} [opts.items]
     * @param {function} [opts.onChange]
     */
    constructor({ items, onChange }?: {
        items?: any[];
        onChange?: Function;
    });
    /**
     * Factory method.
     * @param {object} opts
     * @returns {SortableList}
     */
    static create(opts: object): SortableList;
    /**
     * Move item at index up (swap with previous).
     * No-op if already at top.
     * @param {number} index
     */
    moveUp(index: number): void;
    /**
     * Move item at index down (swap with next).
     * No-op if already at bottom.
     * @param {number} index
     */
    moveDown(index: number): void;
    /**
     * Returns a copy of the current item order.
     * @returns {any[]}
     */
    getItems(): any[];
    /**
     * Move item from one position to another (drag-n-drop).
     * No-op if indices are equal or out of bounds.
     * @param {number} from - source index
     * @param {number} to - target index
     */
    moveTo(from: number, to: number): void;
    /**
     * Adds an item at the specified index.
     * If index is omitted or out of bounds, appends to the end.
     * @param {any} item
     * @param {number} [index]
     */
    addItem(item: any, index?: number): void;
    /**
     * Removes the item at the specified index.
     * No-op if index is out of bounds.
     * @param {number} index
     */
    removeItem(index: number): void;
    /**
     * Updates the item at the specified index.
     * No-op if index is out of bounds.
     * @param {number} index
     * @param {any} item
     */
    updateItem(index: number, item: any): void;
    /**
     * Restores the initial order.
     */
    reset(): void;
}
export default SortableList;
