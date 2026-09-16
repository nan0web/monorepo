/**
 * @property {string[]} _positionals
 * @property {string} command Type of command to run
 * @property {boolean} help Show help message
 */
export class UIApp extends ModelAsApp {
    static command: {
        type: string;
        help: string;
        options: (typeof SnapshotAuditor | typeof GalleryCommand | typeof ConfigApp)[];
        default: string;
        positional: boolean;
    };
    static UI: {
        helpText: string;
        unknownCommand: string;
    };
    /**
     * @param {Partial<UIApp> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<UIApp> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions>);
    run(): AsyncGenerator<import("../../core/Intent.js").ShowIntent | (import("../../core/Intent.js").AskIntent & import("../../core/Intent.js").IntentBase) | (import("../../core/Intent.js").ProgressIntent & import("../../core/Intent.js").IntentBase) | (import("../../core/Intent.js").LogIntent & import("../../core/Intent.js").IntentBase) | (import("../../core/Intent.js").RenderIntent & import("../../core/Intent.js").IntentBase) | (import("../../core/Intent.js").AgentIntent & import("../../core/Intent.js").IntentFiles & import("../../core/Intent.js").IntentBase) | (import("../../core/Intent.js").ResultIntent & import("../../core/Intent.js").IntentBase), import("../../core/Intent.js").ResultIntent, any>;
}
export default UIApp;
import { ModelAsApp } from '../ModelAsApp.js';
import SnapshotAuditor from './SnapshotAuditor.js';
import GalleryCommand from './GalleryCommand.js';
import ConfigApp from './ConfigApp.js';
