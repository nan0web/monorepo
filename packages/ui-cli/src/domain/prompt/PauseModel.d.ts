import { Model } from '@nan0web/types';
/**
 * Model describing the Pause component.
 */
export declare class PauseModel extends Model {
    static ms: {
        default: number;
    };
    static help: string;
    /**
     * @param {Partial<PauseModel> | Record<string, any> | number} [data] Input model data or milliseconds.
     */
    constructor(data?: Partial<PauseModel> | Record<string, any> | number);
}
