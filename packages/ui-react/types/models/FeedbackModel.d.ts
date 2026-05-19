/**
 * FeedbackModel (v2)
 *
 * Domain model for feedback submissions.
 * Includes schema for forms and validation logic.
 */
export default class FeedbackModel extends Model {
    static label: string;
    static myFullName: {
        help: string;
        default: string;
        type: string;
        required: boolean;
        minLength: number;
    };
    static myContacts: {
        help: string;
        default: string;
        type: string;
        required: boolean;
        minLength: number;
    };
    static myPosition: {
        help: string;
        default: string;
        type: string;
        options: string[];
        required: boolean;
    };
    static bankEmployee: {
        help: string;
        default: string;
        type: string;
        required: boolean;
    };
    static date: {
        help: string;
        default: () => string;
        type: string;
        required: boolean;
    };
    static myText: {
        help: string;
        default: string;
        type: string;
        required: boolean;
        minLength: number;
    };
    static agreement: {
        help: string;
        default: boolean;
        type: string;
        required: boolean;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} */ myFullName: string;
    /** @type {string} */ myContacts: string;
    /** @type {string} */ myPosition: string;
    /** @type {string} */ bankEmployee: string;
    /** @type {string} */ date: string;
    /** @type {string} */ myText: string;
    /** @type {boolean} */ agreement: boolean;
    /**
     * Validates the feedback object against the schema.
     * Use this manually or via resolveValidation override.
     */
    validate(): {
        isValid: boolean;
        errors: {
            myFullName: string;
            myContacts: string;
            myPosition: string;
            bankEmployee: string;
            date: string;
            myText: string;
            agreement: string;
        };
    };
}
import { Model } from '@nan0web/types';
