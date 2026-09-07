/**
 * @fileoverview Interaction UI Component Contracts.
 * Defines props, roles, and events for Action (Button), Input, and Choice (Select) components.
 * Pure JavaScript with JSDoc typedefs for full TypeScript / IDE support.
 *
 * @module @nan0web/ui/Component/contracts/Interaction
 */
/**
 * @typedef {'primary' | 'secondary' | 'danger' | 'ghost' | 'brand' | 'default'} ActionVariant
 */
/**
 * @typedef {'action' | 'submit' | 'cancel'} ActionRole
 */
/**
 * @typedef {Object} ActionProps
 * @property {string} label - Action text for display, speech synthesis, or quick command.
 * @property {string} [action] - Intent identifier or command code.
 * @property {ActionVariant | string} [variant='primary'] - Visual styling variant.
 * @property {ActionRole} [role='action'] - Semantic role.
 * @property {boolean} [disabled] - Disabled state flag.
 * @property {string} [icon] - Icon identifier or SVG markup.
 * @property {string} [shortcut] - Keyboard shortcut or voice trigger phrase.
 */
/**
 * @typedef {'trigger' | 'click'} ActionEventName
 */
/**
 * @typedef {'text' | 'number' | 'secret' | 'search' | 'multiline' | 'email' | 'tel' | 'url' | 'password'} InputType
 */
/**
 * @typedef {Object} InputProps
 * @property {string} name - Field name identifier in the model.
 * @property {string} [label] - Field label text.
 * @property {InputType | string} [type='text'] - Semantic input type.
 * @property {any} [value] - Current field value.
 * @property {string} [placeholder] - Placeholder text hint.
 * @property {boolean} [required] - Whether input is mandatory.
 * @property {boolean} [disabled] - Whether input is disabled.
 * @property {string} [error] - Validation error message or translation key.
 */
/**
 * @typedef {'change' | 'input' | 'submit' | 'focus' | 'blur'} InputEventName
 */
/**
 * Single option object:
 * @typedef {Object} OptionObject
 * @property {string} label - Text label of option for display / voice synthesis.
 * @property {any} value - Underlying value of option.
 * @property {string} [hint] - Extra hint for voice assistant or CLI help.
 * @property {boolean} [disabled] - Whether this specific option is disabled.
 * @property {string} [icon] - Icon identifier.
 */
/**
 * Asynchronous or synchronous option resolver:
 * @typedef {(query?: string, ctx?: { db?: any, model?: Function }) => Promise<OptionObject[]> | OptionObject[]} OptionResolver
 */
/**
 * Unified field options:
 * @typedef {OptionObject[] | OptionResolver} FieldOptions
 */
/**
 * @typedef {Object} ChoiceProps
 * @property {string} name - Field name identifier.
 * @property {string} [label] - Question or prompt label.
 * @property {FieldOptions} options - Selectable options or dynamic resolver.
 * @property {any} [value] - Currently selected value(s).
 * @property {boolean} [multiple] - Multiple choice allowed flag.
 * @property {boolean} [required] - Whether choice is mandatory.
 * @property {boolean} [disabled] - Whether component is disabled.
 * @property {string} [placeholder] - Placeholder text for empty choice.
 */
/**
 * @typedef {'change'} ChoiceEventName
 */
/**
 * Action Component Contract (Alias: ButtonContract).
 */
export const ActionContract: Readonly<{
    name: "Action";
    category: "Interaction";
    props: string[];
    slots: string[];
    events: string[];
}>;
export const ButtonContract: Readonly<{
    name: "Action";
    category: "Interaction";
    props: string[];
    slots: string[];
    events: string[];
}>;
/**
 * Input Component Contract.
 */
export const InputContract: Readonly<{
    name: "Input";
    category: "Interaction";
    props: string[];
    slots: never[];
    events: string[];
}>;
/**
 * Choice Component Contract (Alias: SelectContract).
 */
export const ChoiceContract: Readonly<{
    name: "Choice";
    category: "Interaction";
    props: string[];
    slots: never[];
    events: string[];
}>;
export const SelectContract: Readonly<{
    name: "Choice";
    category: "Interaction";
    props: string[];
    slots: never[];
    events: string[];
}>;
export type ActionVariant = "primary" | "secondary" | "danger" | "ghost" | "brand" | "default";
export type ActionRole = "action" | "submit" | "cancel";
export type ActionProps = {
    /**
     * - Action text for display, speech synthesis, or quick command.
     */
    label: string;
    /**
     * - Intent identifier or command code.
     */
    action?: string | undefined;
    /**
     * - Visual styling variant.
     */
    variant?: string | undefined;
    /**
     * - Semantic role.
     */
    role?: ActionRole | undefined;
    /**
     * - Disabled state flag.
     */
    disabled?: boolean | undefined;
    /**
     * - Icon identifier or SVG markup.
     */
    icon?: string | undefined;
    /**
     * - Keyboard shortcut or voice trigger phrase.
     */
    shortcut?: string | undefined;
};
export type ActionEventName = "trigger" | "click";
export type InputType = "text" | "number" | "secret" | "search" | "multiline" | "email" | "tel" | "url" | "password";
export type InputProps = {
    /**
     * - Field name identifier in the model.
     */
    name: string;
    /**
     * - Field label text.
     */
    label?: string | undefined;
    /**
     * - Semantic input type.
     */
    type?: string | undefined;
    /**
     * - Current field value.
     */
    value?: any;
    /**
     * - Placeholder text hint.
     */
    placeholder?: string | undefined;
    /**
     * - Whether input is mandatory.
     */
    required?: boolean | undefined;
    /**
     * - Whether input is disabled.
     */
    disabled?: boolean | undefined;
    /**
     * - Validation error message or translation key.
     */
    error?: string | undefined;
};
export type InputEventName = "change" | "input" | "submit" | "focus" | "blur";
/**
 * Single option object:
 */
export type OptionObject = {
    /**
     * - Text label of option for display / voice synthesis.
     */
    label: string;
    /**
     * - Underlying value of option.
     */
    value: any;
    /**
     * - Extra hint for voice assistant or CLI help.
     */
    hint?: string | undefined;
    /**
     * - Whether this specific option is disabled.
     */
    disabled?: boolean | undefined;
    /**
     * - Icon identifier.
     */
    icon?: string | undefined;
};
/**
 * Asynchronous or synchronous option resolver:
 */
export type OptionResolver = (query?: string, ctx?: {
    db?: any;
    model?: Function;
}) => Promise<OptionObject[]> | OptionObject[];
/**
 * Unified field options:
 */
export type FieldOptions = OptionObject[] | OptionResolver;
export type ChoiceProps = {
    /**
     * - Field name identifier.
     */
    name: string;
    /**
     * - Question or prompt label.
     */
    label?: string | undefined;
    /**
     * - Selectable options or dynamic resolver.
     */
    options: FieldOptions;
    /**
     * - Currently selected value(s).
     */
    value?: any;
    /**
     * - Multiple choice allowed flag.
     */
    multiple?: boolean | undefined;
    /**
     * - Whether choice is mandatory.
     */
    required?: boolean | undefined;
    /**
     * - Whether component is disabled.
     */
    disabled?: boolean | undefined;
    /**
     * - Placeholder text for empty choice.
     */
    placeholder?: string | undefined;
};
export type ChoiceEventName = "change";
