import React from 'react';
import Icon from '../Icon/Icon';

/**
 * Telephone link component - renders a clickable phone number with an optional icon.
 * @param {Object} props
 * @param {string} props.value - Phone number to display and link
 * @param {string} [props.icon] - Optional icon name
 * @param {number} [props.iconSize=18] - Icon size
 * @param {string} [props.className] - Optional CSS class
 */
const Telephone = ({ value, icon = 'phone', iconSize = 18, className = '' }) => {
    if (!value) return null;
    const sanitized = value.replace(/[^\+\d]+/g, '');
    return (
        <a href={`tel:${sanitized}`} className={`text-decoration-none d-inline-flex align-items-center gap-2 ${className}`}>
            {icon && <Icon name={icon} size={iconSize} />}
            <span>{value}</span>
        </a>
    );
};

export default Telephone;
