/**
 * TaskIntent — OLMUI Intent for executing release tasks (task.md) via agents or test contracts.
 */
export class TaskIntent extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        icon: string;
    };
    static file: {
        help: string;
        type: string;
        default: string;
        positional: boolean;
    };
    static agent: {
        help: string;
        type: string;
        default: string;
    };
    static maxTurns: {
        help: string;
        type: string;
        alias: string;
        default: number;
    };
    /**
     * @param {Partial<TaskIntent> | Record<string, any>} [data] Initial state
     * @param {import('@nan0web/ui').ModelAsAppOptions & Record<string, any>} [options] Model options
     */
    constructor(data?: Partial<TaskIntent> | Record<string, any>, options?: import("@nan0web/ui").ModelAsAppOptions & Record<string, any>);
    file: any;
    dryRun: boolean;
    autoApprove: any;
    agent: any;
    maxTurns: number;
    /**
     * Parses markdown task document with optional YAML frontmatter.
     * @param {string} content
     * @returns {{ version?: string, type?: string, status?: string, title: string, tasks: string[], content: string }}
     */
    parseTask(content: string): {
        version?: string;
        type?: string;
        status?: string;
        title: string;
        tasks: string[];
        content: string;
    };
    /**
     * Main execution flow for task runner.
     */
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").ResultIntent, void, unknown>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
