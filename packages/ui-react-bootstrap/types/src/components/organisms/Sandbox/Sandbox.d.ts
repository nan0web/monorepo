/**
 * ComponentSandbox — ізольоване середовище для попереднього перегляду компонентів.
 *
 * Дозволяє:
 * - Рендерити $content у пісочниці з вибором джерела даних (document)
 * - Автоматично знаходити документи, що містять потрібні компоненти (auto-discovery)
 * - Перемикати джерело даних через select
 *
 * @param {Object} props
 * @param {Object} props.doc - Поточний документ (fallback)
 * @param {Object} props.node - Конфігурація Sandbox з YAML ($content, label, docs, selectDocs, style)
 * @param {Object} props.db - Інстанс BrowserDB для завантаження документів
 * @param {string} props.locale - Поточна локаль
 * @param {Function} props.t - Функція перекладу
 * @param {Function} [props.onNavigate] - Обробник навігації
 * @param {Object} [props.globals] - Глобальний контекст
 */
export default function Sandbox({ doc, node, db, locale, t, onNavigate, globals }: {
    doc: any;
    node: any;
    db: any;
    locale: string;
    t: Function;
    onNavigate?: Function;
    globals?: any;
}): import("react/jsx-runtime").JSX.Element;
