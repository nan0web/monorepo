/**
 * @typedef {Object} BooleanCellProps
 * @property {boolean} [cellData]
 * @property {boolean} [value]
 * @property {any} [field]
 */
/**
 * Custom BooleanCell renderer for Payload CMS admin tables.
 * @param {BooleanCellProps} props
 * @returns {React.JSX.Element}
 */
export function BooleanCell({ cellData, value, field }: BooleanCellProps): React.JSX.Element;
export default BooleanCell;
export type BooleanCellProps = {
    cellData?: boolean | undefined;
    value?: boolean | undefined;
    field?: any;
};
import React from 'react';
