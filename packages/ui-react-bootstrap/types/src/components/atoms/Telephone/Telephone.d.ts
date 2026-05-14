export default Telephone;
/**
 * Telephone link component - renders a clickable phone number with an optional icon.
 * @param {Object} props
 * @param {string} props.value - Phone number to display and link
 * @param {string} [props.icon] - Optional icon name
 * @param {number} [props.iconSize=18] - Icon size
 * @param {string} [props.className] - Optional CSS class
 */
declare function Telephone({ value, icon, iconSize, className }: {
    value: string;
    icon?: string;
    iconSize?: number;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
