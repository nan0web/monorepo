export class JsVerificationAuditor extends VerificationAuditor {
    /**
     * Inspect test files for structure standards (enforcing describe/it over flat test()).
     * @param {string[]} testFiles
     * @param {import('../VerificationAuditor.js').VerificationError[]} errors
     */
    inspectTestFiles(testFiles: string[], errors: import("../VerificationAuditor.js").VerificationError[]): AsyncGenerator<never, void, unknown>;
}
import { VerificationAuditor } from '../VerificationAuditor.js';
