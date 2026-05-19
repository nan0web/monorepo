/**
 * IntentAuditor — Base model for OLMUI Intent hygiene audits.
 * Polymorphically delegates execution to JS or Python subclasses.
 */
export class IntentAuditor extends AuditorModel {
    static UI: {
        title: string;
        description: string;
        icon: string;
        starting: string;
        auditPassed: string;
        auditFailed: string;
        doneSuccess: string;
        doneErrors: string;
        errorDb: string;
        errorConsoleLeak: string;
        errorProcessLeak: string;
        errorPrintLeak: string;
        errorSysWriteLeak: string;
    };
}
export default IntentAuditor;
import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel';
