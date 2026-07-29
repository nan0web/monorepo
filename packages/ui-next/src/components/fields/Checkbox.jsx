'use client';

import React from 'react';

export function Checkbox({ label, ...rest }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" {...rest} />
            <span>{label}</span>
        </label>
    );
}
