/**
 * Sandbox Application - lists all components and their variants
 */
export default class SandboxApp extends AppCore {
    /**
     * @param {any} input
     * @returns {SandboxApp}
     */
    static from(input: any): SandboxApp;
    /**
     * @param {Object} input
     */
    constructor(input: any);
    /**
     * @param {string} locale
     */
    handleLocaleChange(locale: string): Promise<void>;
}
import { AppCore } from '@nan0web/core';
