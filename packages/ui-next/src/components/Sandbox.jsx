"use client";

import React, { useState } from 'react';
import { Element as CoreElement } from '@nan0web/ui';
import { ServerElement } from './ServerElement.jsx';
import { ClientAppLoader } from './ClientAppLoader.jsx';
import { useUIContext } from '../context/UIContext.jsx';

/**
 * Sandbox Editor for UI-Next
 * Provides a split view with a JSON editor on the left and a live preview on the right.
 */
export function Sandbox({ initialContent, children, value, components = {} }) {
    const rawContent = initialContent ?? (typeof children === 'object' && children !== null ? children : (value ?? {}));
    const [contentStr, setContentStr] = useState(() => JSON.stringify(rawContent, null, 2));
    const [contentObj, setContentObj] = useState(rawContent);
    const [error, setError] = useState(null);
    const context = useUIContext();

    const activeComponents = {
        ...(context?.components instanceof Map ? Object.fromEntries(context.components) : context?.components),
        ...components
    };

    const handleChange = (e) => {
        const val = e.target.value;
        setContentStr(val);
        try {
            const parsed = JSON.parse(val);
            setContentObj(parsed);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Editor Pane */}
            <div className="w-full md:w-1/3 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 flex justify-between items-center">
                    <h2 className="text-lg font-semibold font-mono">OLMUI Sandbox</h2>
                    {error && <span className="text-xs text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">Invalid JSON</span>}
                </div>
                <div className="flex-1 p-2">
                    <textarea 
                        className="w-full h-full p-2 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={contentStr}
                        onChange={handleChange}
                        spellCheck="false"
                    />
                </div>
                {error && (
                    <div className="p-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}
            </div>

            {/* Preview Pane */}
            <div className="w-full md:w-2/3 flex flex-col relative bg-white dark:bg-gray-900 overflow-y-auto">
                <div className="absolute top-0 right-0 p-2 opacity-50 text-xs font-mono select-none pointer-events-none">
                    Preview (Client Mode)
                </div>
                <div className="flex-1 w-full relative">
                    {Array.isArray(contentObj?.$content) 
                        ? contentObj.$content.map((block, i) => (
                            <ClientPreview key={i} input={block} components={activeComponents} context={context} elementKey={`preview-${i}`} />
                        ))
                        : <ClientPreview input={contentObj} components={activeComponents} context={context} />
                    }
                </div>
            </div>
        </div>
    );
}

/**
 * A synchronous client-side renderer for the Sandbox.
 * Mirrors ServerElement logic but runs synchronously on the client.
 */
function ClientPreview({ input, components = {}, context = {}, elementKey = 'preview-0' }) {
    if (input == null) return null;

    // 1. Document Layout Phase ($content array)
    if (typeof input === 'object' && input !== null && Array.isArray(input.$content) && !context._inLayout) {
        const pageContent = input.content ?? [];
        const nextContext = { ...context, _inLayout: true, pageContent };
        return (
            <React.Fragment>
                {input.$content.map((block, i) => (
                    <ClientPreview 
                        key={`${elementKey}-${i}`} 
                        input={block} 
                        components={components} 
                        context={nextContext} 
                        elementKey={`${elementKey}-${i}`} 
                    />
                ))}
            </React.Fragment>
        );
    }

    // 2. Substitution for Content / Content: true placeholder in layout
    if (context._inLayout && (input === 'Content' || (typeof input === 'object' && input !== null && (input.Content === true || input.content === true)))) {
        const contentBody = context.pageContent;
        if (!contentBody || (Array.isArray(contentBody) && contentBody.length === 0)) return null;
        return <ClientPreview input={contentBody} components={components} context={context} elementKey={elementKey} />;
    }

    if (typeof input === 'string' || typeof input === 'number') {
        const type = String(input);
        if (type && /^[A-Z]/.test(type) && components[type]) {
            return <ClientPreview input={{ [type]: true }} components={components} context={context} elementKey={elementKey} />;
        }
        return input;
    }

    let type, value, rawProps = {};
    if (input instanceof CoreElement) {
        type = input.type;
        value = input.content;
        rawProps = input.props;
    } else {
        rawProps = CoreElement.extractProps(input);
        const tags = CoreElement.extractTags(input);
        const arr = tags[0] ?? ['div', input.$content ?? input.content ?? ''];
        type = arr[0];
        value = arr[1];
    }

    if (type === 'App' || type.startsWith('App.')) {
        const name = type === 'App' ? (input[type] ?? '') : type.split('.')[1];
        if (!name) return <div className="alert alert-danger">App name must be provided</div>;
        return <ClientAppLoader name={name} input={input} elementProps={rawProps} renderKey={elementKey} />;
    }

    if (type.includes('.') && !type.startsWith('App.')) {
        const parts = type.split('.');
        type = parts[0];
        const dotClasses = parts.slice(1).join(' ');
        rawProps.className = rawProps.className ? `${rawProps.className} ${dotClasses}` : dotClasses;
    }

    const RESERVED_DIRECTIVES = new Set(['Sandbox', 'content', 'lang', 'redirect', 'hideTitle']);
    const props = {};
    for (const [propName, val] of Object.entries(rawProps)) {
        if (RESERVED_DIRECTIVES.has(propName)) continue;
        if (propName === 'data-test') props['data-testid'] = val;
        else props[propName] = val;
    }

    const isCapitalized = /^[A-Z]/.test(type);
    let Component = type;

    if (components[type]) Component = components[type];
    else if (components[type.toLowerCase()]) Component = components[type.toLowerCase()];
    else if (isCapitalized) return <div className="alert alert-warning" key={elementKey}>Missing Component: {type}</div>;

    // Support Dual Prop Format & Primitive String Value for Custom Components
    if (isCapitalized || components[type]) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(props, value);
        } else if (typeof value === 'string') {
            if (props.title === undefined) props.title = value;
            if (props.copyright === undefined) props.copyright = value;
        }
    }

    const isVoidElement = ['img', 'input', 'br', 'hr', 'meta', 'link'].includes(type.toLowerCase());
    const isList = ['ul', 'ol'].includes(type.toLowerCase());

    let children = null;
    if (!isVoidElement) {
        if (Array.isArray(value)) {
            children = value.map((item, i) => {
                const childKey = `${elementKey}-${i}`;
                const childInput = (isList && typeof item !== 'object') ? { li: item } : item;
                return <ClientPreview key={childKey} input={childInput} components={components} context={context} elementKey={childKey} />;
            });
        } else if (typeof value === 'string' || typeof value === 'number') {
            children = isList 
                ? <ClientPreview input={{ li: value }} components={components} context={context} elementKey={`${elementKey}-0`} />
                : value;
        }
    }

    if (isVoidElement) return React.createElement(Component, { key: elementKey, ...props }, null);
    return React.createElement(Component, { key: elementKey, ...props }, children);
}
