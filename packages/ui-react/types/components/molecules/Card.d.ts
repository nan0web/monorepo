/**
 * Card – container with default theme-aware styling.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content inside the card.
 * @param {Object} [props.style] - Additional inline styles.
 * @param {Object} [props.rest] - Other props passed to the div.
 * @returns {React.ReactNode} The card component.
 */
declare function Card({ children, style, ...props }: {
    children: React.ReactNode;
    style?: any;
    rest?: any;
}): React.ReactNode;
declare namespace Card {
    namespace propTypes {
        let children: PropTypes.Validator<NonNullable<PropTypes.ReactNodeLike>>;
        let style: PropTypes.Requireable<object>;
    }
}
export default Card;
import React from 'react';
import PropTypes from 'prop-types';
