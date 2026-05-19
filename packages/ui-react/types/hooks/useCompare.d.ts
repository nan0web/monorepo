/**
 * Universal hook for managing compared items.
 * Persists the list of item IDs to localStorage.
 *
 * @param {string} storageKey - Key to use for localStorage.
 * @param {Array<string>} initialValue - Initial array of IDs if storage is empty.
 */
export function useCompare(storageKey?: string, initialValue?: Array<string>): {
    compareIds: any;
    toggleCompare: (id: any) => void;
    clearCompare: () => void;
    setCompareIds: import("react").Dispatch<any>;
};
export default useCompare;
