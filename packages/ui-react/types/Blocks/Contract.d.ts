/**
 * Contract — renders doc.doc.contract (array of sections with title, id, content).
 * Equivalent to contract.ejs layout.
 * Includes a sticky dropdown navigator and full document sections.
 * @param {Object} props
 * @param {Object} props.doc
 * @param {Function} [props.onNavigate]
 * @param {string} [props.locale]
 * @param {Object} [props.db]
 * @param {Object} [props.globals]
 * @param {Object} [props.duty]
 */
export function Contract({ doc, onNavigate, locale, db, globals, duty }: {
    doc: any;
    onNavigate?: Function | undefined;
    locale?: string | undefined;
    db?: any;
    globals?: any;
    duty?: any;
}): import("react/jsx-runtime").JSX.Element | null;
