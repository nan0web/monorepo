'use client';

import React from 'react';

export function OlmuiShow({ intent, onAcknowledge }) {
    const { level = 'info', message = '' } = intent;

    const colors = {
        info: { border: '#0ea5e9', bg: '#e0f2fe', text: '#0369a1', btn: '#0ea5e9', btnText: '#fff' },
        success: { border: '#22c55e', bg: '#dcfce7', text: '#166534', btn: '#22c55e', btnText: '#fff' },
        warn: { border: '#eab308', bg: '#fef3c7', text: '#92400e', btn: '#eab308', btnText: '#fff' },
        error: { border: '#ef4444', bg: '#fee2e2', text: '#991b1b', btn: '#ef4444', btnText: '#fff' }
    };

    const style = colors[level] || colors.info;

    return (
        <div className={`olmui-show level-${level}`} style={{ padding: '1rem', border: `1px solid ${style.border}`, background: style.bg, color: style.text, borderRadius: '4px', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontWeight: '500' }}>{message}</p>
            {onAcknowledge && (
                <button onClick={() => onAcknowledge()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: style.btn, color: style.btnText, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    OK
                </button>
            )}
        </div>
    );
}
