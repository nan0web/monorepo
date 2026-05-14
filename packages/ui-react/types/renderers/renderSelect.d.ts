/**
 * Renderer for Select component with local state support.
 *
 * @param {object} props
 * @param {object} props.element - Element definition
 * @param {any} [props.context] - UI Context
 * @param {any} [props.onChange] - Change handler
 * @param {any} [props.disabled] - Disabled state
 * @returns {React.ReactNode} Rendered select
 */
declare function renderSelect(props: {
    element: object;
    context?: any;
    onChange?: any;
    disabled?: any;
}): React.ReactNode;
declare namespace renderSelect {
    namespace propTypes {
        let element: PropTypes.Requireable<object>;
        let onChange: PropTypes.Requireable<(...args: any[]) => any>;
        let disabled: PropTypes.Requireable<boolean>;
    }
}
export default renderSelect;
import React from 'react';
import PropTypes from 'prop-types';
