/**
 * ToolChecker domain model (Model-as-App).
 * Platform-agnostic domain application controller for checking CLI tool availability.
 */
export class ToolChecker extends ModelAsApp {
    static alias: string;
    /**
     * Resolves port and checks if tool exists.
     * @param {string} tool - Binary name to check.
     * @param {Object} [options]
     * @returns {Promise<boolean>}
     */
    static check(tool: string, options?: any): Promise<boolean>;
    /**
     * Checks multiple tools and returns a list of missing ones.
     * @param {Record<string, string>} tools - Map of binary name → install hint
     * @param {Object} [options]
     * @returns {Promise<{ tool: string, hint: string }[]>}
     */
    static require(tools: Record<string, string>, options?: any): Promise<{
        tool: string;
        hint: string;
    }[]>;
}
import { ModelAsApp } from '@nan0web/ui';
