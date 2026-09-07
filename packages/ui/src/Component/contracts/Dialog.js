/**
 * @fileoverview Dialog and Progress UI Component Contracts.
 * Defines props, roles, and events for Dialog/Modal and Progress components.
 * Pure JavaScript with JSDoc typedefs for full TypeScript / IDE support.
 *
 * @module @nan0web/ui/Component/contracts/Dialog
 */

// ═══════════════════════════════════════════════════════════════════════════
// JSDOC TYPEDEFS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} DialogProps
 * @property {string} title - Title or question for the dialog prompt.
 * @property {string} content - Explanatory body or text.
 * @property {boolean} [open=true] - Visibility state.
 * @property {Array<import('./Interaction.js').ActionProps>} [actions] - Interactive decision buttons.
 */

/**
 * @typedef {'confirm' | 'cancel'} DialogEventName
 */

/**
 * @typedef {'running' | 'paused' | 'success' | 'failed'} ProgressStatus
 */

/**
 * @typedef {Object} ProgressProps
 * @property {number} [value] - Progress fraction (0 to 1) or percentage.
 * @property {number} [total] - Absolute total count (e.g. file count).
 * @property {string} [message] - Status text or stage name.
 * @property {ProgressStatus} [status='running'] - Current operation status.
 */

// ═══════════════════════════════════════════════════════════════════════════
// METADATA CONTRACT DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Dialog Component Contract (Alias: ModalContract).
 */
export const DialogContract = Object.freeze({
	name: 'Dialog',
	category: 'Dialog',
	props: ['title', 'content', 'open', 'actions'],
	slots: ['default'],
	events: ['confirm', 'cancel'],
})

export const ModalContract = DialogContract

/**
 * Progress Component Contract (Linear or Spinner).
 */
export const ProgressContract = Object.freeze({
	name: 'Progress',
	category: 'Dialog',
	props: ['value', 'total', 'message', 'status'],
	slots: [],
	events: [],
})
