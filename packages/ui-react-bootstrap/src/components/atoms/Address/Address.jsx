import React from 'react';
import Icon from '../Icon/Icon';

/**
 * Address component - renders semantic address markup with optional icon.
 * @param {Object} props
 * @param {string} props.value - Address string to display
 * @param {string} [props.icon] - Optional icon name
 * @param {number} [props.iconSize=18] - Icon size
 * @param {string} [props.className] - Optional CSS class
 */
const Address = ({ value, icon = 'pin', iconSize = 18, className = '' }) => {
    if (!value) return null;
    return (
        <address className={`d-inline-flex align-items-start gap-2 mb-0 ${className}`}>
            {icon && <Icon name={icon} size={iconSize} className="mt-1 text-primary" />}
            <span>{value}</span>
        </address>
    );
};

export default Address;
