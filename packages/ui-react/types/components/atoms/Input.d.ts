declare function Input({ type, value, defaultValue, ...props }: {
    [x: string]: any;
    type?: string | undefined;
    value: any;
    defaultValue: any;
}): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
declare namespace Input {
    namespace propTypes {
        let type: PropTypes.Requireable<string>;
        let value: PropTypes.Requireable<NonNullable<string | number | null | undefined>>;
        let defaultValue: PropTypes.Requireable<NonNullable<string | number | null | undefined>>;
        let style: PropTypes.Requireable<object>;
    }
}
export default Input;
import React from 'react';
import PropTypes from 'prop-types';
