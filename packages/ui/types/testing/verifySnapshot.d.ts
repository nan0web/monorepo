/**
 * Saves a logical JSONL snapshot sequence
 * @param {Object} options
 * @param {string} options.name Snapshot file name (e.g. 'uk/ExploreCatalog.jsonl')
 * @param {Array<Object>} options.data Array of intents to serialize
 * @param {typeof import('node:fs/promises')} [options.fs] Injected filesystem
 * @param {typeof import('node:path')} [options.path] Injected path module
 */
export function verifySnapshot({ name, data, fs, path }: {
    name: string;
    data: Array<any>;
    fs?: typeof import("node:fs/promises") | undefined;
    path?: typeof import("node:path") | undefined;
}): Promise<void>;
