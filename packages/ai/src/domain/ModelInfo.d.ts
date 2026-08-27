import { Model } from '@nan0web/types';
import { Pricing } from './Pricing.js';
import { Architecture } from './Architecture.js';
import { TopProvider } from './TopProvider.js';
import { Limits } from './Limits.js';
/**
 * ModelInfo — represents technical and commercial metadata for an AI model.
 * Inherits from Model to conform to Model-as-Schema v2.
 */
export declare class ModelInfo extends Model {
    /** @type {string[]} Allowed model params */
    supported_parameters: string[];
    /** @type {Record<string, any>} Default generation params */
    default_parameters: Record<string, any>;
    /** @type {Architecture} Architecture component */ architecture: Architecture;
    /** @type {Pricing} Commercial metrics */ pricing: Pricing;
    /** @type {TopProvider} Org/Owner metadata */ top_provider: TopProvider;
    /** @type {Limits} Active rate limits */ limits: Limits;
    _volume: number | undefined;
    static id: {
        help: string;
        default: string;
    };
    static architecture: {
        help: string;
        default: {};
    };
    static canonical_slug: {
        help: string;
        default: string;
    };
    static context_length: {
        help: string;
        default: number;
    };
    static maximum_output: {
        help: string;
        default: number;
    };
    static limits: {
        help: string;
        default: {};
    };
    static created: {
        help: string;
        default: number;
    };
    static default_parameters: {
        help: string;
        default: {};
    };
    static description: {
        help: string;
        default: string;
    };
    static hugging_face_id: {
        help: string;
        default: string;
    };
    static name: {
        help: string;
        default: string;
    };
    static per_request_limit: {
        help: string;
        default: number;
    };
    static pricing: {
        help: string;
        default: {};
    };
    /** @type {{ help: string, default: string[] }} */
    static supported_parameters: {
        help: string;
        default: string[];
    };
    static provider: {
        help: string;
        default: string;
    };
    static top_provider: {
        help: string;
        default: {};
    };
    static supports_tools: {
        help: string;
        default: boolean;
    };
    static supports_structured_output: {
        help: string;
        default: boolean;
    };
    static status: {
        help: string;
        options: string[];
        default: string;
    };
    static is_moderated: {
        help: string;
        default: boolean;
    };
    /**
     * @param {Record<string, any> & { volume?: number }} [data] Initial state with optional volume
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options] Model options
     */
    constructor(data?: Record<string, any> & {
        volume?: number;
    }, options?: Partial<import('@nan0web/types').ModelOptions>);
    /** @returns {number} The volume of parameters inside model */
    get volume(): number;
    /** @param {number} v */
    set volume(v: number);
}
