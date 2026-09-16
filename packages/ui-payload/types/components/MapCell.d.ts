/**
 * @typedef {Object} MapCellProps
 * @property {any} [cellData]
 * @property {any} [value]
 * @property {any} [rowData]
 */
/**
 * Map preview cell for Payload CMS admin tables with OpenStreetMap link.
 * @param {MapCellProps} props
 * @returns {React.JSX.Element}
 */
export function MapCell({ rowData }: MapCellProps): React.JSX.Element;
export default MapCell;
export type MapCellProps = {
    cellData?: any;
    value?: any;
    rowData?: any;
};
import React from 'react';
