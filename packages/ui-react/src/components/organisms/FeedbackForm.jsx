import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'
import FeedbackModel from '../../models/FeedbackModel.js'

/**
 * Premium FeedbackForm component (v2)
 * 
 * Integrated with FeedbackModel for validation and schema.
 * Features:
 * - OLMUI-compliant styling (variables-based)
 * - Model-as-Schema validation
 * - Async submission state support
 * - Accessible and responsive layout
 */
const FeedbackForm = ({ 
    onSubmit, 
    initialValues = {}, 
    className = 'nw-feedback-form',
    isAuthRequired = false,
    user = null
}) => {
    const { t, theme } = useUI()
    
    // Initialize model to get defaults and metadata
    const model = useMemo(() => new FeedbackModel(initialValues, { t }), [initialValues, t])
    
    const [formValues, setFormValues] = useState({
        myFullName: user?.name || model.myFullName,
        myContacts: user?.email || user?.phone || model.myContacts,
        myPosition: model.myPosition,
        bankEmployee: model.bankEmployee,
        date: model.date,
        myText: model.myText,
        agreement: model.agreement,
    })

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev }
                delete next[name]
                return next
            })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Create model instance with current values for validation
        const currentModel = new FeedbackModel(formValues, { t })
        const { isValid, errors: validationErrors } = currentModel.validate()
        
        if (!isValid) {
            setErrors(validationErrors)
            return
        }

        setIsSubmitting(true)
        try {
            await onSubmit(formValues)
            setIsSuccess(true)
        } catch (err) {
            console.error('Feedback submission failed:', err)
            setErrors({ _form: t('feedback.error.submission_failed') })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className={`${className} nw-success`} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3>{t('feedback.success.title')}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{t('feedback.success.message')}</p>
                <button 
                    onClick={() => setIsSuccess(false)}
                    className="nw-btn nw-btn-link"
                    style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
                >
                    {t('feedback.action.send_another')}
                </button>
            </div>
        )
    }

    const fieldStyle = {
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
    }

    const inputStyle = {
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
    }

    const labelStyle = {
        fontSize: '0.9rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: 'var(--text-secondary)',
    }

    return (
        <form className={className} onSubmit={handleSubmit} noValidate style={{
            padding: '2rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(20,20,20,0.4) 100%)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '800' }}>{t('feedback.title')}</h2>

            {errors._form && (
                <div style={{ color: 'var(--error, #ff4d4d)', marginBottom: '1rem', padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255, 77, 77, 0.1)' }}>
                    {errors._form}
                </div>
            )}

            <div style={fieldStyle}>
                <label style={labelStyle}>{t('feedback.field.name')}</label>
                <input
                    type="text"
                    name="myFullName"
                    value={formValues.myFullName}
                    onChange={handleChange}
                    placeholder={t(FeedbackModel.myFullName.help)}
                    style={{
                        ...inputStyle,
                        borderColor: errors.myFullName ? 'var(--error, #ff4d4d)' : 'var(--border)'
                    }}
                />
                {errors.myFullName && <span style={{ color: 'var(--error, #ff4d4d)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.myFullName}</span>}
            </div>

            <div style={fieldStyle}>
                <label style={labelStyle}>{t('feedback.field.contacts')}</label>
                <input
                    type="text"
                    name="myContacts"
                    value={formValues.myContacts}
                    onChange={handleChange}
                    placeholder={t(FeedbackModel.myContacts.help)}
                    style={{
                        ...inputStyle,
                        borderColor: errors.myContacts ? 'var(--error, #ff4d4d)' : 'var(--border)'
                    }}
                />
                {errors.myContacts && <span style={{ color: 'var(--error, #ff4d4d)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.myContacts}</span>}
            </div>

            <div style={fieldStyle}>
                <label style={labelStyle}>{t('feedback.field.position')}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {FeedbackModel.myPosition.options.map(option => (
                        <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                            <input
                                type="radio"
                                name="myPosition"
                                value={option}
                                checked={formValues.myPosition === option}
                                onChange={handleChange}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                            />
                            {t(`feedback.position.${option.toLowerCase().replace(/ /g, '_')}`)}
                        </label>
                    ))}
                </div>
                {errors.myPosition && <span style={{ color: 'var(--error, #ff4d4d)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.myPosition}</span>}
            </div>

            <div style={fieldStyle}>
                <label style={labelStyle}>{t('feedback.field.bank_employee')}</label>
                <input
                    type="text"
                    name="bankEmployee"
                    value={formValues.bankEmployee}
                    onChange={handleChange}
                    placeholder={t(FeedbackModel.bankEmployee.help)}
                    style={{
                        ...inputStyle,
                        borderColor: errors.bankEmployee ? 'var(--error, #ff4d4d)' : 'var(--border)'
                    }}
                />
                {errors.bankEmployee && <span style={{ color: 'var(--error, #ff4d4d)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.bankEmployee}</span>}
            </div>

            <div style={fieldStyle}>
                <label style={labelStyle}>{t('feedback.field.date')}</label>
                <input
                    type="date"
                    name="date"
                    value={formValues.date}
                    onChange={handleChange}
                    style={{
                        ...inputStyle,
                        borderColor: errors.date ? 'var(--error, #ff4d4d)' : 'var(--border)'
                    }}
                />
                {errors.date && <span style={{ color: 'var(--error, #ff4d4d)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.date}</span>}
            </div>

            <div style={fieldStyle}>
                <label style={labelStyle}>{t('feedback.field.message')}</label>
                <textarea
                    name="myText"
                    value={formValues.myText}
                    onChange={handleChange}
                    rows={6}
                    placeholder={t(FeedbackModel.myText.help)}
                    style={{
                        ...inputStyle,
                        resize: 'vertical',
                        borderColor: errors.myText ? 'var(--error, #ff4d4d)' : 'var(--border)'
                    }}
                />
                {errors.myText && <span style={{ color: 'var(--error, #ff4d4d)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.myText}</span>}
            </div>

            <div style={{ ...fieldStyle, marginBottom: '2.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    <input
                        type="checkbox"
                        name="agreement"
                        checked={formValues.agreement}
                        onChange={handleChange}
                        style={{ marginTop: '0.2rem', width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>
                        {t('feedback.field.agreement_text')}
                    </span>
                </label>
                {errors.agreement && <span style={{ color: 'var(--error, #ff4d4d)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.agreement}</span>}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '14px',
                    background: 'var(--accent, #61dafb)',
                    color: '#000',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '1rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: isSubmitting ? 0.7 : 1,
                    boxShadow: '0 4px 15px rgba(97, 218, 251, 0.3)'
                }}
            >
                {isSubmitting ? t('feedback.action.submitting') : t('feedback.action.submit')}
            </button>
        </form>
    )
}

FeedbackForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    className: PropTypes.string,
    isAuthRequired: PropTypes.bool,
    user: PropTypes.object
}

export default FeedbackForm
