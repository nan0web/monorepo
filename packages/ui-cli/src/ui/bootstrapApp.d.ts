import DB from '@nan0web/db';
export type BootstrapAppConfig = {
    /**
     * Arguments of the console app.
     */
    argv?: string[];
    /**
     * Root database with mounted all required databases already.
     */
    db?: DB;
    /**
     * Environment variables.
     */
    env?: object;
    /**
     * Current working directory function.
     */
    cwd?: () => string;
    /**
     * Translation function.
     */
    t?: import('@nan0web/i18n').TFunction;
    /**
     * Provides a result instead of exit when true.
     */
    noExit?: boolean;
    /**
     * Optional DB mount root path.
     */
    root?: string;
    /**
     * Optional application name.
     */
    appName?: string;
    /**
     * System directory, used for ~/ (Home dir).
     */
    system?: string;
};
/**
 * Universal App Runner (Bootstrap) for standalone OLMUI CLI applications.
 * Bootstrap application must be strictly defined on the agnostic highest level.
 *
 * @param {typeof import('@nan0web/types').Model} [AppModel]
 * @param {BootstrapAppConfig} [config={}]
 */
export declare function bootstrapApp(AppModel?: typeof import('@nan0web/types').Model, config?: BootstrapAppConfig): Promise<{
    success: boolean;
    data: any;
    cancelled: boolean;
} | {
    success: boolean;
    data: string;
} | undefined>;
