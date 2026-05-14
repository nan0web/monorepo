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
    static capture(modelStream: AsyncGenerator<import("../core/Intent.js").Intent, import("../core/Intent.js").ResultIntent, import("../core/Intent.js").IntentResponse>, { inputs, locale, t }?: {
        inputs?: any[] | ((locale: string) => Array<any>) | undefined;
        locale?: string | undefined;
        t?: Function | undefined;
    }): Promise<Array<any>>;
}
