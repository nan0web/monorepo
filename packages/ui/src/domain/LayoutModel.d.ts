import { Model } from '@nan0web/types';
export type LayoutType = 'flow' | 'sticky-bottom' | 'sticky-top' | 'dialog-modal' | 'spatial-xyz';
/**
 * @typedef {'flow'|'sticky-bottom'|'sticky-top'|'dialog-modal'|'spatial-xyz'} LayoutType
 */
/**
 * Universal Layout Interface for OLMUI.
 * Defines the semantic spatial placement of a component in any renderer.
 */
export declare class LayoutModel extends Model {
    static type: {
        help: string;
        default: string;
        options: {
            value: string;
            label: string;
        }[];
    };
    static coordinates: {
        help: string;
        default: null;
        type: string;
    };
    /**
     * Creates a new LayoutModel instance to define spatial placement.
     * @param {Partial<LayoutModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Model options.
     */
    constructor(data?: Partial<LayoutModel> | Record<string, any>, options?: object);
}
