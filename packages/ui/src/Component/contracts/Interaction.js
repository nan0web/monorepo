/**
 * @fileoverview Interaction UI Component Contracts.
 * Defines props, roles, and events for Action (Button), Input, and Choice (Select) components.
 * Pure JavaScript with JSDoc typedefs for full TypeScript / IDE support.
 *
 * @module @nan0web/ui/Component/contracts/Interaction
 */

// ═══════════════════════════════════════════════════════════════════════════
// JSDOC TYPEDEFS
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// METADATA CONTRACT DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Action Component Contract (Alias: ButtonContract).
 */
export const ActionContract = Object.freeze({
	name: 'Action',
	category: 'Interaction',
	props: ['label', 'action', 'variant', 'role', 'disabled', 'icon', 'shortcut'],
	slots: ['default'],
	events: ['trigger', 'click'],
})

export const ButtonContract = ActionContract

/**
 * Input Component Contract.
 */
export const InputContract = Object.freeze({
	name: 'Input',
	category: 'Interaction',
	props: ['name', 'label', 'type', 'value', 'placeholder', 'required', 'disabled', 'error'],
	slots: [],
	events: ['change', 'input', 'submit', 'focus', 'blur'],
})

/**
 * Choice Component Contract (Alias: SelectContract).
 */
export const ChoiceContract = Object.freeze({
	name: 'Choice',
	category: 'Interaction',
	props: ['name', 'label', 'options', 'value', 'multiple', 'placeholder', 'required', 'disabled'],
	slots: [],
	events: ['change'],
})

export const SelectContract = ChoiceContract
