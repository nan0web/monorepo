/**
 * Polymorphic Block Registry mapping Model constructors to UI View components/adapters.
 */
export class BlockRegistry {
    /** @type {Map<Function, any>} */
    registry: Map<Function, any>;
    /**
     * Register a Model constructor to a UI View component.
     * @param {Function} modelClass
     * @param {any} viewComponent
     */
    register(modelClass: Function, viewComponent: any): void;
    /**
     * Retrieve a registered UI View component for a Model constructor or instance.
     * @param {Function|object} target
     * @returns {any}
     */
    get(target: Function | object): any;
    /**
     * Check if a model is registered.
     * @param {Function|object} target
     * @returns {boolean}
     */
    has(target: Function | object): boolean;
}
export const blockRegistry: BlockRegistry;
