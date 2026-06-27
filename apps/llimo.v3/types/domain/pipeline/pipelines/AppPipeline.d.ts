export class AppPipeline {
    /**
     * @param {any} context
     */
    constructor(context: any);
    context: any;
    /**
     * @param {string} task
     * @param {any} options
     * @returns {AsyncGenerator<any, { ok: boolean; phase: string; savedFiles: string[] }, any>}
     */
    execute(task: string, options: any): AsyncGenerator<any, {
        ok: boolean;
        phase: string;
        savedFiles: string[];
    }, any>;
    /**
     * @param {string} cwd
     * @param {any} fsMod
     * @param {any} fsPromises
     * @param {any} pathMod
     */
    detectCurrentPhase(cwd: string, fsMod: any, fsPromises: any, pathMod: any): Promise<"1-seed" | "2-model" | "3-contract" | "4-adapter" | "5-ui-cli" | "6-ui-chat" | "7-ui-web" | "8-ui-mobile" | "9-qa">;
    /**
     * @param {string} phase
     * @param {string} lang
     */
    getPhaseConfig(phase: string, lang: string): any;
}
