/**
 * Renderer for Radio component with local state support for playground.
 * Note: Radio groups in playground are tricky without a parent Form renderer context,
 * but for basic "toggle per item" visual feedback or if they share name/context, this helps.
 *
 * @param {object} props
 * @param {object} props.element - Element definition
 * @param {any} [props.context] - UI Context
 * @param {any} [props.onChange] - Change handler
 * @param {any} [props.name] - Name
 * @param {any} [props.disabled] - Disabled state
 * @returns {React.ReactNode} Rendered radio
 */
declare function renderRadio(props: {
    element: object;
    context?: any;
    onChange?: any;
    name?: any;
    disabled?: any;
}): React.ReactNode;
declare namespace renderRadio {
    namespace propTypes {
        let element: PropTypes.Requireable<object>;
        let onChange: PropTypes.Requireable<(...args: any[]) => any>;
        let name: PropTypes.Requireable<string>;
        let disabled: PropTypes.Requireable<boolean>;
    }
}
export default renderRadio;
import React from 'react';
import PropTypes from 'prop-types';
