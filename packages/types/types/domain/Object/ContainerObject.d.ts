/**
 * @typedef {{
 *   level?: number,
 *   children?: ContainerObject[],
 * }} ContainerObjectArgs
 */
export default class ContainerObject {
    /**
     * Factory method that returns an existing instance or creates a new one.
     *
     * @param {object|ContainerObject} [props={}]
     * @returns {ContainerObject}
     */
    static from(props?: object | ContainerObject): ContainerObject;
    /**
     * @param {ContainerObjectArgs} [options]
     */
    constructor(options?: ContainerObjectArgs);
    /** @type {number} */
    level: number;
    /** @type {ContainerObject[]} */
    children: ContainerObject[];
    /**
     * Returns the most recent (deepest) container.
     *
     * @returns {ContainerObject | null}
     */
    get recent(): ContainerObject | null;
    /**
     * Adds element to the container.
     * @param {Partial<ContainerObject>} element
     * @returns {ContainerObject}
     */
    add(element: Partial<ContainerObject>): ContainerObject;
    /**
     * Updates level for all nested children recursively.
     */
    _updateLevel(): void;
    /**
     * Removes the element from the container.
     * @param {*} element
     * @returns {this}
     */
    remove(element: any): this;
    clear(): this;
    /**
     * Finds an element by filter.
     *
     * @param {(v:any)=>boolean} filter
     * @param {boolean} [recursively=false]
     * @returns {ContainerObject | null}
     */
    find(filter?: (v: any) => boolean, recursively?: boolean): ContainerObject | null;
    /**
     * Flattens the tree into an array.
     *
     * @returns {ContainerObject[]}
     */
    flat(): ContainerObject[];
    toArray(): ContainerObject[];
    /**
     * Filters children.
     *
     * @param {(v:any)=>boolean} [filter=()=>true]
     * @param {boolean} [recursively=false]
     * @returns {Array}
     */
    filter(filter?: (v: any) => boolean, recursively?: boolean): any[];
    /**
     * Maps over children.
     *
     * @param {(value: ContainerObject, index: number, arr: ContainerObject[]) => any[]} callback
     * @param {boolean} [recursively=false]
     * @returns {Array}
     */
    map(callback: (value: ContainerObject, index: number, arr: ContainerObject[]) => any[], recursively?: boolean): any[];
    /**
     * Asynchronously maps over children.
     *
     * @param {(value: ContainerObject, index: number, arr: ContainerObject[]) => Promise<any[]>} callback
     * @param {boolean} [recursively=false]
     * @returns {Promise<Array>}
     */
    asyncMap(callback: (value: ContainerObject, index: number, arr: ContainerObject[]) => Promise<any[]>, recursively?: boolean): Promise<any[]>;
}
export type ContainerObjectArgs = {
    level?: number;
    children?: ContainerObject[];
};
