export class StructureAuditor extends AuditorModel {
    static UI: {
        checking: string;
        systemMdNotFound: string;
        systemMdFound: string;
        playgroundNotFound: string;
        playgroundFound: string;
    };
    run(): AsyncGenerator<import("../../../../ui/types/core/Intent.js").ProgressIntent, import("../../../../ui/types/core/Intent.js").ResultIntent, unknown>;
}
import { AuditorModel } from '../AuditorModel.js';
