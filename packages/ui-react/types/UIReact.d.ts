/**
 * @param {Object} props
 * @param {DB} props.db                             database instance
 * @param {string} [props.uri='']                   document URI (e.g. “uk/index”)
 * @param {Partial<UIContextValue>} [props.context] extra context (apps, actions,…)
 * @param {Console|LogConsole} [props.console]      logger (default: window.console)
 */
export default function UIReact({ db, uri, context, console, ...rest }: {
    db: DB;
    uri?: string | undefined;
    context?: Partial<UIContextValue> | undefined;
    console?: Console | LogConsole | undefined;
}): import("react/jsx-runtime").JSX.Element;
import DB from '@nan0web/db-browser';
import UIContextValue from './context/UIContextValue.jsx';
import { LogConsole } from '@nan0web/log';
