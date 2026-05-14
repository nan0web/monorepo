/**
 * @docs
 * # ApiRouter
 *
 * Маршрутизатор, що повністю базується на доменній моделі.
 *
 * ### Особливості
 * - [x] Не потребує жодних CLI-специфічних полів
 * - [x] Працює прямо з доменною моделлю
 */
export default class ApiRouter {
    /**
     * @param {import('../AuthApp.js').default} app - Додаток для обробки запитів
     */
    constructor(app: import("../AuthApp.js").default);
    app: import("../AuthApp.js").default;
    /**
     * Додає маршрути на основі доменної моделі
     * @param {Function} Message - Клас доменного повідомлення
     */
    add(Message: Function, basePath?: string): this;
    /**
     * Повертає об'єкт маршрутів
     */
    get routes(): any;
    #private;
}
