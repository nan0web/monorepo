/**
 * FormMessage – specialized UiMessage for forms.
 * It carries form-specific data and schema for validation.
 *
 * @class FormMessage
 * @extends UiMessage
 */
export default class FormMessage extends UiMessage {
    data: any;
    schema: any;
    /**
     * Returns a new FormMessage with merged data.
     *
     * @param {Object} newData - Data to merge.
     * @returns {FormMessage}
     */
    addData(newData: any): FormMessage;
    /**
     * Validates the provided data against the schema.
     *
     * @param {Object} data - Data to validate.
     * @returns {{isValid: boolean, errors: Object}}
     */
    validateData(data: any): {
        isValid: boolean;
        errors: any;
    };
}
import UiMessage from '../Message/Message.js';
