export class BuildWorkflowsApp extends AuditorModel {
    static UI: {
        title: string;
        description: string;
        starting: string;
        saved: string;
        done: string;
    };
    /**
     * Recursively finds nan0web.nan0 files in the workspace.
     * @param {string} dir
     * @returns {Promise<string[]>}
     */
    findNan0Configs(dir: string): Promise<string[]>;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { AuditorModel } from '../AuditorModel.js';
