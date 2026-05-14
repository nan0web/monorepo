export default Address;
/**
 * Address component - renders semantic address markup with optional icon.
 * @param {Object} props
 * @param {string} props.value - Address string to display
 * @param {string} [props.icon] - Optional icon name
 * @param {number} [props.iconSize=18] - Icon size
 * @param {string} [props.className] - Optional CSS class
 */
declare function Address({ value, icon, iconSize, className }: {
    value: string;
    icon?: string;
    iconSize?: number;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
