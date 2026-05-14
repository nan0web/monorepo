export class VisualAdapter {
    /**
     * Конвертує одну інтенцію у просте текстове представлення.
     * @param {object} intent - Intent entry from LogicInspector
     * @param {function} [t] - i18n translate function
     * @returns {string} Raw description
     */
    static render(intent: object, t?: Function): string;
}
