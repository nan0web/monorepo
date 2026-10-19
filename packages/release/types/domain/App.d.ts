export class ReleaseApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static command: {
        help: string;
        options: (typeof CheckCommand | typeof DepsCommand | typeof PublishCommand | typeof SpecCommand | typeof StatusCommand | typeof WebCommand | typeof ListCommand | typeof ServeCommand | typeof ValidateCommand | typeof ExampleCommand)[];
        positional: boolean;
        default: typeof ViewCommand;
    };
}
export default ReleaseApp;
import { ModelAsApp } from "@nan0web/ui";
import CheckCommand from './CheckCommand.js';
import DepsCommand from './DepsCommand.js';
import PublishCommand from './PublishCommand.js';
import SpecCommand from './SpecCommand.js';
import StatusCommand from './StatusCommand.js';
import WebCommand from './WebCommand.js';
import ListCommand from './ListCommand.js';
import ServeCommand from './ServeCommand.js';
import ValidateCommand from './ValidateCommand.js';
import ExampleCommand from './ExampleCommand.js';
import ViewCommand from './ViewCommand.js';
