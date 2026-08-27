/**
 * Modal – overlay dialog with sensible defaults.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {React.ReactNode} props.children
 * @param {Object} [props.style] - additional inline styles for the modal window
 */
declare function Modal({ isOpen, onClose, children, style, ...props }: {
    isOpen: boolean;
    onClose: Function;
    children: React.ReactNode;
    style?: any;
}): import("react/jsx-runtime").JSX.Element | null;
declare namespace Modal {
    namespace propTypes {
        let isOpen: PropTypes.Validator<boolean>;
        let onClose: PropTypes.Validator<(...args: any[]) => any>;
        let children: PropTypes.Validator<NonNullable<PropTypes.ReactNodeLike>>;
        let style: PropTypes.Requireable<object>;
    }
}
export default Modal;
import React from 'react';
import PropTypes from 'prop-types';
