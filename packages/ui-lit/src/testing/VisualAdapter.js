import { VisualAdapter as BaseVisualAdapter } from '@nan0web/ui/testing'

/**
 * VisualAdapter (Lit / Web)
 * 
 * Рендерить "Логічні зліпки" у форматі HTML (Lit-templates) для відображення в інспекторі.
 */
export class VisualAdapter extends BaseVisualAdapter {
    /**
     * Конвертує одну інтенцію у візуальний блок (HTML Snapshot).
     * @param {object} intent - Intent entry from LogicInspector
     * @param {function} t - i18n translate function
     * @returns {string} HTML string (placeholder for real Lit template)
     */
    static render(intent, t = (k) => k) {
        // У @nan0web/ui-lit ми повертаємо HTML-розмітку для Web-галереї
        if (intent.type === 'ask') {
            return `
                <div class="olmui-ask">
                    <b>[ASK]</b> <code>${intent.field}</code>: <i>${t(intent.schema?.help || '')}</i>
                    ${intent.schema?.options ? `<ul>${intent.schema.options.map(o => `<li>${o.label}</li>`).join('')}</ul>` : ''}
                    <div class="olmui-input">${intent.input}</div>
                </div>
            `
        }

        if (intent.type === 'log') {
            return `<div class="olmui-log olmui-log-${intent.level}">${JSON.stringify(intent.message)}</div>`
        }

        return `<div class="olmui-unknown">${intent.type}</div>`
    }
}
