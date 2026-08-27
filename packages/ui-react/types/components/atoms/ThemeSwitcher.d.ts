/**
 * Simple switcher to toggle between light and night (dark) theme.
 * Uses Button atom for consistent styling.
 *
 * @param {Object} props
 * @param {string} [props.label='Theme'] - Button label.
 * @param {Object} [props.style] - Additional styles.
 * @param {Function} [props.onClick] - Additional click handler.
 * @param {React.ReactNode} [props.children] - Children content (e.g. from Element text).
 */
declare function ThemeSwitcher({ label, style, onClick, children }?: {
    label?: string | undefined;
    style?: any;
    onClick?: Function | undefined;
    children?: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
declare namespace ThemeSwitcher {
    namespace propTypes {
        let label: PropTypes.Requireable<string>;
        let style: PropTypes.Requireable<object>;
        let onClick: PropTypes.Requireable<(...args: any[]) => any>;
        let children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
    }
}
export default ThemeSwitcher;
import React from 'react';
import PropTypes from 'prop-types';
