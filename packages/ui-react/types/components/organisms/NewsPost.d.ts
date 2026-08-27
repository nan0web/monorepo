export default NewsPost;
/**
 * Premium NewsPost component (v2)
 *
 * Generic article/post template with multimedia support.
 * Features:
 * - Image/Video/Gallery rendering
 * - Advanced typography and meta-data layout
 * - OLMUI-compliant styling (variables-based)
 * - Safe HTML content rendering
 */
declare function NewsPost({ post, className }: {
    post: any;
    className?: string | undefined;
}): import("react/jsx-runtime").JSX.Element | null;
declare namespace NewsPost {
    namespace propTypes {
        let post: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
            id: PropTypes.Requireable<NonNullable<string | number | null | undefined>>;
            title: PropTypes.Validator<string>;
            author: PropTypes.Requireable<string>;
            date: PropTypes.Requireable<NonNullable<string | number | Date | null | undefined>>;
            image: PropTypes.Requireable<string>;
            images: PropTypes.Requireable<(string | null | undefined)[]>;
            video: PropTypes.Requireable<string>;
            url: PropTypes.Requireable<string>;
            excerpt: PropTypes.Requireable<string>;
            content: PropTypes.Requireable<string>;
            categories: PropTypes.Requireable<(NonNullable<string | PropTypes.InferProps<{
                title: PropTypes.Requireable<string>;
                url: PropTypes.Requireable<string>;
            }> | null | undefined> | null | undefined)[]>;
        }>>>;
        let className: PropTypes.Requireable<string>;
    }
}
import PropTypes from 'prop-types';
