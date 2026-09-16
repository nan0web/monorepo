/**
 * ViewCommand - ModelAsApp Subcommand to inspect and view release details across multimodal interfaces.
 */
export default class ViewCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        help: string;
        noReleases: string;
        selectPrompt: string;
    };
    static version: {
        help: string;
        positional: boolean;
        type: string;
        default: string;
    };
    /**
     * @param {Partial<ViewCommand>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<ViewCommand>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} */
    version: string;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { ModelAsApp } from '@nan0web/ui';
