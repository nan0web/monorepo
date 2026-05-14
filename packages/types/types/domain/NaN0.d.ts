/**
 * @typedef {Object} Context
 * @property {Array<{ text: string, id: string }>} [comments=[]]
 * @property {number} [i]
 * @property {string} [next]
 * @property {typeof Object} [Body]
 */
/**
 * NaN0 format - "0 is not a number" - zero is a universe that is a source of any
 * other numbers and else.
 * The word rea1 means subjective reality, because everyone's reality is different.
 * The word g0d means god as infinite energy and everything else is a part of it.
 * So there is no objective reality until everyone becomes an only one that is g0d.
 * Becomes here means rea1ize the rea0ity.
 * @example The top level element of NaN0 document can be any of NaN0 types.
 *          NaN0 document is useful in cases of storing pure data such as types:
 *          boolean, number, string, date, object, array, array of previous types.
 *          These types can cover most of business cases when structuring data into
 *          classes and nested and connected business logic as it is in rea1 life.
 */
export default class NaN0 {
    static NEW_LINE: string;
    static TAB: string;
    static EMPTY_ARRAY: string;
    static EMPTY_DATE: string;
    static EMPTY_OBJECT: string;
    static MULTILINE_START: string;
    static VALUE_DELIMITER: (string | RegExp)[];
    static COMMENT_START: string;
    static numberRegex: RegExp;
    static dateRegex: RegExp;
    static tzSuffixRegex: RegExp;
    static tzMatchRegex: RegExp;
    /**
     * @param {string} str
     * @param {string} [key]
     * @param {Context} [context]
     * @returns {any}
     */
    static parseValue(str: string, key?: string, context?: Context): any;
    static formatValue(value: any): string;
    /**
     * @param {string} text
     * @param {string | RegExp | Array<string | RegExp>} condition
     * @returns {{ condition: string | RegExp, name: string } | false}
     */
    static match(text: string, condition: string | RegExp | Array<string | RegExp>): {
        condition: string | RegExp;
        name: string;
    } | false;
    static parseComments(allChildren: any, startIdx?: number): {
        comments: string;
        nextIdx: string;
        i: number;
    };
    /**
     * @param {any[]} allChildren
     * @param {number} level
     * @param {Context} context
     * @returns {any}
     */
    static parseContainer(allChildren: any[], level?: number, context?: Context): any;
    /**
     *
     * @param {any[]} allChildren
     * @param {number} level
     * @param {Context} [context]
     * @returns
     */
    static parseObjectWithComments(allChildren: any[], level?: number, context?: Context): {};
    /**
     *
     * @param {any[]} allChildren
     * @param {number} level
     * @param {Context} context
     * @returns
     */
    static parseArrayWithComments(allChildren: any[], level?: number, context?: Context): any[];
    static addValueToNode(parent: any, value: any, level: any, key: any): void;
    static addArrayItemToNode(parent: any, item: any, level: any): void;
    /**
     * Parses the NaN0 format into an object or array using a high-performance state machine.
     *
     * @param {string} input - NaN0 formatted text.
     * @param {Context} [context={ comments: [], Body: undefined }]
     * @returns {any} Parsed JavaScript value (object/array).
     */
    static parse(input: string, context?: Context): any;
    /**
     * Stringifies any input object or array into .NaN0 format.
     *
     * @param {Object|Array} input - Input object/array.
     * @param {Context} [context={ comments: [] }]
     * @returns {string} NaN0 formatted string.
     *
     * COMMENT RENDERING:
     *   - `context.comments` is an array of `{ text, id }`.
     *   - `id` matches either the top‑level object (`"."`) or an array index
     *     (`"[0]"`) or a specific key.
     *   - When a comment is present for a given path we render it as one or
     *     multiple `#` lines placed **before** the corresponding node.
     */
    static stringify(input: any | any[], context?: Context): string;
}
export type Context = {
    comments?: {
        text: string;
        id: string;
    }[] | undefined;
    i?: number | undefined;
    next?: string | undefined;
    Body?: ObjectConstructor | undefined;
};
