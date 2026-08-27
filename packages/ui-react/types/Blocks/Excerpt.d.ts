/**
 * Excerpt — renders doc.doc.excerpt (array of objects for nano2html)
 * Equivalent to /_/content/excerpt logic.
 * @param {Object} props
 * @param {Object} props.doc
 */
export function Excerpt({ doc, ...sharedProps }: {
    doc: any;
}): import("react/jsx-runtime").JSX.Element | null;
