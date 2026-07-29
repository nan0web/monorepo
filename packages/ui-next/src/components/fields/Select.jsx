'use client';

import React from 'react';

export function Select(props) {
    const { options = [], ...rest } = props;
    return (
        <select {...rest} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
            {options.map((opt, i) => (
                <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
            ))}
        </select>
    );
}
