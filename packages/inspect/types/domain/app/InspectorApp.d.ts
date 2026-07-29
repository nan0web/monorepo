export class InspectorApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        description: string;
    };
    static command: {
        type: typeof ModelAsApp;
        help: string;
        options: (typeof PhaseAuditor | typeof CircularDependencyAuditor | typeof ArchitectureAuditor | typeof SnapshotAuditor | typeof BuildWorkflowsApp | typeof OlmuiThemingAuditor)[];
        default: typeof ArchitectureAuditor;
        positional: boolean;
    };
    static dir: {
        type: string;
        help: string;
        positional: boolean;
        default: string;
    };
    static fix: {
        type: string;
        help: string;
        default: boolean;
    };
    /**
     * @param {Partial<InspectorApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<InspectorApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {AuditorModel} Auditor model */ command: AuditorModel;
    /** @type {string} Target directory */ dir: string;
    /** @type {boolean} Automatically apply fixes */ fix: boolean;
    /** @type {import('../index.js').LanguagePlatform} Language platform */ platform: import("../index.js").LanguagePlatform;
    /**
     * Detects the project platform based on configuration files.
     */
    init(): Promise<void>;
}
import { ModelAsApp } from '@nan0web/ui';
import { AuditorModel } from '../AuditorModel.js';
import { PhaseAuditor } from './PhaseAuditor.js';
import { CircularDependencyAuditor } from './CircularDependencyAuditor.js';
import { ArchitectureAuditor } from './ArchitectureAuditor.js';
import { SnapshotAuditor } from '@nan0web/ui/inspect';
import { BuildWorkflowsApp } from './BuildWorkflowsApp.js';
import { OlmuiThemingAuditor } from '@nan0web/ui/inspect';
