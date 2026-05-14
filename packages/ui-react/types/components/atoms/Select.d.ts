declare function Select({ options, ...props }: {
    [x: string]: any;
    options?: never[] | undefined;
}): React.DetailedReactHTMLElement<{
    style: any;
}, HTMLElement>;
declare namespace Select {
    namespace propTypes {
        let options: PropTypes.Requireable<(NonNullable<string | PropTypes.InferProps<{
            value: PropTypes.Validator<string>;
            label: PropTypes.Validator<string>;
        }> | null | undefined> | null | undefined)[]>;
        let style: PropTypes.Requireable<object>;
    }
}
export default Select;
import React from 'react';
import PropTypes from 'prop-types';
