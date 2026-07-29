'use client';

import React, { useState } from 'react';
import { Input } from './fields/Input.jsx';
import { Select } from './fields/Select.jsx';
import { Checkbox } from './fields/Checkbox.jsx';
import { Markdown } from './fields/Markdown.jsx';

function Field({ name, fieldDef, value, onChange }) {
    const type = fieldDef.type || 'string';
    const label = fieldDef.help || name;
    
    const handleChange = (newVal) => {
        onChange(newVal);
    };

    if (type === 'model') {
        const NestedModel = fieldDef.model;
        return (
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>
                <ModelForm 
                    schema={NestedModel} 
                    value={value || {}} 
                    onChange={handleChange} 
                />
            </div>
        );
    }

    if (type === 'boolean') {
        return (
            <div style={{ marginBottom: '1rem' }}>
                <Checkbox 
                    label={label}
                    checked={!!value}
                    onChange={(e) => handleChange(e.target.checked)}
                />
            </div>
        );
    }

    if (type === 'select') {
        return (
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>
                <Select 
                    value={value || fieldDef.default || ''}
                    options={fieldDef.options || []}
                    onChange={(e) => handleChange(e.target.value)}
                />
            </div>
        );
    }

    if (type === 'markdown' || type === 'textarea') {
        return (
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>
                <Markdown 
                    value={value || ''} 
                    onChange={(val) => handleChange(val)} 
                    placeholder={fieldDef.placeholder || ''}
                />
            </div>
        );
    }

    const inputType = ['password', 'number', 'date', 'datetime-local'].includes(type) ? type : 'text';

    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>
            <Input 
                type={inputType}
                value={value || ''} 
                onChange={(e) => {
                    let val = e.target.value;
                    if (inputType === 'number' && val !== '') val = Number(val);
                    handleChange(val);
                }} 
                placeholder={fieldDef.placeholder || ''}
            />
            {fieldDef.error && value && fieldDef.validate && fieldDef.validate(value) !== true && (
                <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    {fieldDef.validate(value)}
                </div>
            )}
        </div>
    );
}

function ModelForm({ schema, value, onChange }) {
    if (!schema) return null;
    const fields = Object.keys(schema);
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '2px solid #ddd', paddingLeft: '1rem' }}>
            {fields.map(key => (
                <Field 
                    key={key} 
                    name={key} 
                    fieldDef={schema[key]} 
                    value={value?.[key]} 
                    onChange={v => onChange({ ...value, [key]: v })} 
                />
            ))}
        </div>
    );
}

export function OlmuiForm({ intent, onSubmit, onCancel }) {
    const isClass = intent.model && typeof intent.schema === 'function';
    // Initialize state properly
    const [value, setValue] = useState(isClass ? {} : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(value);
    };

    return (
        <form className="olmui-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
            {intent.message && <h3 style={{ marginBottom: '1rem' }}>{intent.message}</h3>}
            
            {isClass ? (
                <ModelForm 
                    schema={intent.schema} 
                    value={value} 
                    onChange={setValue} 
                />
            ) : (
                <Field 
                    name={intent.field} 
                    fieldDef={intent.schema || {}} 
                    value={value} 
                    onChange={setValue} 
                />
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Submit
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} style={{ padding: '0.5rem 1rem', background: '#eaeaea', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
