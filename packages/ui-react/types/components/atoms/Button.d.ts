/**
 * Button component.
 * Uses theme definition from ui-core if available (theme.atoms.Button),
 * otherwise falls back to local defaults.
 * Maps 'variants' to 'solid' and 'outlines' to 'outline' based on ui-core schema.
 */
declare function Button({ children, variant, outline, size, ...props }: {
    [x: string]: any;
    children: any;
    variant?: string | undefined;
    outline?: boolean | undefined;
    size?: string | undefined;
}): import("react/jsx-runtime").JSX.Element;
declare namespace Button {
    namespace propTypes {
        let children: PropTypes.Validator<NonNullable<PropTypes.ReactNodeLike>>;
        let variant: PropTypes.Requireable<string>;
        let outline: PropTypes.Requireable<boolean>;
        let size: PropTypes.Requireable<string>;
        let style: PropTypes.Requireable<object>;
        let disabled: PropTypes.Requireable<boolean>;
        let onKeyDown: PropTypes.Requireable<(...args: any[]) => any>;
        let onKeyUp: PropTypes.Requireable<(...args: any[]) => any>;
    }
    namespace defaultProps {
        let style_1: {};
        export { style_1 as style };
    }
}
export default Button;
import PropTypes from 'prop-types';
