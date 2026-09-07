/**
 * @fileoverview Structure UI Component Contracts.
 * Defines props, slots, and events for Page, Nav, Sidebar, and Footer components.
 * Pure JavaScript with JSDoc typedefs for full TypeScript / IDE support.
 *
 * @module @nan0web/ui/Component/contracts/Structure
 */
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
/**
 * Page Component Contract.
 */
export const PageContract: Readonly<{
    name: "Page";
    category: "Structure";
    props: string[];
    slots: string[];
    events: never[];
}>;
/**
 * Nav Component Contract.
 */
export const NavContract: Readonly<{
    name: "Nav";
    category: "Structure";
    props: string[];
    slots: string[];
    events: string[];
}>;
/**
 * Sidebar Component Contract.
 */
export const SidebarContract: Readonly<{
    name: "Sidebar";
    category: "Structure";
    props: string[];
    slots: never[];
    events: string[];
}>;
/**
 * Footer Component Contract.
 */
export const FooterContract: Readonly<{
    name: "Footer";
    category: "Structure";
    props: string[];
    slots: string[];
    events: never[];
}>;
export type PageProps = {
    /**
     * - Page title for header and browser document.
     */
    title?: string | undefined;
    /**
     * - Language code (e.g. 'uk', 'en').
     */
    lang?: string | undefined;
    /**
     * - Theme identifier (e.g. 'dark', 'light').
     */
    theme?: string | undefined;
};
export type PageSlotName = "nav" | "sidebar" | "default" | "footer";
export type NavBrand = {
    /**
     * - Brand name or site title.
     */
    title: string;
    /**
     * - Image URL for brand logo.
     */
    logo?: string | undefined;
    /**
     * - Navigation destination for brand link (default: '/').
     */
    url?: string | undefined;
};
export type NavItem = {
    /**
     * - Display label of the navigation link.
     */
    label: string;
    /**
     * - Destination URL.
     */
    url: string;
    /**
     * - Whether this link is currently active.
     */
    active?: boolean | undefined;
    /**
     * - Icon identifier or SVG markup.
     */
    icon?: string | undefined;
    /**
     * - Nested dropdown items.
     */
    children?: NavItem[] | undefined;
};
export type NavProps = {
    /**
     * - Brand / logo information.
     */
    brand?: NavBrand | undefined;
    /**
     * - Navigation links array.
     */
    items?: NavItem[] | undefined;
};
export type NavEventName = "navigate" | "toggle-menu";
export type SidebarItem = {
    /**
     * - Display title of the sidebar item.
     */
    label: string;
    /**
     * - Target link URL.
     */
    url?: string | undefined;
    /**
     * - Active status flag.
     */
    active?: boolean | undefined;
    /**
     * - Icon identifier or SVG string.
     */
    icon?: string | undefined;
    /**
     * - Nested sub-tree items.
     */
    children?: SidebarItem[] | undefined;
};
export type SidebarProps = {
    /**
     * - Sidebar header title.
     */
    title?: string | undefined;
    /**
     * - Tree or flat list of items.
     */
    items?: SidebarItem[] | undefined;
};
export type SidebarEventName = "select" | "toggle";
export type FooterLink = {
    /**
     * - Link display title.
     */
    label: string;
    /**
     * - Target URL.
     */
    url: string;
};
export type FooterProps = {
    /**
     * - Copyright notice text.
     */
    copyright?: string | undefined;
    /**
     * - Footer navigation / social links.
     */
    links?: FooterLink[] | undefined;
};
