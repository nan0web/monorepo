/** @typedef {import("@nan0web/log").default} Logger */
/**
 * @typedef {{
 *   code: number;
 *   text: string;
 *   error: string;
 * }} SpawnResult
 */
/**
 * @typedef {{
 *   onData?: (chunk: Buffer) => void;
 *   cwd?: string | URL;
 *   env?: NodeJS.ProcessEnv;
 *   argv0?: string;
 *   stdio?: import('node:child_process').StdioOptions;
 *   detached?: boolean;
 *   shell?: boolean | string;
 *   windowsVerbatimArguments?: boolean;
 *   windowsHide?: boolean;
 *   timeout?: number;
 *   uid?: number;
 *   gid?: number;
 *   serialization?: import('node:child_process').SerializationType;
 *   killSignal?: NodeJS.Signals | number;
 *   signal?: AbortSignal;
 * }} RunSpawnOptions
 */
/**
 * @typedef {Object} Progress
 * @property {number} [height=0]
 * @property {number} [width=0]
 * @property {Logger | undefined} [logger]
 */
/**
 * Spawns a child process and returns a promise that resolves when the process closes.
 *
 * @param {string} cmd - The command to run.
 * @param {string[]} [args=[]] - List of arguments to pass to the command.
 * @param {RunSpawnOptions & { progress?: Progress }} [opts={}] - Options to pass to spawn.
 *
 * @returns {Promise<SpawnResult>} A promise resolving with process exit code and stdout content.
 *
 * @example
 * const { code, text } = await runSpawn('git', ['remote', 'get-url', 'origin']);
 */
export default function runSpawn(cmd: string, args?: string[], opts?: RunSpawnOptions & {
    progress?: Progress;
}): Promise<SpawnResult>;
export type Logger = import("@nan0web/log").default;
export type SpawnResult = {
    code: number;
    text: string;
    error: string;
};
export type RunSpawnOptions = {
    onData?: (chunk: Buffer) => void;
    cwd?: string | URL;
    env?: NodeJS.ProcessEnv;
    argv0?: string;
    stdio?: import("node:child_process").StdioOptions;
    detached?: boolean;
    shell?: boolean | string;
    windowsVerbatimArguments?: boolean;
    windowsHide?: boolean;
    timeout?: number;
    uid?: number;
    gid?: number;
    serialization?: import("node:child_process").SerializationType;
    killSignal?: NodeJS.Signals | number;
    signal?: AbortSignal;
};
export type Progress = {
    height?: number | undefined;
    width?: number | undefined;
    logger?: Logger | undefined;
};
