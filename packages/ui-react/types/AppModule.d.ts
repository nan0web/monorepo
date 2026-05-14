export default class AppModule {
    /**
     * @param {string} uri - e.g., "app/currency-calculator"
     * @param {DB} db
     */
    constructor(uri: string, db: DB);
    /** @type {string} */
    uri: string;
    /** @type {Object} */
    config: any;
    /** @type {Object} */
    data: any;
    /** @type {DB} */
    db: DB;
    /** @type {Object} */
    ui: any;
    load(): Promise<void>;
    run(action: any): Promise<void>;
    convert(value: any, from: any, to: any): Promise<string>;
    /**
     * @param {string|number} key
     * @param {any} context
     * @returns {React.ReactNode}
     */
    render(key: string | number, context: any): React.ReactNode;
}
import DB from '@nan0web/db-browser';
