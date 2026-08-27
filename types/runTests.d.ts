/**
 * Executes the `test:all` script of a package.
 *
 * The mock mode (`MOCK_RUN_COMMAND=true`) makes this a no‑op.
 *
 * @param {string} cwd
 * @param {import("./runCommandAsync.js").onChunkFn} onChunk
 * @returns {Promise<import("./runCommandAsync.js").CommandResult>}
 */
export declare function runTests(cwd: string, onChunk?: import("./runCommandAsync.js").onChunkFn): Promise<import("./runCommandAsync.js").CommandResult>;
