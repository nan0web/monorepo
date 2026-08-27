import { Runner } from './Runner.js';
export declare class PlayApp {
    server: import("../index.js").AuthServer;
    logger: import("@nan0web/log").default;
    baseUrl: string;
    scenariosDir: any;
    runner: Runner;
    /**
     * @param {import('../server/AuthServer.js').default} server
     * @param {import('../server/AuthServer.js').default['logger']} serverLogger
     */
    constructor(server: import('../server/AuthServer.js').default, serverLogger: import('../server/AuthServer.js').default['logger']);
    main(): Promise<void>;
    getScenarioChoices(): any;
}
