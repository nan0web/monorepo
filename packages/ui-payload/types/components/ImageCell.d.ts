/**
 * @typedef {Object} ImageCellProps
 * @property {string | { url?: string; thumbnailURL?: string }} [cellData]
 * @property {string | { url?: string; thumbnailURL?: string }} [value]
 */
/**
 * Image preview cell for Payload CMS admin tables.
 * @param {ImageCellProps} props
 * @returns {React.JSX.Element | null}
 */
export function ImageCell(props: ImageCellProps): React.JSX.Element | null;
export default ImageCell;
export type ImageCellProps = {
    cellData?: string | {
        url?: string;
        thumbnailURL?: string;
    } | undefined;
    value?: string | {
        url?: string;
        thumbnailURL?: string;
    } | undefined;
};
import React from 'react';
