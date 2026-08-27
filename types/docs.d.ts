#!/usr/bin/env node
import FS from '@nan0web/db-fs';
import Logger from '@nan0web/log';
/**
 * Read package.json via a DB‑like instance and return all @nan0web/ deps.
 * @param {FS} db
 */
export declare function getDependencies(db: FS): Promise<string[]>;
export type checkDocsOptions = {
    fs: FS;
    pkgDb: FS;
    name: string;
    stepsMd: string;
    onChunk: import('../src/runCommandAsync.js').onChunkFn;
};
/**
 * @typedef {Object} checkDocsOptions
 * @property {FS} fs
 * @property {FS} pkgDb
 * @property {string} name
 * @property {string} stepsMd
 * @property {import('../src/runCommandAsync.js').onChunkFn} onChunk
 */
/**
 * @param {checkDocsOptions} param0
 */
export declare function checkDocs({ fs, pkgDb, name, stepsMd, onChunk }: checkDocsOptions): Promise<void>;
export type checkAllDocsOptions = {
    fs: FS;
    pkgs: string[];
    logger: Logger;
    chunks: string[];
    onChunk: import('./runCommandAsync.js').onChunkFn;
};
/**
 * @typedef {Object} checkAllDocsOptions
 * @property {FS} fs
 * @property {string[]} pkgs
 * @property {Logger} logger
 * @property {string[]} chunks[]
 * @property {import('./runCommandAsync.js').onChunkFn} onChunk
 */
/**
 * @param {checkAllDocsOptions} param0
 * @returns {Promise<{ incorrect: { name: string, missing: string[] }[], deps: Record<string, string[] >}>}
 */
export declare function checkAllDocs({ fs, pkgs, logger, chunks, onChunk }: checkAllDocsOptions): Promise<{
    incorrect: {
        name: string;
        missing: string[];
    }[];
    deps: Record<string, string[]>;
}>;
