export default NewsPost;
/**
 * Generic article/post template.
 */
declare function NewsPost({ post, className }: {
    post: any;
    className?: string | undefined;
}): import("react/jsx-runtime.js").JSX.Element | null;
declare namespace NewsPost {
    namespace propTypes {
        let post: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
            id: PropTypes.Requireable<NonNullable<string | number | null | undefined>>;
            title: PropTypes.Validator<string>;
            date: PropTypes.Requireable<NonNullable<string | number | Date | null | undefined>>;
            image: PropTypes.Requireable<string>;
            url: PropTypes.Requireable<string>;
            excerpt: PropTypes.Requireable<string>;
            content: PropTypes.Requireable<string>;
            categories: PropTypes.Requireable<(NonNullable<string | PropTypes.InferProps<{
                title: PropTypes.Requireable<string>;
                name: PropTypes.Requireable<string>;
                url: PropTypes.Requireable<string>;
            }> | null | undefined> | null | undefined)[]>;
        }>>>;
        let className: PropTypes.Requireable<string>;
    }
}
import PropTypes from 'prop-types';
