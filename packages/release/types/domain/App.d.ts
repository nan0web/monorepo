export class App extends ModelAsApp {
    static command: {
        help: string;
        options: (typeof CheckCommand | typeof StatusCommand)[];
        default: null;
    };
    /**
     * @param {Partial<App>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<App>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {ModelAsApp} Subcommand to run */ command: ModelAsApp;
}
import { ModelAsApp } from "@nan0web/ui";
import CheckCommand from './CheckCommand.js';
import StatusCommand from './StatusCommand.js';
