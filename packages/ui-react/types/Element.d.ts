export default class ReactElement extends CoreElement {
    /**
     * @param {any} input Input data
     * @param {string|number} key Key prop.
     * @param {UIContextValue} context
     * @returns {React.ReactNode}
     */
    static render(input: any, key: string | number, context: UIContextValue): React.ReactNode;
}
import { Element as CoreElement } from '@nan0web/ui';
import UIContextValue from './context/UIContextValue.jsx';
import React from 'react';
