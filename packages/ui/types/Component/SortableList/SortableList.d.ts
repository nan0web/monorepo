export default SortableList;
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
    /**
     * Factory method.
     * @param {object} opts
     * @returns {SortableList}
     */
    static create(opts: object): SortableList;
    /**
     * @param {object} [opts]
     * @param {any[]} [opts.items]
     * @param {function} [opts.onChange]
     */
    constructor({ items, onChange }?: {
        items?: any[] | undefined;
        onChange?: Function | undefined;
    });
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
     * Restores the initial order.
     */
    reset(): void;
    #private;
}
