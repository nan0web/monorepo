/**
 * Universal Data Model for manifests (project.md and task.md).
 * Follows the 9-Step Master App Pipeline for Zero-Hallucination Development.
 */
export class ProjectModel extends Model {
    static version: {
        help: string;
        type: string;
        required: boolean;
    };
    static type: {
        help: string;
        type: string;
        options: string[];
        default: string;
    };
    static status: {
        help: string;
        type: string;
        options: string[];
        default: string;
    };
    static locale: {
        help: string;
        type: string;
        default: string;
    };
    static models: {
        help: string;
        type: string;
        default: never[];
    };
    static mission: {
        help: string;
        type: string;
        required: boolean;
    };
    static seed: {
        help: string;
        type: string;
        required: boolean;
    };
    static model: {
        help: string;
        type: string;
        required: boolean;
    };
    static contract: {
        help: string;
        type: string;
        default: never[];
    };
    static adapter: {
        help: string;
        type: string;
        required: boolean;
    };
    static ui_cli: {
        help: string;
        type: string;
        default: never[];
    };
    static ui_chat: {
        help: string;
        type: string;
        default: never[];
    };
    static ui_web: {
        help: string;
        type: string;
        default: never[];
    };
    static ui_mobile: {
        help: string;
        type: string;
        default: never[];
    };
    static qa: {
        help: string;
        type: string;
        default: never[];
    };
    static get phases(): string[];
    constructor(data?: {}, options?: {});
    /** @type {string|undefined} */ version: string | undefined;
    /** @type {'feature'|'bugfix'|'refactor'|'architecture'|'package'} */ type: "feature" | "bugfix" | "refactor" | "architecture" | "package";
    /** @type {'planning'|'active'|'done'|'deprecated'} */ status: "planning" | "active" | "done" | "deprecated";
    /** @type {string[]} */ models: string[];
    /** @type {string} */ locale: string;
    /** @type {string} */ mission: string;
    /** @type {string} */ seed: string;
    /** @type {string|undefined} */ model: string | undefined;
    /** @type {string[]} */ contract: string[];
    /** @type {string|undefined} */ adapter: string | undefined;
    /** @type {string[]} */ ui_cli: string[];
    /** @type {string[]} */ ui_chat: string[];
    /** @type {string[]} */ ui_web: string[];
    /** @type {string[]} */ ui_mobile: string[];
    /** @type {string[]} */ qa: string[];
}
import { Model } from '@nan0web/types';
