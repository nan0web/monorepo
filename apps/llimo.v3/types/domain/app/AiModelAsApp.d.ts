/**
 * @typedef {import('@nan0web/ui').ModelAsAppOptions & {
 *   ai?: any
 *   os?: any
 * }} AiModelAsAppOptions
 */
export class AiModelAsApp extends ModelAsApp {
    /**
     * @param {Partial<AiModelAsApp> | Record<string, any>} [data]
     * @param {Partial<AiModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<AiModelAsApp> | Record<string, any>, options?: Partial<AiModelAsAppOptions>);
    _: {
        ai: any;
        os: any;
        adapter: import("@nan0web/ui").InputAdapter;
        parentPath: string;
        _isExplicit: boolean;
        db: import("@nan0web/db").default | null | undefined;
        plugins: Record<string, any>;
        t: import("@nan0web/types/src/utils/TFunction").TFunction;
    };
}
export type AiModelAsAppOptions = import("@nan0web/ui").ModelAsAppOptions & {
    ai?: any;
    os?: any;
};
import { ModelAsApp } from '@nan0web/ui';
