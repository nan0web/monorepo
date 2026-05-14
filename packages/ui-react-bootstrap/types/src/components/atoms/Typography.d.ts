declare function Typography({ variant, children, style, ...props }: {
    [x: string]: any;
    variant?: string;
    children: any;
    style: any;
}): import("react/jsx-runtime").JSX.Element;
declare namespace Typography {
    namespace propTypes {
        let variant: PropTypes.Requireable<string>;
        let children: PropTypes.Validator<NonNullable<PropTypes.ReactNodeLike>>;
        let style: PropTypes.Requireable<object>;
    }
}
export default Typography;
import PropTypes from 'prop-types';
