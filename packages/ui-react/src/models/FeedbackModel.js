import { Model } from '@nan0web/core'

/**
 * FeedbackModel (v2)
 * 
 * Domain model for feedback submissions.
 * Includes schema for forms and validation logic.
 */
export default class FeedbackModel extends Model {
    static label = 'feedback'
    
    // Schema definitions for individual fields
    static myFullName = { 
        help: 'feedback.full_name_help', 
        default: '', 
        type: 'string',
        required: true,
        minLength: 3
    }
    
    static myContacts = { 
        help: 'feedback.contacts_help', 
        default: '', 
        type: 'string',
        required: true,
        minLength: 6
    }
    
    static myPosition = { 
        help: 'feedback.position_help', 
        default: 'Bank Client', 
        type: 'enum',
        options: [
            'Bank Employee',
            'Bank Client',
            'Business Partner',
            'Investor',
            'Other Interested Party'
        ],
        required: true
    }
    
    static bankEmployee = { 
        help: 'feedback.bank_employee_help', 
        default: '', 
        type: 'string',
        required: true
    }
    
    static date = { 
        help: 'feedback.date_help', 
        default: () => new Date().toISOString().split('T')[0], 
        type: 'date',
        required: true
    }
    
    static myText = { 
        help: 'feedback.message_help', 
        default: '', 
        type: 'text',
        required: true,
        minLength: 10
    }
    
    static agreement = { 
        help: 'feedback.agreement_help', 
        default: false, 
        type: 'boolean',
        required: true
    }

    constructor(data = {}, options = {}) {
        super(data, options)
        /** @type {string} */ this.myFullName
        /** @type {string} */ this.myContacts
        /** @type {string} */ this.myPosition
        /** @type {string} */ this.bankEmployee
        /** @type {string} */ this.date
        /** @type {string} */ this.myText
        /** @type {boolean} */ this.agreement
    }

    /**
     * Validates the feedback object against the schema.
     * Use this manually or via resolveValidation override.
     */
    validate() {
        const errors = {}
        const t = this._.t || ((k) => k)

        if (!this.myFullName || this.myFullName.length < 3) {
            errors.myFullName = t('feedback.error.full_name_short')
        }
        if (!this.myContacts || this.myContacts.length < 6) {
            errors.myContacts = t('feedback.error.contacts_missing')
        }
        if (!this.myPosition) {
            errors.myPosition = t('feedback.error.position_missing')
        }
        if (!this.bankEmployee) {
            errors.bankEmployee = t('feedback.error.employee_missing')
        }
        if (!this.date) {
            errors.date = t('feedback.error.date_missing')
        }
        if (!this.myText || this.myText.length < 10) {
            errors.myText = t('feedback.error.message_short')
        }
        if (!this.agreement) {
            errors.agreement = t('feedback.error.agreement_required')
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }
}
