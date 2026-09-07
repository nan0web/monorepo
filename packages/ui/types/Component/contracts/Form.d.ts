export * from "./Interaction.js";
/**
 * @typedef {'Input' | 'Choice' | 'Table' | 'Markdown' | 'Dialog'} FormFieldTargetContract
 */
/**
 * @typedef {Object} FormFieldContract
 * @property {string} name - Field name in the Model schema.
 * @property {string} label - Localized field label.
 * @property {FormFieldTargetContract} contract - Target interaction contract.
 * @property {string | Function | Array<Function>} [type] - Base type ('string', 'number', CategoryModel, [Attachment]).
 * @property {any} [default] - Default value.
 * @property {boolean} [required] - Mandatory field flag.
 * @property {import('./Interaction.js').FieldOptions} [options] - Static options or dynamic resolver.
 * @property {Function} [model] - Target model constructor for relationships.
 * @property {boolean} [multiple] - Multiple choice / HasMany flag.
 * @property {string} [hint] - Hint for widget specialization.
 * @property {(val: any) => true | string} [validate] - Validation rule function.
 */
/**
 * @typedef {Object} FormProps
 * @property {string} [title] - Form title.
 * @property {FormFieldContract[]} fields - Converted model fields.
 * @property {Record<string, any>} [initialState] - Initial form state.
 * @property {string} [submitLabel] - Submit button label.
 * @property {string} [cancelLabel] - Cancel button label.
 * @property {boolean} [disabled] - Form disabled flag.
 * @property {boolean} [loading] - Loading indicator flag.
 */
/**
 * @typedef {'submit' | 'change' | 'cancel'} FormEventName
 */
/**
 * Form Orchestration Contract.
 */
export const FormContract: Readonly<{
    name: "Form";
    category: "Form";
    props: string[];
    slots: string[];
    events: string[];
}>;
export type FormFieldTargetContract = "Input" | "Choice" | "Table" | "Markdown" | "Dialog";
export type FormFieldContract = {
    /**
     * - Field name in the Model schema.
     */
    name: string;
    /**
     * - Localized field label.
     */
    label: string;
    /**
     * - Target interaction contract.
     */
    contract: FormFieldTargetContract;
    /**
     * - Base type ('string', 'number', CategoryModel, [Attachment]).
     */
    type?: string | Function | Function[] | undefined;
    /**
     * - Default value.
     */
    default?: any;
    /**
     * - Mandatory field flag.
     */
    required?: boolean | undefined;
    /**
     * - Static options or dynamic resolver.
     */
    options?: import("./Interaction.js").FieldOptions | undefined;
    /**
     * - Target model constructor for relationships.
     */
    model?: Function | undefined;
    /**
     * - Multiple choice / HasMany flag.
     */
    multiple?: boolean | undefined;
    /**
     * - Hint for widget specialization.
     */
    hint?: string | undefined;
    /**
     * - Validation rule function.
     */
    validate?: ((val: any) => true | string) | undefined;
};
export type FormProps = {
    /**
     * - Form title.
     */
    title?: string | undefined;
    /**
     * - Converted model fields.
     */
    fields: FormFieldContract[];
    /**
     * - Initial form state.
     */
    initialState?: Record<string, any> | undefined;
    /**
     * - Submit button label.
     */
    submitLabel?: string | undefined;
    /**
     * - Cancel button label.
     */
    cancelLabel?: string | undefined;
    /**
     * - Form disabled flag.
     */
    disabled?: boolean | undefined;
    /**
     * - Loading indicator flag.
     */
    loading?: boolean | undefined;
};
export type FormEventName = "submit" | "change" | "cancel";
