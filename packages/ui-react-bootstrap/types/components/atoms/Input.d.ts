/**
 * Bootstrap Input wrapper with mask support.
 */
declare function Input({ type, mask, label, help, ...props }: {
    [x: string]: any;
    type?: string;
    mask: any;
    label: any;
    help: any;
}): import("react/jsx-runtime").JSX.Element;
declare namespace Input {
    namespace propTypes {
        let type: PropTypes.Requireable<string>;
        let placeholder: PropTypes.Requireable<string>;
        let as: PropTypes.Requireable<string>;
        let style: PropTypes.Requireable<object>;
    }
}
export default Input;
import PropTypes from 'prop-types';
