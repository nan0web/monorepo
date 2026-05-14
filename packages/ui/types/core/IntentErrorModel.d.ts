export class IntentErrorModel {
    static intent_not_object: {
        help: string;
        error: string;
    };
    static intent_unknown_type: {
        help: string;
        error: string;
    };
    static ask_missing_field: {
        help: string;
        error: string;
    };
    static ask_missing_schema_help: {
        help: string;
        error: string;
    };
    static intent_missing_message: {
        help: string;
        error: string;
    };
    static render_missing_component: {
        help: string;
        error: string;
    };
    static adapter_missing_ask: {
        help: string;
        error: string;
    };
    static ask_wrong_response: {
        help: string;
        error: string;
    };
    static validation_failed: {
        help: string;
        error: string;
    };
    static unhandled_intent: {
        help: string;
        error: string;
    };
    static timeout: {
        help: string;
        error: string;
    };
    static aborted: {
        help: string;
        error: string;
    };
    /**
     * Build a ModelError for a specific error field.
     *
     * @param {string} field - Static field name on IntentErrorModel.
     * @param {Record<string, *>} [params] - Template parameters to substitute {key} placeholders.
     * @returns {ModelError}
     */
    static error(field: string, params?: Record<string, any>): ModelError;
}
import { ModelError } from '@nan0web/types';
