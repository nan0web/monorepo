/**
 * @fileoverview Structure UI Component Contracts.
 * Defines props, slots, and events for Page, Nav, Sidebar, and Footer components.
 * Pure JavaScript with JSDoc typedefs for full TypeScript / IDE support.
 *
 * @module @nan0web/ui/Component/contracts/Structure
 */

// ═══════════════════════════════════════════════════════════════════════════
// JSDOC TYPEDEFS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} PageProps
 * @property {string} [title] - Page title for header and browser document.
 * @property {string} [lang] - Language code (e.g. 'uk', 'en').
 * @property {string} [theme] - Theme identifier (e.g. 'dark', 'light').
 */

/**
 * @typedef {'nav' | 'sidebar' | 'default' | 'footer'} PageSlotName
 */

/**
 * @typedef {Object} NavBrand
 * @property {string} title - Brand name or site title.
 * @property {string} [logo] - Image URL for brand logo.
 * @property {string} [url] - Navigation destination for brand link (default: '/').
 */

/**
 * @typedef {Object} NavItem
 * @property {string} label - Display label of the navigation link.
 * @property {string} url - Destination URL.
 * @property {boolean} [active] - Whether this link is currently active.
 * @property {string} [icon] - Icon identifier or SVG markup.
 * @property {NavItem[]} [children] - Nested dropdown items.
 */

/**
 * @typedef {Object} NavProps
 * @property {NavBrand} [brand] - Brand / logo information.
 * @property {NavItem[]} [items] - Navigation links array.
 */

/**
 * @typedef {'navigate' | 'toggle-menu'} NavEventName
 */

/**
 * @typedef {Object} SidebarItem
 * @property {string} label - Display title of the sidebar item.
 * @property {string} [url] - Target link URL.
 * @property {boolean} [active] - Active status flag.
 * @property {string} [icon] - Icon identifier or SVG string.
 * @property {SidebarItem[]} [children] - Nested sub-tree items.
 */

/**
 * @typedef {Object} SidebarProps
 * @property {string} [title] - Sidebar header title.
 * @property {SidebarItem[]} [items] - Tree or flat list of items.
 */

/**
 * @typedef {'select' | 'toggle'} SidebarEventName
 */

/**
 * @typedef {Object} FooterLink
 * @property {string} label - Link display title.
 * @property {string} url - Target URL.
 */

/**
 * @typedef {Object} FooterProps
 * @property {string} [copyright] - Copyright notice text.
 * @property {FooterLink[]} [links] - Footer navigation / social links.
 */

// ═══════════════════════════════════════════════════════════════════════════
// METADATA CONTRACT DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Page Component Contract.
 */
export const PageContract = Object.freeze({
	name: 'Page',
	category: 'Structure',
	props: ['title', 'lang', 'theme'],
	slots: ['nav', 'sidebar', 'default', 'footer'],
	events: [],
})

/**
 * Nav Component Contract.
 */
export const NavContract = Object.freeze({
	name: 'Nav',
	category: 'Structure',
	props: ['brand', 'items'],
	slots: ['default'],
	events: ['navigate', 'toggle-menu'],
})

/**
 * Sidebar Component Contract.
 */
export const SidebarContract = Object.freeze({
	name: 'Sidebar',
	category: 'Structure',
	props: ['title', 'items'],
	slots: [],
	events: ['select', 'toggle'],
})

/**
 * Footer Component Contract.
 */
export const FooterContract = Object.freeze({
	name: 'Footer',
	category: 'Structure',
	props: ['copyright', 'links'],
	slots: ['default'],
	events: [],
})
