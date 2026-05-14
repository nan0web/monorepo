import React from 'react';
import Icon from '../Icon/Icon';

/**
 * Email link component - renders a clickable email address with optional icon.
 * @param {Object} props
 * @param {string} props.value - Email address to display and link
 * @param {string} [props.icon] - Optional icon name
 * @param {number} [props.iconSize=18] - Icon size
 * @param {string} [props.className] - Optional CSS class
 */
const Email = ({ value, icon = 'mail', iconSize = 18, className = '' }) => {
    if (!value) return null;
    return (
        <a href={`mailto:${value}`} className={`text-decoration-none d-inline-flex align-items-center gap-2 ${className}`}>
            {icon && <Icon name={icon} size={iconSize} />}
            <span>{value}</span>
        </a>
    );
};

export default Email;
