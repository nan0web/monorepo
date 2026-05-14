/**
 * Семантична форма для реєстрації через AuthApp
 */
export default class AuthForm {
    constructor({ adapter, formId, fieldsConfig }: {
        adapter: any;
        formId?: string | undefined;
        fieldsConfig?: {} | undefined;
    });
    adapter: any;
    formId: string;
    fieldsConfig: {};
    /**
     * Створює форму для реєстрації
     * @param {Object} config
     */
    createSignUpForm({ title, validateValue, validate, setData }: any): UIForm;
    /**
     * Створює конфігурацію полів форми
     * @private
     */
    private _createFieldsConfig;
    /**
     * Перевірка окремого поля
     * @private
     */
    private _defaultValidateValue;
    /**
     * Повна валідація форми
     * @private
     */
    private _defaultValidateForm;
    /**
     * Оновлення стану форми
     * @private
     */
    private _defaultSetData;
}
import { UiForm as UIForm } from '@nan0web/ui';
