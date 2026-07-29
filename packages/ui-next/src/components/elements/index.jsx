'use client';
import React from 'react';
export { Input } from '../fields/Input.jsx';
export { Select } from '../fields/Select.jsx';
export { Checkbox } from '../fields/Checkbox.jsx';
export { Markdown } from '../fields/Markdown.jsx';

export function Alert({ message, variant = 'info' }) {
    const styles = {
        error: { bg: '#fee2e2', color: '#991b1b' },
        success: { bg: '#dcfce7', color: '#166534' },
        warn: { bg: '#fef3c7', color: '#92400e' },
        warning: { bg: '#fef3c7', color: '#92400e' },
        info: { bg: '#e0f2fe', color: '#075985' },
        default: { bg: '#f1f5f9', color: '#334155' }
    };
    const s = styles[variant] || styles.default;
    return (
        <div style={{ padding: '1rem', background: s.bg, color: s.color, borderRadius: '6px', marginBottom: '1rem' }}>
            {message}
        </div>
    );
}

export function Toast({ message }) {
    return (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#333', color: '#fff', padding: '1rem', borderRadius: '6px', zIndex: 9999 }}>
            {message}
        </div>
    );
}

export function Badge({ label, color = '#64748b' }) {
    // Determine if color is light to ensure dark text contrast
    const isLight = color === '#eab308' || color === 'yellow' || color === '#fef08a' || color === '#fef3c7';
    const textColor = isLight ? '#1e293b' : '#fff';
    
    return (
        <span style={{ background: color, color: textColor, padding: '0.2rem 0.5rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            {label}
        </span>
    );
}

export function Text({ content, type = 'body', children, author }) {
    let text = content || children;
    
    // Support nested inline styling arrays
    if (Array.isArray(text)) {
        text = text.map((item, i) => {
            if (typeof item === 'string') return <span key={i}>{item}</span>;
            const key = Object.keys(item)[0];
            return <Text key={i} type={key} content={item[key]} />;
        });
    }

    if (type === 'h1' || type === 'title') return <h1 style={{ margin: '1rem 0 0.5rem' }}>{text}</h1>;
    if (type === 'h2' || type === 'subtitle') return <h2 style={{ margin: '1rem 0 0.5rem' }}>{text}</h2>;
    if (type === 'h3') return <h3 style={{ margin: '1rem 0 0.5rem' }}>{text}</h3>;
    if (type === 'h4') return <h4 style={{ margin: '1rem 0 0.5rem' }}>{text}</h4>;
    if (type === 'h5') return <h5>{text}</h5>;
    if (type === 'h6') return <h6>{text}</h6>;
    if (type === 'strong') return <strong>{text}</strong>;
    if (type === 'em') return <em>{text}</em>;
    if (type === 'mark') return <mark style={{ padding: '0.2rem', borderRadius: '4px' }}>{text}</mark>;
    
    if (type === 'blockquote') {
        return (
            <blockquote style={{ borderLeft: '4px solid var(--border-color, #ccc)', margin: '1rem 0', paddingLeft: '1rem', color: 'var(--text-sidebar, #666)' }}>
                <div style={{ fontStyle: 'italic' }}>{text}</div>
                {author && <div style={{ marginTop: '0.5rem', fontWeight: 'bold', fontSize: '0.9em' }}>— {author}</div>}
            </blockquote>
        );
    }
    
    // Default to paragraph
    return <p style={{ margin: '0 0 1rem 0' }}>{text}</p>;
}

export function Table({ columns, data }) {
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <thead>
                <tr>
                    {columns.map(c => <th key={c.key} style={{ borderBottom: '2px solid #ccc', padding: '0.5rem', textAlign: 'left' }}>{c.label}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (
                    <tr key={i}>
                        {columns.map(c => <td key={c.key} style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{row[c.key]}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function Confirm({ message, onConfirm, onCancel }) {
    return (
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '1rem' }}>
            <p style={{ fontWeight: 'bold' }}>{message}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={() => onConfirm?.()} style={{ padding: '0.5rem 1rem', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Yes</button>
                <button onClick={() => onCancel?.()} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>No</button>
            </div>
        </div>
    );
}

export function Multiselect({ options, value = [], onChange }) {
    const toggle = (opt) => {
        if (!onChange) return;
        if (value.includes(opt)) onChange(value.filter(v => v !== opt));
        else onChange([...value, opt]);
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {options.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} />
                    {opt}
                </label>
            ))}
        </div>
    );
}

export function Mask({ value, onChange, maskChar = '*', placeholder }) {
    // simple mask implementation (just a password field or visual mask)
    return (
        <input 
            type="password" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
        />
    );
}

export function Spinner({ message = 'Loading...' }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '16px', height: '16px', border: '2px solid #ccc', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span>{message}</span>
        </div>
    );
}
