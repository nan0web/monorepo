/**
 * VisualAdapter (Base)
 * 
 * Базовий клас для візуальної трансформації інтенцій OLMUI.
 */
import { NaN0 } from '@nan0web/types'

export class VisualAdapter {
    /**
     * Конвертує одну інтенцію у просте текстове представлення.
     * @param {object} intent - Intent entry from LogicInspector
     * @param {function} [t] - i18n translate function
     * @returns {string} Raw description
     */
    static render(intent, t = (k) => k) {
        let node;
        switch (intent.type) {
            case 'ask':
                node = { ask: { field: intent.field, input: intent.input !== undefined ? intent.input : '...' } }
                break
            case 'progress':
                node = { progress: { message: intent.message || '' } }
                break
            case 'log':
                node = { log: { level: intent.level?.toUpperCase() || 'INFO', message: intent.message } }
                break
            case 'render':
                node = { render: { [intent.component]: intent.props || {} } }
                break
            case 'result': {
                const data = intent.data || {}
                node = { result: (typeof data === 'object' && data !== null && Object.keys(data).length === 0) ? {} : data }
                break
            }
            default:
                node = { [intent.type || 'unknown']: intent }
                break
        }
        
        try {
            return NaN0.stringify([node]).trim()
        } catch (e) {
            return `- error: ${JSON.stringify(node)}`
        }
    }
}
