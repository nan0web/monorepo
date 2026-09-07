/**
 * Abstract form for data entry.
 *
 * @class UIForm
 * @extends FormMessage
 * @property {FormInput[]} fields - Form fields.
 * @property {Object} state - Current form state (field values).
 * @property {string} title - Form title.
 * @property {Object} schema - Validation schema (optional).
 */
export default class UIForm extends FormMessage {
    /** @type {Object<string,Function>} */
    static _validations: {
        [x: string]: Function;
    };
    /**
     * Register a custom validation that can be referenced by name in a schema.
     *
     * @param {string} name - Identifier used in schema.validation.
     * @param {(value:any)=>true|string} fn - Function returns true if valid,
     *   otherwise returns an error message.
     */
    static addValidation(name: string, fn: (value: any) => true | string): void;
    /**
     * @param {*} input
     * @returns {UIForm}
     */
    static from(input: any): UIForm;
    /**
     * Auto‑generates form fields from a plain object.
     *
     * @param {Object} data - Example data object; its own enumerable keys become field names.
     * @param {Object<string, Partial<import("./Input.js").default>>} [overrides={}]
     *        Optional per‑field overrides (e.g. type, required, label).
     *
     * @returns {UIForm} Form with Array of `FormInput` instances as form.fields
     *
     * Example:
     *   const fields = generateFieldsFromObject({ name: "", age: 0 }, {
     *     age: { type: FormInput.TYPES.NUMBER, required: true }
     *   })
     */
    static parse(data: any, overrides?: {
        [x: string]: Partial<FormInput>;
    }): UIForm;
    /**
     * Create a new UIForm.
     *
     * @param {Object} [props={}] - Form properties.
     * @param {string} [props.title] - Form title.
     * @param {FormInput[]} [props.fields=[]] - Form fields.
     * @param {Object} [props.state={}] - Initial form state.
     * @param {Object} [props.schema] - Validation schema.
     */
    constructor(props?: {
        title?: string | undefined;
        fields?: FormInput[] | undefined;
        state?: any;
        schema?: any;
    });
    /** @type {FormInput[]} */ fields: FormInput[];
    /** @type {Object} */ state: any;
    /** @type {string} */ title: string;
    meta: {
        title: string;
        fields: any[];
        initialState: any;
    };
    /**
     * Returns a new UIForm instance with updated state.
     *
     * @param {Object} data - Partial state to merge.
     * @returns {UIForm}
     */
    setData(data: any): UIForm;
    /**
     * Retrieves a field definition by its name.
     *
     * @param {string} name - Field name.
     * @returns {FormInput|undefined}
     */
    getField(name: string): FormInput | undefined;
    /**
     * Returns current form values.
     *
     * @returns {Object}
     */
    getValues(): any;
    /**
     * Validates the entire form.
     *
     * @returns {any}
     */
    validate(): any;
    /**
     * Validates a single field.
     *
     * @param {string} fieldName - Name of the field.
     * @param {*} value - Value to validate.
     * @returns {{isValid: boolean, errors: Object}}
     */
    validateField(fieldName: string, value: any): {
        isValid: boolean;
        errors: any;
    };
    /**
     * Validates a value against a schema.
     *
     * @param {string} fieldName - Name of the field.
     * @param {*} value - Value to validate.
     * @param {Object} schema - Validation schema.
     * @returns {{isValid: boolean, errors: Object}}
     */
    validateValue(fieldName: string, value: any, schema: any): {
        isValid: boolean;
        errors: any;
    };
    /**
     * Serialises the form to a plain JSON object.
     *
     * @returns {Object}
     */
    toJSON(): any;
}
import FormMessage from './Message.js';
import FormInput from './Input.js';
