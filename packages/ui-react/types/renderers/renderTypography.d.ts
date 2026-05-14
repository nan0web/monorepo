/**
 * Renderer for Typography component
 *
 * @param {object} props - Component block definition
 * @returns {React.ReactNode} Rendered typography
 */
declare function renderTypography(props: object): React.ReactNode;
declare namespace renderTypography {
    namespace propTypes {
        let element: PropTypes.Validator<object>;
    }
}
export default renderTypography;
import React from 'react';
import PropTypes from 'prop-types';
