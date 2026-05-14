/**
 * Task list element.
 */
export default class MDTaskList extends MDList {
    /**
     * Parse a task list block from markdown.
     * @param {string} text
     * @param {object} context
     * @returns {MDTaskList | false}
     */
    static parse(text: string, context?: object): MDTaskList | false;
    end: string;
    tag: string;
    mdTag: string;
    mdEnd: string;
    toString(props?: {}): string;
}
import MDList from './MDList.js';
