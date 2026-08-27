export type ConsoleLike = {
    info: (msg: string, ...args: any[]) => void;
    error: (msg: string, ...args: any[]) => void;
    warn: (msg: string, ...args: any[]) => void;
    debug: (msg: string, ...args: any[]) => void;
};
export default Logger;
import LogConsole from './Console.js';
import Logger from './Logger.js';
import LoggerFormat from './LoggerFormat.js';
import NoConsole from './NoConsole.js';
import NoLogger from './NoLogger.js';
/**
 * @typedef {Object} ConsoleLike
 * @property {(msg: string, ...args: any[]) => void} info
 * @property {(msg: string, ...args: any[]) => void} error
 * @property {(msg: string, ...args: any[]) => void} warn
 * @property {(msg: string, ...args: any[]) => void} debug
 */
/** @type {ConsoleLike} */
export const ConsoleLike: ConsoleLike;
export { LogConsole, Logger, LoggerFormat, NoConsole, NoLogger };
