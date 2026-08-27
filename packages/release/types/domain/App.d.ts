export class ReleaseApp extends ModelAsApp {
    static command: {
        help: string;
        options: (typeof CheckCommand | typeof StatusCommand)[];
        positional: boolean;
        default: null;
    };
    /**
     * @param {Partial<ReleaseApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<ReleaseApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {ModelAsApp | null} Subcommand to run */
    command: ModelAsApp | null;
}
import { ModelAsApp } from "@nan0web/ui";
import CheckCommand from './CheckCommand.js';
import StatusCommand from './StatusCommand.js';
