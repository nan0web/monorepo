/**
 * Sortable module – interactive reorderable list in CLI.
 *
 * Uses SortableList from @nan0web/ui as the headless data model.
 * Renders an interactive list where user can navigate with ↑/↓
 * and reorder items with Shift+↑/Shift+↓ (or k/j for reorder).
 *
 * @module ui/sortable
 */
/**
 * Interactive sortable list.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question / title.
 * @param {Array<string|{label:string, value:any}>} config.items - Items to sort.
 * @param {string} [config.hint] - Hint text.
 * @param {{nav?: string, grab?: string, confirm?: string}} [config.controls] - Custom labels for navigation.
 * @param {Function} [config.t] - Translation function.
 * @param {Function} [config.onChange] - Callback on every reorder.
 * @param {Function} [config.selectFn] - Selection callback for adding new items.
 * @returns {Promise<{value: any[], cancelled: boolean}>}
 */
export declare function sortable(config: {
    message: string;
    items: Array<string | {
        label: string;
        value: any;
    }>;
    hint?: string;
    controls?: {
        nav?: string;
        grab?: string;
        confirm?: string;
    };
    t?: Function;
    onChange?: Function;
    selectFn?: Function;
}): Promise<{
    value: any[];
    cancelled: boolean;
}>;
export default sortable;
