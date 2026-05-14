export default Email;
/**
 * Email link component - renders a clickable email address with optional icon.
 * @param {Object} props
 * @param {string} props.value - Email address to display and link
 * @param {string} [props.icon] - Optional icon name
 * @param {number} [props.iconSize=18] - Icon size
 * @param {string} [props.className] - Optional CSS class
 */
declare function Email({ value, icon, iconSize, className }: {
    value: string;
    icon?: string;
    iconSize?: number;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
