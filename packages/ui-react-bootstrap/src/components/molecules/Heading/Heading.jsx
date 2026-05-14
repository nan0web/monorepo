import React from 'react';
import { useUI } from '@nan0web/ui-react';

/**
 * Heading component - renders page heading with optional description.
 * @param {Object} props
 * @param {string} props.title - Heading title
 * @param {string} [props.description] - Optional description
 * @param {string} [props.tag='h1'] - HTML tag to use (h1, h2, etc.)
 * @param {string} [props.className] - Optional CSS class
 */
const Heading = ({
    title: propTitle,
    description: propDescription,
    tag: Tag = 'h1',
    className = ''
}) => {
    const { document } = useUI();

    const title = propTitle || document?.title;
    const description = propDescription || document?.description;

    if (!title && !description) return null;

    return (
        <section className={`heading py-4 ${className}`}>
            <div className="container">
                {title && <Tag className="mb-2">{title}</Tag>}
                {description && <p className="lead text-muted">{description}</p>}
            </div>
        </section>
    );
};

export default Heading;
