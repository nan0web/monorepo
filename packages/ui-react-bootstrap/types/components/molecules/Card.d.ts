/**
 * Enhanced Bootstrap Card for V2 design.
 */
declare function Card({ title, subtitle, icon, header, footer, children, variant, className, ...props }: {
    [x: string]: any;
    title: any;
    subtitle: any;
    icon: any;
    header: any;
    footer: any;
    children: any;
    variant?: string;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
declare namespace Card {
    namespace propTypes {
        let children: PropTypes.Validator<NonNullable<PropTypes.ReactNodeLike>>;
        let style: PropTypes.Requireable<object>;
    }
}
export default Card;
import PropTypes from 'prop-types';
