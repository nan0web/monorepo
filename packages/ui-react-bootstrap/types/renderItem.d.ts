/**
 * Converts a legacy `$layout` directive into a `$content` array.
 * This replaces the old EJS template system with data-driven rendering.
 * Each layout maps to a sequence of standard micro-components.
 */
export function layoutToContent(layout: any): string[] | {
    Blog: boolean;
}[];
/**
 * renderItem - Recursive renderer for content nodes from JSON/YAML
 * Can render standard HTML tags, components from registry, and our universal Blocks.
 *
 * @param {any} item - The current node to render
 * @param {number|string} index - Key for React rendering
 * @param {Object} sharedProps - Properties containing config, state and functions available to all items
 * @param {Object} [registry={}] - App-specific mappings for complex components (like 'Promo', 'Apps.List', etc)
 */
export function renderItem(item: any, index: number | string, sharedProps: any, registry?: any): any;
/**
 * Component version of the core Content Renderer
 */
export function Renderer({ doc, globals, locale, db, onNavigate, duty, registry }: {
    doc: any;
    globals: any;
    locale: any;
    db: any;
    onNavigate: any;
    duty: any;
    registry?: {};
}): import("react/jsx-runtime").JSX.Element;
