'use client';

import React from 'react';

export function OlmuiProgress({ intent }) {
    const { message = '', value = 0, total = 0 } = intent;

    return (
        <div className="olmui-progress" style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }}>
            <p>{message}</p>
            {total > 0 ? (
                <div>
                    <progress value={value} max={total} style={{ width: '100%' }} />
                    <div style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        {value} / {total}
                    </div>
                </div>
            ) : (
                <div className="olmui-spinner" style={{ fontStyle: 'italic', color: '#666' }}>
                    Loading...
                </div>
            )}
        </div>
    );
}
