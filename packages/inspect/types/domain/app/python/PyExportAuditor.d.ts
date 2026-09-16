export class PyExportAuditor extends ExportAuditor {
    /**
     * @param {import('../ExportAuditor.js').ExportError[]} errors
     * @param {import('@nan0web/i18n').TFunction} t
     * @param {Function} fileExists
     * @param {Function} dirExists
     * @param {Function} readText
     */
    checkPlatformExports(errors: import("../ExportAuditor.js").ExportError[], t: import("@nan0web/i18n").TFunction, fileExists: Function, dirExists: Function, readText: Function): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, void, unknown>;
}
import { ExportAuditor } from '../ExportAuditor.js';
