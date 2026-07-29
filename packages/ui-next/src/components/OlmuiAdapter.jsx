'use client';

import React from 'react';
import { OlmuiForm } from './OlmuiForm.jsx';
import { OlmuiShow } from './OlmuiShow.jsx';
import { OlmuiProgress } from './OlmuiProgress.jsx';

export function OlmuiAdapter({ state, onSubmit, onCancel, onAcknowledge, components = {} }) {
    if (state.error) {
        return (
            <div className="olmui-error" style={{ color: 'red', padding: '1rem', border: '1px solid red' }}>
                <h3>Error</h3>
                <pre>{state.error.message}</pre>
            </div>
        );
    }

    if (state.done) {
        if (components.Done) {
            const DoneComponent = components.Done;
            return <DoneComponent data={state.data} />;
        }
        if (state.data === undefined && state.intent?.type === 'result') {
            return null; // Don't show anything if there's no final return value
        }
        return <div className="olmui-done">Done.</div>;
    }

    const { intent } = state;
    if (!intent) return null;

    switch (intent.type) {
        case 'ask':
            return (
                <OlmuiForm 
                    intent={intent} 
                    onSubmit={onSubmit} 
                    onCancel={onCancel} 
                />
            );
        case 'show':
            return (
                <OlmuiShow 
                    intent={intent} 
                    onAcknowledge={onAcknowledge} 
                />
            );
        case 'progress':
            return (
                <OlmuiProgress 
                    intent={intent} 
                />
            );
        case 'render':
            if (components.Render) {
                const RenderComponent = components.Render;
                return <RenderComponent intent={intent} />;
            }
            return <div className="olmui-render">Render Intent: {JSON.stringify(intent.data)}</div>;
        default:
            return <div>Unknown intent type: {intent.type}</div>;
    }
}
