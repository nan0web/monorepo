declare function TextArea({ ...props }: {
    [x: string]: any;
}): React.DetailedReactHTMLElement<{
    style: any;
}, HTMLElement>;
declare namespace TextArea {
    namespace propTypes {
        let style: PropTypes.Requireable<object>;
    }
}
export default TextArea;
import React from 'react';
import PropTypes from 'prop-types';
