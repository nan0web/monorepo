export class ReleaseModel extends Model {
    static version: {
        type: string;
        required: boolean;
    };
    static title: {
        type: string;
        required: boolean;
    };
    static status: {
        type: string;
        default: string;
    };
    static type: {
        type: string;
        default: string;
    };
    static summary: {
        type: string;
    };
    static epic: {
        type: string;
    };
    static sprint: {
        type: string;
    };
    static tracker: {
        type: string;
    };
    static team: {
        type: string;
        itemType: typeof ReleaseMemberModel;
        default: never[];
    };
    static tasks: {
        type: string;
        itemType: typeof ReleaseTaskModel;
        default: never[];
    };
    static criteria: {
        type: string;
        itemType: typeof ReleaseTaskModel;
        default: never[];
    };
    static parity: {
        type: string;
        itemType: typeof ReleaseParityModel;
        default: never[];
    };
    static issues: {
        type: string;
        itemType: typeof ReleaseIssueModel;
        default: never[];
    };
    static files: {
        type: string;
        default: never[];
    };
    static meta: {
        type: string;
        default: {};
    };
    static SECTIONS: {
        summary: string[];
        team: string[];
        tasks: string[];
        criteria: string[];
        parity: string[];
        issues: string[];
        artifacts: string[];
    };
    /**
     * Extend section synonyms dictionary with custom locale mappings.
     * @param {Record<string, string[]>} localeMap
     */
    static addLocaleSections(localeMap: Record<string, string[]>): void;
    /**
     * @param {Partial<ReleaseModel>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<ReleaseModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Release version */
    version: string;
    /** @type {string} Release title */
    title: string;
    /** @type {'todo' | 'work' | 'done' | 'fail'} Release status */
    status: "todo" | "work" | "done" | "fail";
    /** @type {'major' | 'minor' | 'patch' | 'hotfix' | 'chore'} Release type */
    type: "major" | "minor" | "patch" | "hotfix" | "chore";
    /** @type {string} Release summary / description */
    summary: string;
    /** @type {string} Epic identifier */
    epic: string;
    /** @type {string} Sprint name */
    sprint: string;
    /** @type {string} External tracker URL template */
    tracker: string;
    /** @type {ReleaseMemberModel[]} Team members (ролі, імена, логіни) */
    team: ReleaseMemberModel[];
    /** @type {ReleaseTaskModel[]} Tasks in scope */
    tasks: ReleaseTaskModel[];
    /** @type {ReleaseTaskModel[]} Acceptance criteria (DoD) */
    criteria: ReleaseTaskModel[];
    /** @type {ReleaseParityModel[]} Data parity verification items */
    parity: ReleaseParityModel[];
    /** @type {ReleaseIssueModel[]} Issues and risks */
    issues: ReleaseIssueModel[];
    /** @type {Array<{file: string, size?: string, hash?: string, type?: string}>} Artifact files */
    files: Array<{
        file: string;
        size?: string;
        hash?: string;
        type?: string;
    }>;
    /** @type {Record<string, any>} Frontmatter / metadata */
    meta: Record<string, any>;
}
import { Model } from '@nan0web/types';
import { ReleaseMemberModel } from './ReleaseMemberModel.js';
import { ReleaseTaskModel } from './ReleaseTaskModel.js';
import { ReleaseParityModel } from './ReleaseParityModel.js';
import { ReleaseIssueModel } from './ReleaseIssueModel.js';
