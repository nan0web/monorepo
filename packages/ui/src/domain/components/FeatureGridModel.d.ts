/**
 * FeatureItemModel — OLMUI Component Model
 * Represents a single features block entry with an icon, title, and description.
 */
export class FeatureItemModel extends Model {
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
    /** @type {string} Icon name */ icon: string;
    /** @type {string} Feature heading */ title: string;
    /** @type {string} Feature description */ description: string;
}
/**
 * FeatureGridModel — OLMUI Component Model
 * Grid of features with icons and descriptions.
 */
export class FeatureGridModel extends Model {
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
    /** @type {FeatureItemModel[]} List of features */
    items: FeatureItemModel[];
}
import { Model } from '@nan0web/types';
