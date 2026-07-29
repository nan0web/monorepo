/**
 * Parses YAML FrontMatter from Markdown content.
 * @param {string} content
 * @returns {Record<string, any> | null}
 */
export function parseFrontMatter(content: string): Record<string, any> | null;
/**
 * Parses simple nan0web.nan0 yaml configuration.
 * @param {string} yamlText
 * @returns {{ name: string, agents: Array<{ id: string, description: string, workflows: string[], inspectors: string[] }> }}
 */
export function parseNan0Config(yamlText: string): {
    name: string;
    agents: Array<{
        id: string;
        description: string;
        workflows: string[];
        inspectors: string[];
    }>;
};
export class BuildWorkflowsApp extends AuditorModel {
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
    run(): AsyncGenerator<import("../../../../ui/types/core/Intent.js").ProgressIntent | import("../../../../ui/types/core/Intent.js").ShowIntent, import("../../../../ui/types/core/Intent.js").ResultIntent, unknown>;
}
import { AuditorModel } from '../AuditorModel.js';
