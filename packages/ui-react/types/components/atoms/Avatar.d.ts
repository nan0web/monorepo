declare function Avatar({ src, alt, style, className, ...props }: {
    [x: string]: any;
    src: any;
    alt?: string | undefined;
    style?: {} | undefined;
    className?: string | undefined;
}): import("react/jsx-runtime").JSX.Element;
declare namespace Avatar {
    namespace propTypes {
        let src: PropTypes.Requireable<string>;
        let alt: PropTypes.Requireable<string>;
        let style: PropTypes.Requireable<object>;
        let className: PropTypes.Requireable<string>;
    }
    namespace defaultProps {
        let src_1: string;
        export { src_1 as src };
        let alt_1: string;
        export { alt_1 as alt };
        let style_1: {};
        export { style_1 as style };
        let className_1: string;
        export { className_1 as className };
    }
}
export default Avatar;
import PropTypes from 'prop-types';
