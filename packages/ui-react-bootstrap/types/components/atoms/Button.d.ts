/**
 * Bootstrap Button wrapper for declarative UI.
 */
declare function Button({ variant, size, outline, disabled, isLoading, icon, iconRight, children, style, ...props }: {
    [x: string]: any;
    variant?: string;
    size?: string;
    outline?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
    icon: any;
    iconRight?: boolean;
    children: any;
    style: any;
}): import("react/jsx-runtime").JSX.Element;
declare namespace Button {
    namespace propTypes {
        let variant: PropTypes.Requireable<string>;
        let size: PropTypes.Requireable<string>;
        let outline: PropTypes.Requireable<boolean>;
        let disabled: PropTypes.Requireable<boolean>;
        let children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        let style: PropTypes.Requireable<object>;
    }
}
export default Button;
import PropTypes from 'prop-types';
