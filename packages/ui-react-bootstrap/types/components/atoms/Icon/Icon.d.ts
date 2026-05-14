export const iconMap: {
    telegram: any;
    facebook: any;
    instagram: any;
    youtube: any;
    viber: any;
    whatsapp: any;
    search: any;
    phone: any;
    mail: any;
    language: any;
    pin: any;
    mobile: any;
    bank: any;
    'credit-card': any;
    'shield-check': any;
    'info-circle': any;
    right: any;
    down: any;
    headset: any;
    calendar: any;
    clock: any;
    person: any;
    link: any;
    download: any;
    pdf: any;
    'caret-down': any;
    arrow: any;
};
export default Icon;
/**
 * Icon component - renders Font Awesome icons from react-icons.
 * @param {Object} props
 * @param {string} props.name - Icon name from the iconMap
 * @param {number} [props.size=20] - Icon size in pixels
 * @param {string} [props.className] - Optional CSS class
 */
declare function Icon({ name, size, className }: {
    name: string;
    size?: number;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
