/**
 * ListCommand - ModelAsApp Subcommand to list all available releases in chronological order.
 */
export default class ListCommand extends ModelAsApp {
    static alias: string;
    static releasesDir: {
        help: string;
        type: string;
        default: string;
    };
    static UI: {
        title: string;
        help: string;
        noReleases: string;
        discoveredReleases: string;
        tableHeader: string;
        tableDivider: string;
        tableRow: string;
        stateClosed: string;
        stateWip: string;
        statePlanning: string;
    };
    /**
     * @param {Partial<ListCommand>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<ListCommand>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} */ releasesDir: string;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { ModelAsApp } from '@nan0web/ui';
