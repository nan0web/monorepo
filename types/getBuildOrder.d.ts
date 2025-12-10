/**
 * Topological sort of a dependency map.
 *
 * @param {{[k:string]:string[]}} map
 * @returns {string[]}
 */
export function getBuildOrder(map: {
    [k: string]: string[];
}): string[];
