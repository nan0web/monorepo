declare function Modal({ isOpen, onClose, children, ...props }: {
    [x: string]: any;
    isOpen: any;
    onClose: any;
    children: any;
}): import("react/jsx-runtime").JSX.Element;
declare namespace Modal {
    namespace propTypes {
        let isOpen: PropTypes.Validator<boolean>;
        let onClose: PropTypes.Validator<(...args: any[]) => any>;
        let children: PropTypes.Validator<NonNullable<PropTypes.ReactNodeLike>>;
    }
}
export default Modal;
import PropTypes from 'prop-types';
