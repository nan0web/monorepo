export class AppPipelineModel extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static task: {
        help: string;
        default: string;
    };
    static autoVerify: {
        help: string;
        type: string;
        default: boolean;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} */ task: string;
    /** @type {boolean} */ autoVerify: boolean;
    /** @type {string[]} */ _positionals: string[];
    /**
     * @param {string} phase
     * @param {any} db
     */
    loadPhaseConfig(phase: string, db: any): Promise<{
        workflows: string[];
        inspectors: string[];
        instructions: any;
    }>;
    run(): AsyncGenerator<any, import("@nan0web/ui/src/core/Intent.js").ResultIntent, any>;
    /**
     * @param {string} cwd
     * @param {any} fsMod
     * @param {any} fsPromises
     * @param {any} pathMod
     */
    detectCurrentPhase(cwd: string, fsMod: any, fsPromises: any, pathMod: any): Promise<"1-seed" | "2-model" | "3-contract" | "4-adapter" | "5-ui-cli" | "6-ui-chat" | "7-ui-web" | "8-ui-mobile" | "9-qa">;
}
import { ModelAsApp } from '@nan0web/ui';
