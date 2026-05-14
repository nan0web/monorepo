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
    run(): AsyncGenerator<import("../../core/Intent.js").ShowIntent | (import("../../core/Intent.js").AskIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }) | (import("../../core/Intent.js").ProgressIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }) | (import("../../core/Intent.js").LogIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }) | (import("../../core/Intent.js").RenderIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }) | (import("../../core/Intent.js").AgentIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }) | (import("../../core/Intent.js").ResultIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }), import("../../core/Intent.js").ResultIntent, any>;
}
export default UIApp;
import { ModelAsApp } from '../ModelAsApp.js';
import SnapshotAuditor from './SnapshotAuditor.js';
import GalleryCommand from './GalleryCommand.js';
import ConfigApp from './ConfigApp.js';
