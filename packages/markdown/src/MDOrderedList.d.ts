import MDList from './MDList.js';
/**
 * Ordered list element – implements its own logic instead of extending MDList
 * to avoid circular import issues.
 */
export default class MDOrderedList extends MDList {
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    constructor(props?: {});
}
/**
 * Ordered list element – implements its own logic instead of extending MDList
 * to avoid circular import issues.
 */
export default namespace MDOrderedList {
    var parse: (text: string, context?: {
        i: number;
        rows: string[];
    }) => MDOrderedList | false;
}
