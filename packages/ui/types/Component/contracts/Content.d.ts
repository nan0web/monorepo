/**
 * @fileoverview Content UI Component Contracts.
 * Defines props, slots, and events for Markdown, Alert, Badge, and Table components.
 * Pure JavaScript with JSDoc typedefs for full TypeScript / IDE support.
 *
 * @module @nan0web/ui/Component/contracts/Content
 */
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
/**
 * Markdown Component Contract.
 */
export const MarkdownContract: Readonly<{
    name: "Markdown";
    category: "Content";
    props: string[];
    slots: never[];
    events: never[];
}>;
/**
 * Alert Component Contract.
 */
export const AlertContract: Readonly<{
    name: "Alert";
    category: "Content";
    props: string[];
    slots: string[];
    events: string[];
}>;
/**
 * Badge Component Contract.
 */
export const BadgeContract: Readonly<{
    name: "Badge";
    category: "Content";
    props: string[];
    slots: never[];
    events: never[];
}>;
/**
 * Table Component Contract.
 */
export const TableContract: Readonly<{
    name: "Table";
    category: "Content";
    props: string[];
    slots: never[];
    events: string[];
}>;
export type MarkdownProps = {
    /**
     * - Markdown source string to render.
     */
    content: string;
    /**
     * - Whether to generate Table of Contents.
     */
    toc?: boolean | undefined;
    /**
     * - Optional base URL for resolving relative links.
     */
    baseUrl?: string | undefined;
};
export type AlertVariant = "info" | "warn" | "warning" | "error" | "err" | "danger" | "success" | "ok" | "tip";
export type AlertProps = {
    /**
     * - Alert visual style variant (default: 'info').
     */
    variant?: AlertVariant | undefined;
    /**
     * - Optional heading / title.
     */
    title?: string | undefined;
    /**
     * - Alert message body text or markdown.
     */
    content: string;
    /**
     * - Visibility state.
     */
    open?: boolean | undefined;
    /**
     * - Custom icon identifier or SVG.
     */
    icon?: string | undefined;
};
export type AlertEventName = "close";
export type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "outline";
export type BadgeProps = {
    /**
     * - Badge text label.
     */
    label: string;
    /**
     * - Style variant (default: 'default').
     */
    variant?: string | undefined;
};
export type TableColumn = {
    /**
     * - Property key in row object.
     */
    key: string;
    /**
     * - Header display text.
     */
    label: string;
    /**
     * - Cell alignment.
     */
    align?: "left" | "center" | "right" | undefined;
    /**
     * - Explicit column width.
     */
    width?: number | undefined;
};
export type TableProps = {
    /**
     * - Explicit column definitions.
     */
    columns?: TableColumn[] | undefined;
    /**
     * - Array of row objects.
     */
    rows?: Record<string, any>[] | undefined;
    /**
     * - Alias for rows.
     */
    data?: Record<string, any>[] | undefined;
    /**
     * - Unique identifier field per row.
     */
    keyField?: string | undefined;
};
