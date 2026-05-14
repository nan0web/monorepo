/**
 * Deterministic Scenario Adapter for OLMUI Testing.
 *
 * Drives the Model generator through a predefined script of responses,
 * enabling millisecond-fast verification of complex business logic.
 */
export default class ScenarioAdapter extends InputAdapter {
    /**
     * @param {Array<{field: string, value: any, cancelled?: boolean}>} [scenario=[]]
     */
    constructor(scenario?: Array<{
        field: string;
        value: any;
        cancelled?: boolean;
    }>);
    scenario: {
        field: string;
        value: any;
        cancelled?: boolean;
    }[];
    intents: any[];
    console: {
        info: () => void;
        warn: () => void;
        error: () => void;
        debug: () => void;
        log: () => void;
    };
    /**
     * @param {import('../core/Intent.js').AskIntent} intent
     * @returns {Promise<import('../core/Intent.js').AskResponse>}
     */
    askIntent(intent: import("../core/Intent.js").AskIntent): Promise<import("../core/Intent.js").AskResponse>;
    /** @param {import('../core/Intent.js').ProgressIntent} intent */
    progressIntent(intent: import("../core/Intent.js").ProgressIntent): Promise<void>;
    /** @param {import('../core/Intent.js').ShowIntent} intent */
    showIntent(intent: import("../core/Intent.js").ShowIntent): Promise<void>;
    /** @param {import('../core/Intent.js').RenderIntent} intent */
    renderIntent(intent: import("../core/Intent.js").RenderIntent): Promise<void>;
    /** @param {import('../core/Intent.js').ResultIntent} intent */
    resultIntent(intent: import("../core/Intent.js").ResultIntent): Promise<void>;
}
import InputAdapter from '../core/InputAdapter.js';
