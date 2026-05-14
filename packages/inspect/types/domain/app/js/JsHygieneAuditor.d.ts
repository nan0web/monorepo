/**
 * JS-specific hygiene auditor.
 * Checks package.json scripts and standard JS configs.
 */
export class JsHygieneAuditor extends HygieneAuditor {
    /**
     * Gets a suggested script content based on project structure.
     * @param {string} script
     * @returns {string | null}
     * @private
     */
    private _getSuggestedScript;
}
import { HygieneAuditor } from '../HygieneAuditor.js';
