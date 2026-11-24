export class ReleaseApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static command: {
        help: string;
        options: (typeof CheckCommand | typeof DepsCommand | typeof PublishCommand | typeof SpecCommand | typeof StatusCommand | typeof WebCommand | typeof ViewCommand | typeof ListCommand | typeof ServeCommand | typeof ValidateCommand | typeof ExampleCommand | typeof TodoCommand | typeof TrayCommand | typeof TodoServeCommand | typeof SyncCommand)[];
        positional: boolean;
        default: typeof ViewCommand;
    };
    /**
     * @param {Partial<ReleaseApp>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<ReleaseApp>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {any} */ command: any;
}
export default ReleaseApp;
import { ModelAsApp } from "@nan0web/ui";
import CheckCommand from './CheckCommand.js';
import DepsCommand from './DepsCommand.js';
import PublishCommand from './PublishCommand.js';
import SpecCommand from './SpecCommand.js';
import StatusCommand from './StatusCommand.js';
import WebCommand from './WebCommand.js';
import ViewCommand from './ViewCommand.js';
import ListCommand from './ListCommand.js';
import ServeCommand from './ServeCommand.js';
import ValidateCommand from './ValidateCommand.js';
import ExampleCommand from './ExampleCommand.js';
import TodoCommand from './TodoCommand.js';
import TrayCommand from './TrayCommand.js';
import TodoServeCommand from './TodoServeCommand.js';
import SyncCommand from './SyncCommand.js';
