/**
 * OlmuiThemingAuditor — Auditor for OLMUI theming standard compliance.
 * Polymorphically delegates execution to JS or Python subclasses.
 */
export class OlmuiThemingAuditor extends AuditorModel {
    static UI: {
        title: string;
        description: string;
        icon: string;
        starting: string;
        noFiles: string;
        doneSuccess: string;
        doneErrors: string;
        auditPassed: string;
        auditFailed: string;
        errorDb: string;
        errorColor: string;
        errorSize: string;
    };
}
export default OlmuiThemingAuditor;
import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel';
