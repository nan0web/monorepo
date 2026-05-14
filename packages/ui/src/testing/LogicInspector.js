import { runGenerator } from '../core/GeneratorRunner.js'

/**
 * LogicInspector
 * 
 * Базовий клас для захоплення "Логічних зліпків" (Intent Stream) будь-яких моделей OLMUI.
 * Дозволяє виконувати чисто-логічне тестування без прив'язки до рендерингу.
 */
export class LogicInspector {
    /**
     * Виконує генератор моделі та записує послідовність усіх інтенцій.
     * @param {AsyncGenerator<import('../core/Intent.js').Intent, import('../core/Intent.js').ResultIntent, import('../core/Intent.js').IntentResponse>} modelStream - результат виклику model.run()
     * @param {object} options 
     * @param {Array<any> | ((locale: string) => Array<any>)} [options.inputs] - черга вхідних значень для askIntent
     * @param {string} [options.locale] - локаль для тестів
     * @param {function} [options.t] - функція перекладу
     * @returns {Promise<Array<any>>} Intent Stream Log
     */
    static async capture(modelStream, { inputs = [], locale = 'uk', t = (k) => k } = {}) {
        const intents = []
        let inputIdx = 0
        const resolvedInputs = typeof inputs === 'function' ? inputs(locale) : inputs

        const recordingAdapter = {
            /** @param {import('../core/Intent.js').AskIntent} i */
            ask: async (i) => {
                const value = resolvedInputs[inputIdx++]
                const entry = { type: 'ask', field: i.field, schema: i.schema, input: value }
                intents.push(entry)
                return { value, cancelled: false }
            },
            /** @param {import('../core/Intent.js').ShowIntent} i */
            show: async (i) => {
                intents.push({ type: 'show', level: i.level || 'info', message: i.message })
            },
            /** @param {import('../core/Intent.js').ProgressIntent} i */
            progress: async (i) => {
                intents.push({ type: 'progress', message: i.message })
            },
            /** @param {import('../core/Intent.js').RenderIntent} i */
            render: async (i) => {
                intents.push({ type: 'render', component: i.component, props: i.props })
            },
            /** @param {import('../core/Intent.js').ResultIntent} i */
            result: async (i) => {
                intents.push({ type: 'result', data: i.data })
            },
            t
        }

        // Викликаємо базовий раннер з нашим записуючим адаптером
        await runGenerator(modelStream, recordingAdapter)
        return intents
    }
}
