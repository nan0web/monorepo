export class ReleaseApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static command: {
        help: string;
        options: (typeof CheckCommand | typeof CloseCommand | typeof DepsCommand | typeof PublishCommand | typeof StatusCommand | typeof WebCommand | typeof ListCommand | typeof ServeCommand)[];
        positional: boolean;
        default: typeof ViewCommand;
    };
    /**
     * @param {Partial<ReleaseApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<ReleaseApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /**
     * Run the main controller logic.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
export default ReleaseApp;
import { ModelAsApp } from "@nan0web/ui";
import CheckCommand from './CheckCommand.js';
import CloseCommand from './CloseCommand.js';
import DepsCommand from './DepsCommand.js';
import PublishCommand from './PublishCommand.js';
import StatusCommand from './StatusCommand.js';
import WebCommand from './WebCommand.js';
import ListCommand from './ListCommand.js';
import ServeCommand from './ServeCommand.js';
import ViewCommand from './ViewCommand.js';
