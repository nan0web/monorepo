/**
 * @typedef {Object} Filter
 * @property {string} [q=""]
 * @property {number} [offset=0]
 * @property {number} [limit=36]
 */
/** @typedef {Array<string> | ((filter: Filter) => Promise<string[]>)} InputOptions */
/**
 * Form input field descriptor.
 *
 * @class FormInput
 * @property {string} name - Field name.
 * @property {string} label - Display label.
 * @property {string} type - Input type (text, email, number, select, etc.).
 * @property {boolean} required - Whether the field is required.
 * @property {string} placeholder - Placeholder text.
 * @property {InputOptions} options - Select options (if type is 'select').
 * @property {Function} validation - Custom validation function.
 * @property {string} mask - Mask pattern (e.g. '###-###').
 * @property {*} defaultValue - Default value.
 */
export default class FormInput {
    /**
     * Predefined input types.
     */
    static TYPES: {
        TEXT: string;
        EMAIL: string;
        NUMBER: string;
        SELECT: string;
        CHECKBOX: string;
        TEXTAREA: string;
        PASSWORD: string;
        SECRET: string;
        MASK: string;
        CONFIRM: string;
        TOGGLE: string;
        MULTISELECT: string;
        AUTOCOMPLETE: string;
    };
    /**
     * @param {*} input
     * @returns {FormInput}
     */
    static from(input: any): FormInput;
    /**
     * Create a new form input.
     *
     * @param {Object} props - Input properties.
     * @param {string} props.name - Field name.
     * @param {string} [props.label=props.name] - Display label.
     * @param {string} [props.type='text'] - Input type.
     * @param {boolean} [props.required=false] - Is required.
     * @param {string} [props.placeholder=''] - Placeholder.
     * @param {InputOptions} [props.options=[]] - Select options or async function to retrieve data with the search and page.
     * @param {Function} [props.validation] - Custom validation.
     * @param {string} [props.mask=''] - Mask pattern.
     * @param {*} [props.defaultValue=null] - Default value.
     */
    constructor(props: {
        name: string;
        label?: string | undefined;
        type?: string | undefined;
        required?: boolean | undefined;
        placeholder?: string | undefined;
        options?: InputOptions | undefined;
        validation?: Function | undefined;
        mask?: string | undefined;
        defaultValue?: any;
    });
    /** @type {string} */ name: string;
    /** @type {string} */ label: string;
    /** @type {string} */ type: string;
    /** @type {boolean} */ required: boolean;
    /** @type {string} */ placeholder: string;
    /** @type {InputOptions} */ options: InputOptions;
    /** @type {Function} */ validation: Function;
    /** @type {string} */ mask: string;
    /** @type {*} */ defaultValue: any;
    requireValidType(): void;
    /**
     * Serialises the input to a plain JSON object.
     *
     * @returns {Object}
     */
    toJSON(): any;
}
export type Filter = {
    q?: string | undefined;
    offset?: number | undefined;
    limit?: number | undefined;
};
export type InputOptions = Array<string> | ((filter: Filter) => Promise<string[]>);
