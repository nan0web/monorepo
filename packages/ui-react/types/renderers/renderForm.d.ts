/**
 * Renderer for form elements with dynamic field resolution.
 *
 * @param {object} input - Renderer input object
 * @param {object} input.element - Form element definition
 * @param {object} input.context - UI context with data, actions and translation function
 * @returns {React.ReactNode} Rendered form
 */
export default function renderForm(input: {
    element: object;
    context: object;
}): React.ReactNode;
import React from 'react';
