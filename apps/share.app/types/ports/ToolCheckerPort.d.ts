/**
 * Node.js Port extending ToolChecker domain ModelAsApp.
 */
export class ToolCheckerPort extends ToolChecker {
    /**
     * Node.js implementation checking binary availability via `which`.
     * @param {string} tool - Binary name to check.
     * @returns {Promise<boolean>}
     */
    static check(tool: string): Promise<boolean>;
}
import { ToolChecker } from '../domain/ToolChecker.js';
