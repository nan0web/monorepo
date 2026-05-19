/**
 * Universal hook for synchronizing a filter string with the URL (hash or search param).
 *
 * @param {Array<string>} validCategories - Array of valid categories/filters.
 * @param {string} defaultFilter - The default filter to use if none is in the URL.
 * @param {Function} navigateFn - Function to use for navigation (pushState/replaceState wrapper).
 */
export function useUrlFilter(validCategories?: Array<string>, defaultFilter?: string, navigateFn?: Function): (string | ((cat: any) => void))[];
export default useUrlFilter;
