export default Blog;
/**
 * Blog component - displays a list of blog posts with V2 styling.
 */
declare function Blog({ posts: propPosts, initialCount, perPage }: {
    posts: any;
    initialCount?: number;
    perPage?: number;
}): import("react/jsx-runtime").JSX.Element;
