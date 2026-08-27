import { ModelAsApp } from "@nan0web/ui";
import CheckCommand from './CheckCommand.js';
import StatusCommand from './StatusCommand.js';
export declare class ReleaseApp extends ModelAsApp {
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
    constructor(data?: Partial<ReleaseApp>, options?: Partial<import('@nan0web/ui').ModelAsAppOptions>);
}
