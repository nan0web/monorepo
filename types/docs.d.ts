#!/usr/bin/env node
/**
 * Read package.json via a DB‑like instance and return all @nan0web/ deps.
 * @param {FS} db
 */
export function getDependencies(db: FS): Promise<string[]>;
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
export function checkDocs({ fs, pkgDb, name, stepsMd, onChunk }: checkDocsOptions): Promise<void>;
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
 * @returns {Promise<{ incorrect: string[], deps: Record<string, string[] >}>}
 */
export function checkAllDocs({ fs, pkgs, logger, chunks, onChunk }: checkAllDocsOptions): Promise<{
    incorrect: string[];
    deps: Record<string, string[]>;
}>;
export type checkDocsOptions = {
    fs: FS;
    pkgDb: FS;
    name: string;
    stepsMd: string;
    onChunk: import('../src/runCommandAsync.js').onChunkFn;
};
export type checkAllDocsOptions = {
    fs: FS;
    pkgs: string[];
    logger: Logger;
    chunks: string[];
    onChunk: import('./runCommandAsync.js').onChunkFn;
};
import FS from "@nan0web/db-fs";
import Logger from "@nan0web/log";
