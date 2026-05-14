/** @typedef {import("./Core/CoreApp.js").default} CoreApp */
/**
 * Abstract Scenario class to test app logic.
 * Scenarios run input commands and verify output.
 */
export default class Scenario {
    /**
     * Creates a new Scenario instance.
     * @param {CoreApp} app - App instance to run scenarios against
     * @param {UI} ui - User interface
     * @throws {TypeError} If app is not an App.Core.App instance
     */
    constructor(app: CoreApp, ui: UI);
    /** @type {CoreApp} The app to run scenarios against */
    app: CoreApp;
    ui: UI;
    /**
     * Run scenario with input commands and expected output.
     * @param {Array<any[]>} inputCommands - Array of command arrays
     * @param {Array<any>} expectedOutputs - Expected outputs for each command
     * @returns {Promise<boolean>} True if all outputs match expected
     */
    run(inputCommands: Array<any[]>, expectedOutputs: Array<any>): Promise<boolean>;
}
export type CoreApp = import("./Core/CoreApp.js").default;
import UI from './Core/UI.js';
