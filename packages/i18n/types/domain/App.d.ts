export class AuditCommand extends ModelAsApp {
}
export class InfoCommand extends ModelAsApp {
}
export class GenerateCommand extends ModelAsApp {
}
/**
 * Main application model for i18n CLI toolkit.
 */
export class App extends ModelAsApp {
    static UI: {
        title: string;
        description: string;
    };
    static command: {
        default: string;
        positional: boolean;
        options: any[];
    };
    static data: {
        default: string;
    };
    static out: {
        default: string;
    };
    static domain: {
        default: string;
    };
    static vocab: {
        default: string;
    };
    static ui: {
        default: string;
    };
    static components: {
        default: string;
    };
    static shell: {
        default: string;
        positional: boolean;
    };
    run(): AsyncGenerator<{
        type: string;
        level: string;
        message: string;
    }, {
        status: string;
    }, unknown>;
}
import { ModelAsApp } from '@nan0web/ui';
