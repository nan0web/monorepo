export default Accordion;
/**
 * Accordion component - collapsible content sections.
 * @param {Object} props
 * @param {Array} props.items - Array of {title, content} objects
 * @param {string} [props.defaultActiveKey] - Default open item
 */
declare function Accordion({ items, defaultActiveKey }: {
    items: any[];
    defaultActiveKey?: string;
}): import("react/jsx-runtime").JSX.Element;
