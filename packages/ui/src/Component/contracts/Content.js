/**
 * @fileoverview Content UI Component Contracts.
 * Defines props, slots, and events for Markdown, Alert, Badge, and Table components.
 * Pure JavaScript with JSDoc typedefs for full TypeScript / IDE support.
 *
 * @module @nan0web/ui/Component/contracts/Content
 */

// ═══════════════════════════════════════════════════════════════════════════
// JSDOC TYPEDEFS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} MarkdownProps
 * @property {string} content - Markdown source string to render.
 * @property {boolean} [toc] - Whether to generate Table of Contents.
 * @property {string} [baseUrl] - Optional base URL for resolving relative links.
 */

/**
 * @typedef {'info' | 'warn' | 'warning' | 'error' | 'err' | 'danger' | 'success' | 'ok' | 'tip'} AlertVariant
 */

/**
 * @typedef {Object} AlertProps
 * @property {AlertVariant} [variant] - Alert visual style variant (default: 'info').
 * @property {string} [title] - Optional heading / title.
 * @property {string} content - Alert message body text or markdown.
 * @property {boolean} [open] - Visibility state.
 * @property {string} [icon] - Custom icon identifier or SVG.
 */

/**
 * @typedef {'close'} AlertEventName
 */

/**
 * @typedef {'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline'} BadgeVariant
 */

/**
 * @typedef {Object} BadgeProps
 * @property {string} label - Badge text label.
 * @property {BadgeVariant | string} [variant] - Style variant (default: 'default').
 */

/**
 * @typedef {Object} TableColumn
 * @property {string} key - Property key in row object.
 * @property {string} label - Header display text.
 * @property {'left' | 'center' | 'right'} [align] - Cell alignment.
 * @property {number} [width] - Explicit column width.
 */

/**
 * @typedef {Object} TableProps
 * @property {TableColumn[]} [columns] - Explicit column definitions.
 * @property {Array<Record<string, any>>} [rows] - Array of row objects.
 * @property {Array<Record<string, any>>} [data] - Alias for rows.
 * @property {string} [keyField] - Unique identifier field per row.
 */

// ═══════════════════════════════════════════════════════════════════════════
// METADATA CONTRACT DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Markdown Component Contract.
 */
export const MarkdownContract = Object.freeze({
	name: 'Markdown',
	category: 'Content',
	props: ['content', 'toc', 'baseUrl'],
	slots: [],
	events: [],
})

/**
 * Alert Component Contract.
 */
export const AlertContract = Object.freeze({
	name: 'Alert',
	category: 'Content',
	props: ['variant', 'title', 'content', 'open', 'icon'],
	slots: ['default'],
	events: ['close'],
})

/**
 * Badge Component Contract.
 */
export const BadgeContract = Object.freeze({
	name: 'Badge',
	category: 'Content',
	props: ['label', 'variant'],
	slots: [],
	events: [],
})

/**
 * Table Component Contract.
 */
export const TableContract = Object.freeze({
	name: 'Table',
	category: 'Content',
	props: ['columns', 'rows', 'data', 'keyField'],
	slots: [],
	events: ['sort', 'row-click'],
})
