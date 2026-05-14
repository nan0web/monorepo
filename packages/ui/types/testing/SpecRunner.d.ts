export class SpecRunner extends ModelAsApp {
    static stream: {
        help: string;
        default: never[];
    };
    static registry: {
        help: string;
        default: {};
    };
    static UI: {
        invalidStream: string;
        invalidFirstStep: string;
        missingAppName: string;
        appNotFound: string;
        invalidGenerator: string;
        running: string;
        unhandledSteps: string;
    };
    /**
     * Convenience method to load a .nan0 file and run a specific scenario.
     *
     * 💡 Note on Expectations:
     * You do NOT need to write manual assertions when using this method.
     * The `for await (const _ of runner.run()) {}` loop drives the generator,
     * but ALL assertions are handled automatically inside `SpecAdapter.js`.
     *
     * Whenever the App yields an intent (`ask`, `show`, `result`), `SpecAdapter`
     * intercepts it and compares it strictly against the next step in the `.nan0` file.
     * - If it matches, the test continues (and `$value` is injected back into the App).
     * - If it mismatches, it throws an `assert.fail()` which fails the Node.js test immediately.
     * - If the App finishes early, it throws an `unhandledSteps` error.
     *
     * @param {string} fileDir The directory containing the file (e.g., import.meta.dirname)
     * @param {string} fileName The name of the .nan0 file
     * @param {string} scenarioName The name of the scenario to run
     * @param {Record<string, any>} registry The Model Class registry
     * @param {Partial<import('../index.js').ModelAsAppOptions>} [options={}] Additional runner context options
     * @throws {Error} If the scenario is missing or if expectations fail during execution
     */
    static executeFile(fileDir: string, fileName: string, scenarioName: string, registry: Record<string, any>, options?: Partial<import("../index.js").ModelAsAppOptions>): Promise<void>;
    /**
     * Run a Nan0Spec sequence programmatically (for unit tests).
     *
     * @param {Array<object>} stream The .nan0 intent stream array
     * @param {Record<string, any>} registry A registry of Model Classes that can be mounted
     * @param {typeof import('node:assert/strict')} [asserter] Custom assertion library
     */
    static execute(stream: Array<object>, registry: Record<string, any>, asserter?: typeof import("node:assert/strict")): Promise<any>;
    /**
     * @param {Partial<SpecRunner>} [data={}]
     * @param {Partial<import('../index.js').ModelAsAppOptions> & { assert?: typeof import('node:assert/strict') }} [options={}]
     */
    constructor(data?: Partial<SpecRunner>, options?: Partial<import("../index.js").ModelAsAppOptions> & {
        assert?: typeof import("node:assert/strict");
    });
    /** @type {Array<object>} The Nan0Spec stream */
    stream: Array<object>;
    /** @type {Record<string, any>} The registry of Model Classes */
    registry: Record<string, any>;
    #private;
}
export default SpecRunner;
import { ModelAsApp } from '../domain/ModelAsApp.js';
