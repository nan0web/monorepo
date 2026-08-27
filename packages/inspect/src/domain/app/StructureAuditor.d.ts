import { AuditorModel } from '../AuditorModel.js';
export declare class StructureAuditor extends AuditorModel {
    static UI: {
        checking: string;
        systemMdNotFound: string;
        systemMdFound: string;
        playgroundNotFound: string;
        playgroundFound: string;
    };
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
