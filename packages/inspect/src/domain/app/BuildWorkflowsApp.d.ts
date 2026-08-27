import { AuditorModel } from '../AuditorModel.js';
/**
 * Parses YAML FrontMatter from Markdown content.
 * @param {string} content
 * @returns {Record<string, any> | null}
 */
export declare function parseFrontMatter(content: string): Record<string, any> | null;
/**
 * Parses simple nan0web.nan0 yaml configuration.
 * @param {string} yamlText
 * @returns {{ name: string, agents: Array<{ id: string, description: string, workflows: string[], inspectors: string[] }> }}
 */
export declare function parseNan0Config(yamlText: string): {
    name: string;
    agents: Array<{
        id: string;
        description: string;
        workflows: string[];
        inspectors: string[];
    }>;
};
export declare class BuildWorkflowsApp extends AuditorModel {
    static alias: string;
    static UI: {
        title: string;
        description: string;
        starting: string;
        saved: string;
        done: string;
    };
    constructor(data?: {}, options?: {});
    /**
     * Recursively finds nan0web.nan0 files in the workspace.
     * @param {string} dir
     * @returns {Promise<string[]>}
     */
    findNan0Configs(dir: string): Promise<string[]>;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
