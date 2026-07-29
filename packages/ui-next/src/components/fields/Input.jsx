'use client';

import React from 'react';

export function Input(props) {
    const { type = 'text', value, onChange, ...rest } = props;
    
    // File inputs cannot be programmatically controlled with a generic value
    if (type === 'file') {
        return (
            <div style={{ padding: '2rem', border: '2px dashed var(--border-color, #ccc)', borderRadius: '8px', textAlign: 'center', background: 'var(--bg-main, transparent)' }}>
                <input 
                    type="file" 
                    onChange={e => onChange?.(e.target.files)} 
                    {...rest} 
                    style={{ width: '100%', cursor: 'pointer' }} 
                />
                <p style={{ marginTop: '1rem', color: 'var(--text-main, #666)' }}>Drag and drop files here, or click to select.</p>
            </div>
        );
    }
    
    // Color inputs need specific dimensions to look good
    if (type === 'color') {
        return (
            <input 
                type="color" 
                value={value || '#000000'} 
                onChange={e => onChange?.(e.target.value)} 
                {...rest} 
                style={{ width: '100px', height: '40px', padding: '0.2rem', cursor: 'pointer', border: '1px solid var(--border-color, #ccc)' }} 
            />
        );
    }
    
    return (
        <input 
            type={type} 
            value={value || ''} 
            onChange={e => onChange?.(e.target.value)} 
            {...rest} 
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} 
        />
    );
}
