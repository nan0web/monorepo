/**
 * @typedef {(data: string, error?: boolean) => void} onChunkFn
 */
/**
 * @typedef {Object} runCommandOptions
 * @property {string} [cwd]
 * @property {number} [maxLines]
 * @property {boolean} [keepOutput]
 * @property {onChunkFn} [onChunk]
 */
/**
 * @typedef {Object} CommandResult
 * @property {number} code
 * @property {string} output
 */
/**
 * Execute a command asynchronously.
 *
 * In test environments the environment variable `MOCK_RUN_COMMAND=true`
 * forces a deterministic mock result (`code: 0`, empty `output`).
 *
 * @param {string} command
 * @param {string[]} args
 * @param {runCommandOptions} [options]
 * @returns {Promise<CommandResult>}
 */
export function runCommandAsync(command: string, args: string[], options?: runCommandOptions | undefined): Promise<CommandResult>;
export type onChunkFn = (data: string, error?: boolean) => void;
export type runCommandOptions = {
    cwd?: string | undefined;
    maxLines?: number | undefined;
    keepOutput?: boolean | undefined;
    onChunk?: onChunkFn | undefined;
};
export type CommandResult = {
    code: number;
    output: string;
};
