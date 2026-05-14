/**
 * Renderer for Modal component.
 * Manages isOpen state and renders a trigger button + the Modal component.
 *
 * @param {object} [props]
 * @param {object} [props.element] - Raw element input
 * @param {object} [props.context] - UI Context
 * @param {any} [props.data] - Data prop for the modal
 * @param {boolean} [props.isOpen] - Initial open state
 * @param {Function} [props.onClose] - Callback for closing the modal
 * @param {string} [props.triggerText] - Text for the trigger button
 * @param {React.ReactNode} [props.children] - Children to render inside the modal
 * @param {React.ReactNode} [props.content] - Content to render inside the modal
 * @param {React.ReactNode} [props.$content] - Content to render inside the modal (alternative)
 * @returns {React.ReactNode} Rendered modal with trigger
 */
declare function renderModal(props?: {
    element?: object;
    context?: object;
    data?: any;
    isOpen?: boolean | undefined;
    onClose?: Function | undefined;
    triggerText?: string | undefined;
    children?: React.ReactNode;
    content?: React.ReactNode;
    $content?: React.ReactNode;
}): React.ReactNode;
declare namespace renderModal {
    namespace propTypes {
        let element: PropTypes.Requireable<any>;
        let context: PropTypes.Requireable<object>;
        let data: PropTypes.Requireable<any>;
        let isOpen: PropTypes.Requireable<boolean>;
        let onClose: PropTypes.Requireable<(...args: any[]) => any>;
        let triggerText: PropTypes.Requireable<string>;
        let children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        let content: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        let $content: PropTypes.Requireable<PropTypes.ReactNodeLike>;
    }
}
export default renderModal;
import React from 'react';
import PropTypes from 'prop-types';
