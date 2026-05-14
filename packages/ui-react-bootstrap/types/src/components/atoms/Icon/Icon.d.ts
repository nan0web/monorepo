export const iconMap: {
    telegram: React.FC<{}>;
    facebook: React.FC<{}>;
    instagram: React.FC<{}>;
    youtube: React.FC<{}>;
    viber: React.FC<{}>;
    whatsapp: React.FC<{}>;
    search: React.FC<{}>;
    phone: React.FC<{}>;
    mail: React.FC<{}>;
    language: React.FC<{}>;
    pin: React.FC<{}>;
    mobile: React.FC<{}>;
    bank: React.FC<{}>;
    'credit-card': React.FC<{}>;
    'shield-check': React.FC<{}>;
    'info-circle': React.FC<{}>;
    right: React.FC<{}>;
    down: React.FC<{}>;
    headset: React.FC<{}>;
    calendar: React.FC<{}>;
    clock: React.FC<{}>;
    person: React.FC<{}>;
    link: React.FC<{}>;
    download: React.FC<{}>;
    pdf: React.FC<{}>;
    'caret-down': React.FC<{}>;
    arrow: React.FC<{}>;
};
export default Icon;
import React from 'react';
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
