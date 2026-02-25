/**
 * Reads package.json from the provided FS‑like instance and returns all
 * dependencies that start with `@nan0web/`.
 *
 * @param {{loadDocument:(path:string)=>Promise<any>, absolute?: (path:string)=>string}} db
 * @returns {Promise<string[]>}
 */
export function getDependencies(db: {
    loadDocument: (path: string) => Promise<any>;
    absolute?: (path: string) => string;
}): Promise<string[]>;
