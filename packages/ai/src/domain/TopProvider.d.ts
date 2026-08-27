import { Model } from '@nan0web/types';
/**
 * TopProvider — represents provider-specific configuration and constraints.
 */
export declare class TopProvider extends Model {
    context_length: number;
    is_moderated: boolean;
    max_completion_tokens: number;
    static context_length: {
        help: string;
        default: number;
    };
    static is_moderated: {
        help: string;
        default: boolean;
    };
    static max_completion_tokens: {
        help: string;
        default: number;
    };
    /**
     * @param {Partial<TopProvider>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<TopProvider>, options?: Partial<import('@nan0web/types').ModelOptions>);
}
