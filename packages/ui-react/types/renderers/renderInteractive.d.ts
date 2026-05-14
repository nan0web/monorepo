/**
 * Universal Renderer для interactive apps.
 * Обробляє requiresInput (форма) і compute (обчислення).
 * Agnostic apps повертають дані, рендерер будує JSX динамічно.
 *
 * @param {Object} input
 * @param {Object} input.element - Результат app.run() { requiresInput, compute, content }
 * @param {Object} input.context - UI контекст з actions
 * @returns {React.ReactNode} Форма + динамічний результат
 */
declare function renderInteractive({ element, context }: {
    element: any;
    context: any;
}): React.ReactNode;
declare namespace renderInteractive {
    namespace propTypes {
        let element: PropTypes.Requireable<PropTypes.InferProps<{
            requiresInput: PropTypes.Requireable<object>;
            compute: PropTypes.Requireable<(...args: any[]) => any>;
            content: PropTypes.Requireable<any[]>;
        }>>;
        let context: PropTypes.Validator<object>;
    }
}
export default renderInteractive;
import React from 'react';
import PropTypes from 'prop-types';
