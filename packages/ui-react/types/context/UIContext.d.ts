/**
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Partial<UIContextValue>} props.value - Additional context values (theme, reducedMotion, etc.)
 */
export function UIProvider({ children, value: initValue }: {
    children: React.ReactNode;
    value: Partial<UIContextValue>;
}): import("react/jsx-runtime").JSX.Element;
export const UIContext: React.Context<UIContextValue>;
export function useUI(): UIContextValue;
import React from 'react';
import UIContextValue from './UIContextValue.jsx';
