/**
 * @fileoverview Form UI Component Contracts.
 * Defines props, roles, and events for Form and FormField contracts.
 * Pure JavaScript with JSDoc typedefs for full TypeScript / IDE support.
 *
 * @module @nan0web/ui/Component/contracts/Form
 */

export * from './Interaction.js'

// ═══════════════════════════════════════════════════════════════════════════
// JSDOC TYPEDEFS
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// METADATA CONTRACT DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Form Orchestration Contract.
 */
export const FormContract = Object.freeze({
	name: 'Form',
	category: 'Form',
	props: ['title', 'fields', 'initialState', 'submitLabel', 'cancelLabel', 'disabled', 'loading'],
	slots: ['default'],
	events: ['submit', 'change', 'cancel'],
})
