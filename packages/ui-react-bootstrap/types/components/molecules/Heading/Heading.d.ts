export default Heading;
/**
 * Heading component - renders page heading with optional description.
 * @param {Object} props
 * @param {string} props.title - Heading title
 * @param {string} [props.description] - Optional description
 * @param {string} [props.tag='h1'] - HTML tag to use (h1, h2, etc.)
 * @param {string} [props.className] - Optional CSS class
 */
declare function Heading({ title: propTitle, description: propDescription, tag: Tag, className }: {
    title: string;
    description?: string;
    tag?: string;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
