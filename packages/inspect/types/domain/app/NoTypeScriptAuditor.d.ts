export class NoTypeScriptAuditor extends AuditorModel {
    static UI: {
        checking: string;
        foundTs: string;
        clean: string;
    };
    /**
     * @param {string} dir
     * @param {boolean} isJs
     * @param {string[]} tsFiles
     */
    _checkDir(dir: string, isJs: boolean, tsFiles: string[]): Promise<void>;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { AuditorModel } from '../AuditorModel.js';
