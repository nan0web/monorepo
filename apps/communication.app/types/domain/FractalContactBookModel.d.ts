/** @type {readonly string[]} */
export const CANONICAL_CIRCLES: readonly string[];
/**
 * Fractal contact book for 7iOS we/ circles and Triad project governance.
 */
export class FractalContactBookModel extends ModelAsApp {
    static UI: {
        errorNoDb: string;
        errorInvalidCircle: string;
        errorInvalidSoulId: string;
        errorTriadRule: string;
    };
    static circles: {
        help: string;
        default: readonly string[];
    };
    /**
     * @param {Partial<FractalContactBookModel>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<FractalContactBookModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string[]} Allowed we/ circles */ circles: string[];
    /**
     * Resolves active we/ circles from root index document or model options.
     * @returns {Promise<string[]>}
     */
    resolveCircles(): Promise<string[]>;
    /**
     * Registers a contact in one of configured we/ circles.
     * @param {{ soulId: string, circle: string, name: string, devices?: string[], dryRun?: boolean }} input
     * @returns {Promise<{ soulId: string, circle: string, name: string, devices: string[] }>}
     */
    addContact(input: {
        soulId: string;
        circle: string;
        name: string;
        devices?: string[];
        dryRun?: boolean;
    }): Promise<{
        soulId: string;
        circle: string;
        name: string;
        devices: string[];
    }>;
    /**
     * Creates a shared partner project enforcing the Triad Rule (N >= 3).
     * @param {{ projectId: string, title: string, coreMembers: string[] }} input
     * @returns {Promise<{ projectId: string, title: string, coreMembers: string[] }>}
     */
    createPartnerProject(input: {
        projectId: string;
        title: string;
        coreMembers: string[];
    }): Promise<{
        projectId: string;
        title: string;
        coreMembers: string[];
    }>;
    /**
     * Bootstraps Day 1 Onboarding tree by copying template files from tourDir.
     * @param {{ tourDir?: string, dryRun?: boolean }} [options]
     * @returns {Promise<{ dryRun: boolean, created: string[], existing: string[] }>}
     */
    bootstrapDayOneTree(options?: {
        tourDir?: string;
        dryRun?: boolean;
    }): Promise<{
        dryRun: boolean;
        created: string[];
        existing: string[];
    }>;
}
import { ModelAsApp } from '@nan0web/ui';
