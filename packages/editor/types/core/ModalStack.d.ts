/**
 * Manages a stack of editor models for recursive editing.
 * Handles depth limits and navigation between modal levels.
 */
export class ModalStack {
    /**
     * @param {object} options
     * @param {number} [options.maxDepth=7] - Maximum recursion level
     */
    constructor({ maxDepth }?: {
        maxDepth?: number | undefined;
    });
    /**
     * Current active editor model
     * @returns {object|null}
     */
    get current(): object | null;
    /**
     * Raw stack array
     * @returns {Array}
     */
    get items(): any[];
    /**
     * Current stack depth
     * @returns {number}
     */
    get depth(): number;
    /**
     * Push new model to the stack
     * @param {object} model - EditorModel instance
     * @returns {object} Pushed model
     */
    push(model: object): object;
    /**
     * Remove top model from stack and return it
     * @returns {object|null}
     */
    pop(): object | null;
    /**
     * Subscribe to stack changes
     * @param {Function} fn - Callback function
     * @returns {Function} Unsubscribe function
     */
    onChange(fn: Function): Function;
    #private;
}
export default ModalStack;
