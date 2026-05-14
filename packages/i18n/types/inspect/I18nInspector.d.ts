/**
 * I18nInspector — Validates i18n compliance across the project.
 * Scans for translation keys and verifies they exist in the vocabulary.
 */
export class I18nInspector extends AuditorModel {
    static UI: {
        title: string;
        scanning: string;
        missing_keys: string;
        untranslated_key: string;
        ok: string;
    };
    /**
     * @param {any} data
     * @param {any} options
     */
    constructor(data?: any, options?: any);
}
export default I18nInspector;
import { AuditorModel } from '@nan0web/inspect';
