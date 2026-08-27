/**
 * Creates a command object with pipeline support
 * @param {string} name - Command name
 * @param {(ctx: EventContext) => Promise<void> | void} handler - Command handler
 * @returns {{on: Function, off: Function, execute: Function, bus: any}}
 */
export function createCommand(name: string, handler: (ctx: EventContext<any>) => Promise<void> | void): {
    on: Function;
    off: Function;
    execute: Function;
    bus: any;
};
import EventContext from './types/EventContext.js';
