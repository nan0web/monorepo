/**
 * @param {Object} props
 * @param {'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'body'|'small'|'caption'} [props.variant='body']
 * @param {React.ReactNode} props.children
 * @param {React.CSSProperties} [props.style]
 */
declare function Typography({ variant, children, ...props }: {
    variant?: "body" | "caption" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "small" | undefined;
    children: React.ReactNode;
    style?: React.CSSProperties | undefined;
}): React.ReactElement<{
    style: any;
}, string | React.JSXElementConstructor<any>>;
declare namespace Typography {
    namespace propTypes {
        let variant: PropTypes.Requireable<string>;
        let children: PropTypes.Validator<NonNullable<PropTypes.ReactNodeLike>>;
        let style: PropTypes.Requireable<object>;
    }
}
export default Typography;
import React from 'react';
import PropTypes from 'prop-types';
