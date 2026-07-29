import React from 'react';
import Link from 'next/link';
import { Element as CoreElement } from '@nan0web/ui';
import { ClientAppLoader } from './ClientAppLoader.jsx';

// List of void elements
const voidElements = new Set([
	'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
	'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'
]);

// Elements that have only <li> children
const listElements = new Set(['ul', 'ol']);

/**
 * ServerElement - React Server Component for SSG
 * Renders OLMUI structures statically. Delegates interactive Apps to ClientAppLoader.
 * 
 * @param {Object} props
 * @param {any} props.input - The element structure to render (array, object, primitive)
 * @param {Object} props.components - Registry of static components (e.g. { Header, Footer })
 * @param {Object} props.context - Context object (optional, passed to Client components if needed)
 * @param {number|string} [props.elementKey] - React key
 */
export async function ServerElement({ input, components = {}, context = {}, elementKey = '0' }) {
    if (input == null) return null;

    // 1. Document Layout Phase ($content array)
    if (typeof input === 'object' && input !== null && Array.isArray(input.$content) && !context._inLayout) {
        const pageContent = input.content ?? [];
        const nextContext = { ...context, _inLayout: true, pageContent };
        return (
            <React.Fragment>
                {input.$content.map((block, i) => (
                    <ServerElement 
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
        return <ServerElement input={contentBody} components={components} context={context} elementKey={elementKey} />;
    }

    if (typeof input === 'string' || typeof input === 'number') {
        const type = String(input);
        if (type && /^[A-Z]/.test(type) && components[type]) {
            return <ServerElement input={{ [type]: true }} components={components} context={context} elementKey={elementKey} />;
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

    // Interactive ModelAsApp loading (Client Component)
    if (type === 'App' || type.startsWith('App.')) {
        const name = type === 'App' ? (input[type] ?? '') : type.split('.')[1];
        if (!name) return <div className="alert alert-danger">App name must be provided</div>;

        // Note: ClientAppLoader is a "use client" component. It resolves the app from context.
        return <ClientAppLoader name={name} input={input} elementProps={rawProps} renderKey={elementKey} />;
    }

    // Dot notation (e.g. Alert.warning)
    if (type.includes('.') && !type.startsWith('App.')) {
        const parts = type.split('.');
        const baseName = parts[0];
        if (/^[A-Z]/.test(baseName)) {
            type = baseName;
            const dotClasses = parts.slice(1).join(' ');
            rawProps.className = rawProps.className ? `${rawProps.className} ${dotClasses}` : dotClasses;
        }
    }

    // Process props
    const RESERVED_DIRECTIVES = new Set(['Sandbox', 'content', 'lang', 'redirect', 'hideTitle']);
    const props = {};
    for (const [propName, val] of Object.entries(rawProps)) {
        if (RESERVED_DIRECTIVES.has(propName)) continue;
        if (propName === 'data-test') {
            props['data-testid'] = val;
        } else {
            props[propName] = val;
        }
    }

    const isVoidElement = voidElements.has(type.toLowerCase());
    const isCapitalized = /^[A-Z]/.test(type);
    let Component = null;

    if (components[type]) {
        Component = components[type];
    } else if (components[type.toLowerCase()]) {
        Component = components[type.toLowerCase()];
    } else if (isCapitalized) {
        console.warn(`ServerElement: Component "${type}" not found in component registry.`);
        return <div className="alert alert-warning" key={elementKey}>Missing Component: {type}</div>;
    } else {
        Component = type;
        // PWA Next.js Router optimization
        if (Component === 'a' && props.href && props.href.startsWith('/')) {
            Component = Link;
        }
    }

    // Support Dual Prop Format & Primitive String Value for Custom Components
    if (isCapitalized || components[type]) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(props, value);
        } else if (typeof value === 'string') {
            if (props.title === undefined) props.title = value;
            if (props.copyright === undefined) props.copyright = value;
        }
    }

    let children = null;
    if (!isVoidElement) {
        if (Array.isArray(value)) {
            if (listElements.has(type.toLowerCase())) {
                children = value.map((item, i) => {
                    const liInput = (typeof item === 'object' && item !== null && CoreElement.extractTags(item)[0]?.[0].toLowerCase() === 'li')
                        ? item
                        : { li: Array.isArray(item) ? item : [item] };
                    return <ServerElement key={`${elementKey}-${i}`} input={liInput} components={components} context={context} elementKey={`${elementKey}-${i}`} />;
                });
            } else {
                children = value.map((item, i) =>
                    typeof item === 'object' && item !== null
                        ? <ServerElement key={`${elementKey}-${i}`} input={item} components={components} context={context} elementKey={`${elementKey}-${i}`} />
                        : item
                );
            }
        } else if (typeof value === 'string' || typeof value === 'number') {
            if (listElements.has(type.toLowerCase())) {
                children = <ServerElement input={{ li: value }} components={components} context={context} elementKey={`${elementKey}-0`} />;
            } else {
                children = value;
            }
        }
    }

    if (isVoidElement) {
        return React.createElement(Component, { key: elementKey, ...props }, null);
    }
    return React.createElement(Component, { key: elementKey, ...props }, children);
}
