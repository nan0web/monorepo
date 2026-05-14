/**
 * React hook that wraps `@nan0web/ui` headless `SortableList` with React state.
 *
 * @param {any[]} initialItems - Initial items list
 * @param {object} [options]
 * @param {string} [options.persist] - localStorage key for auto-save/restore
 * @param {function} [options.onChange] - External callback on order change
 * @returns {{ items: any[], moveUp: (i: number) => void, moveDown: (i: number) => void, moveTo: (from: number, to: number) => void, reset: () => void }}
 */
export default function useSortableList(initialItems: any[], options?: {
    persist?: string | undefined;
    onChange?: Function | undefined;
}): {
    items: any[];
    moveUp: (i: number) => void;
    moveDown: (i: number) => void;
    moveTo: (from: number, to: number) => void;
    reset: () => void;
};
