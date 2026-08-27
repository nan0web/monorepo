import { ModelAsApp } from '@nan0web/ui';
export default class StatusCommand extends ModelAsApp {
    static UI: {
        title: string;
        help: string;
    };
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>;
}
