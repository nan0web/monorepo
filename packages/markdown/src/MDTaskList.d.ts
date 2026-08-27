import MDList from './MDList.js';
/**
 * Task list element.
 */
export default class MDTaskList extends MDList {
    end: string;
    tag: string;
    mdTag: string;
    mdEnd: string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    static get defaultEnd(): string;
    constructor(props?: {});
    /**
     * Parse a task list block from markdown.
     * @param {string} text
     * @param {object} context
     * @returns {MDTaskList | false}
     */
    static parse(text: string, context?: object): MDTaskList | false;
    toString(props?: {}): string;
}
