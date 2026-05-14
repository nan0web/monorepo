/**
 * Renderer for Avatar component
 *
 * @param {object} block - Component block definition
 * @returns {React.ReactNode} Rendered avatar
 */
declare function renderAvatar({ element, ...props }: object): React.ReactNode;
declare namespace renderAvatar {
    namespace propTypes {
        let element: PropTypes.Validator<object>;
    }
}
export default renderAvatar;
import React from 'react';
import PropTypes from 'prop-types';
