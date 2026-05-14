/**
 * API UI для аутентифікації
 *
 * Використання:
 * const api = new AuthAPI({ db, router })
 * api.setupRoutes()
 */
export default class AuthAPI {
    constructor({ db, router, tokenManager, logger, tokenRotationRegistry }: {
        db: any;
        router: any;
        tokenManager: any;
        logger: any;
        tokenRotationRegistry: any;
    });
    db: any;
    app: AuthApp;
    router: any;
    /**
     * Налаштовує маршрути для API
     */
    setupRoutes(): any;
    /**
     * Обробка запиту на реєстрацію
     */
    handleSignup(req: any, res: any): Promise<void>;
    /**
     * Обробка підтвердження реєстрації
     */
    handleConfirm(req: any, res: any): Promise<void>;
    /**
     * Обробка запиту на вхід
     */
    handleLogin(req: any, res: any): Promise<void>;
    /**
     * Універсальна обробка повідомлень через додаток
     * @returns {Promise<Array>}
     */
    processMessage(action: any, data: any): Promise<any[]>;
    /**
     * Відправляє відповідь з повідомленнями
     */
    sendResponse(res: any, messages: any): void;
    /**
     * Обробка помилок
     */
    handleError(res: any, error: any): void;
}
import AuthApp from '../AuthApp.js';
