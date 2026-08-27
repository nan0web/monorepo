/**
 * Input module – provides utilities to read user input from the console.
 *
 * @module ui/input
 */
export type Intent = import('@nan0web/ui').Intent;
export type Model = import('@nan0web/ui').Model;
export type AskResponse = import('@nan0web/ui').AskResponse;
/** @typedef {import('@nan0web/ui').Intent} Intent */
/** @typedef {import('@nan0web/ui').Model} Model */
/** @typedef {import('@nan0web/ui').AskResponse} AskResponse */
/**
 * Triggers a system beep (ASCII Bell).
 */
export declare function beep(): void;
/**
 * Represents a line of user input.
 *
 * @class
 * @property {string} value – The raw answer string.
 * @property {string[]} stops – Words that trigger cancellation.
 * @property {boolean} cancelled – True when the answer matches a stop word.
 */
export declare class Input {
    /** @type {boolean} */
    _cancelled: boolean;
    /** @type {string} */
    value: string;
    /** @type {string[]} */
    stops: string[];
    constructor(input?: {});
    get cancelled(): boolean;
    toString(): string;
}
/**
 * Modern text input with validation and default value.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {string} [config.initial] - Default value
 * @param {string} [config.type] - Prompt type (text, password, etc)
 * @param {(value:string)=>boolean|string|Promise<boolean|string>} [config.validate] - Validator
 * @param {(value:string)=>string} [config.format] - Formatter
 * @returns {Promise<{value:string, cancelled:boolean}>}
 */
export declare function text(config: {
    message: string;
    initial?: string;
    type?: string;
    validate?: (value: string) => boolean | string | Promise<boolean | string>;
    format?: (value: string) => string;
}): Promise<{
    value: string;
    cancelled: boolean;
}>;
/**
 * Factory that creates a reusable async input handler.
 * Adapter for legacy ask() signature.
 *
 * @param {string[]} [stops=[]] Words that trigger cancellation.
 * @param {string|undefined} [predef] Optional predefined answer for testing.
 * @param {Object} [console] Optional console instance.
 * @param {(input: Input) => Promise<boolean>|boolean} [loop] Optional loop validator.
 * @returns {(question: string|{message:string}, loopVal?: Function) => Promise<Input>} Async function that resolves to an {@link Input}.
 */
export declare function createInput(stops?: string[], predef?: string | undefined, console?: any, loop?: (input: Input) => Promise<boolean> | boolean): (question: string | {
    message: string;
}, loopVal?: Function) => Promise<Input>;
/**
 * Universal Interaction Helper `ask`.
 * Polymorphic entry point for OLMUI actions (Prompts, Views, Intents, Models).
 *
 * @param {string | Intent | Model | Function | Promise<any>} target - Question string, Component, Intent, or Model Class.
 * @param {any} [options] - Additional options or loop validator.
 * @returns {Promise<any>}
 */
export declare function ask(target: string | Intent | Model | Function | Promise<any>, options?: any): Promise<any>;
/**
 * Mock helper for predefined inputs (Testing).
 */
export declare function createPredefinedInput(predefined: any, console: any, stops?: any[]): (question: any) => Promise<Input>;
