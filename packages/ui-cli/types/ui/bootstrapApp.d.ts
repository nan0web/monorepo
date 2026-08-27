/**
 * Universal App Runner (Bootstrap) for standalone OLMUI CLI applications.
 * Bootstrap application must be strictly defined on the agnostic highest level.
 *
 * @param {typeof import('@nan0web/types').Model} [AppModel]
 * @param {BootstrapAppConfig} [config={}]
 */
export function bootstrapApp(AppModel?: typeof import("@nan0web/types").Model, config?: BootstrapAppConfig): Promise<{
    success: boolean;
    data: any;
    cancelled: boolean;
} | {
    success: boolean;
    data: string;
} | undefined>;
export type BootstrapAppConfig = {
    /**
     * Arguments of the console app.
     */
    argv?: string[] | undefined;
    /**
     * Root database with mounted all required databases already.
     */
    db?: DB | undefined;
    /**
     * Environment variables.
     */
    env?: object;
    /**
     * Current working directory function.
     */
    cwd?: (() => string) | undefined;
    /**
     * Translation function.
     */
    t?: import("../../../types/types/utils/TFunction.js").TFunction | undefined;
    /**
     * Provides a result instead of exit when true.
     */
    noExit?: boolean | undefined;
    /**
     * Optional DB mount root path.
     */
    root?: string | undefined;
    /**
     * Optional application name.
     */
    appName?: string | undefined;
    /**
     * System directory, used for ~/ (Home dir).
     */
    system?: string | undefined;
};
import DB from '@nan0web/db';
