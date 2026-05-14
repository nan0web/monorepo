/**
 * Renderer for Button component.
 * Maps 'button' type from data to Button atom.
 * Handles content extraction from element value or props.
 *
 * @param {object} props
 * @param {object} props.element - Raw element definition (e.g. { button: "Click me" })
 * @param {object} props.context - UI Context
 * @returns {React.ReactNode} Rendered button
 */
declare function renderButton(props: {
    element: object;
    context: object;
}): React.ReactNode;
declare namespace renderButton {
    namespace propTypes {
        let element: PropTypes.Requireable<any>;
        let context: PropTypes.Requireable<object>;
        let children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        let content: PropTypes.Requireable<PropTypes.ReactNodeLike>;
    }
}
export default renderButton;
import React from 'react';
import PropTypes from 'prop-types';
