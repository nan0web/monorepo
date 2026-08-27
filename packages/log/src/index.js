/**
 * @typedef {Object} ConsoleLike
 * @property {(msg: string, ...args: any[]) => void} info
 * @property {(msg: string, ...args: any[]) => void} error
 * @property {(msg: string, ...args: any[]) => void} warn
 * @property {(msg: string, ...args: any[]) => void} debug
 */

/** @type {ConsoleLike} */
const ConsoleLike = { info() {}, error() {}, warn() {}, debug() {} }

import LogConsole from './Console.js'
import Logger from './Logger.js'
import LoggerFormat from './LoggerFormat.js'
import NoConsole from './NoConsole.js'
import NoLogger from './NoLogger.js'

export { LogConsole, Logger, LoggerFormat, NoConsole, NoLogger, ConsoleLike }

export default Logger
