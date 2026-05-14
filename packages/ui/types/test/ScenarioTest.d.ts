/**
 * Deterministic Scenario Test Runner.
 * Orchestrates a model against a predefined scenario, mocking I/O immediately.
 */
export class ScenarioTest {
    /**
     * Runs an application model with a specific set of answers.
     *
     * @param {typeof import('../domain/ModelAsApp.js').ModelAsApp} AppClass
     * @param {Array<{field: string, value: any, cancelled?: boolean}>} scenario
     * @param {any} [appData={}]
     * @returns {Promise<{ value: any, intents: any[], error?: Error | undefined }>}
     */
    static run(AppClass: typeof import("../domain/ModelAsApp.js").ModelAsApp, scenario?: Array<{
        field: string;
        value: any;
        cancelled?: boolean;
    }>, appData?: any): Promise<{
        value: any;
        intents: any[];
        error?: Error | undefined;
    }>;
}
export default ScenarioTest;
