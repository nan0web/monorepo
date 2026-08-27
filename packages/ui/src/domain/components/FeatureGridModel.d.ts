import { Model } from '@nan0web/types';
/**
 * FeatureItemModel — OLMUI Component Model
 * Represents a single features block entry with an icon, title, and description.
 */
export declare class FeatureItemModel extends Model {
    static $id: string;
    static icon: {
        help: string;
        placeholder: string;
        default: string;
    };
    static title: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static description: {
        help: string;
        placeholder: string;
        default: string;
    };
    /**
     * @param {Partial<FeatureItemModel>} data
     */
    constructor(data?: Partial<FeatureItemModel>);
}
/**
 * FeatureGridModel — OLMUI Component Model
 * Grid of features with icons and descriptions.
 */
export declare class FeatureGridModel extends Model {
    /** @type {FeatureItemModel[]} List of features */
    items: FeatureItemModel[];
    static $id: string;
    static items: {
        help: string;
        type: string;
        hint: typeof FeatureItemModel;
        default: never[];
    };
    /**
     * @param {Partial<FeatureGridModel>} data
     */
    constructor(data?: Partial<FeatureGridModel>);
}
