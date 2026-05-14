/**
 * Files — renders doc.files as download links.
 * Equivalent to /_/content/files in product.ejs & standard.ejs.
 * @param {Object} props
 * @param {Object} props.doc
 * @param {string} [props.title] - Custom title for the files section
 * @param {string} [props.locale='uk']
 */
export function Files({ doc, title, locale }: {
    doc: any;
    title?: string | undefined;
    locale?: string | undefined;
}): import("react/jsx-runtime").JSX.Element | null;
