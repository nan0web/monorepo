import React from 'react'
import { useUI } from '@nan0web/ui-react'
import './Blog.v2.scss'

/**
 * Blog component - displays a list of blog posts with V2 styling.
 */
const Blog = ({ posts: propPosts, initialCount = 9, perPage = 9 }) => {
	const { document, db, t } = useUI()
	const [fetchedPosts, setFetchedPosts] = React.useState([])
	const [visibleCount, setVisibleCount] = React.useState(initialCount || 9)

	const config = document?.blog || {}
	// Priority: Props -> Document.posts (if configured) -> Document.items (if list page) -> Fetched
	const posts =
		propPosts ||
		config.posts ||
		(document?.type === 'list' ? document.items : null) ||
		fetchedPosts ||
		[]

	React.useEffect(() => {
		if (posts.length === 0 && config.uri && db) {
			db.fetch(config.uri)
				.then((data) => {
					// Support standard list formats
					const list = data.items || data.children || data.$content || []
					setFetchedPosts(list)
				})
				.catch((err) => console.error('Blog fetch error:', err))
		}
	}, [config.uri, posts.length, db])

	const handleLoadMore = () => {
		setVisibleCount((prev) => Math.min(prev + (perPage || 9), posts.length))
	}

	if (!posts || posts.length === 0) {
		return <p className="text-muted">{t('No blog posts available.')}</p>
	}

	const visiblePosts = posts.slice(0, visibleCount)
	const hasMore = visibleCount < posts.length

	return (
		<section className="posts container my-5">
			{visiblePosts.map((post, index) => (
				<article key={index}>
					<figure>
						<a href={post.href}>{post.image && <img src={post.image} alt={post.title} />}</a>
					</figure>
					<header>
						<div className="date">
							<span>{post.date}</span>
						</div>
						<h2>
							<a href={post.href}>{post.title}</a>
						</h2>
						<div className="excerpt small text-muted">{post.excerpt || post.description}</div>
					</header>
					<footer className="d-block mt-auto text-start">
						<a href={post.href} className="btn btn-link p-0 text-decoration-none text-primary">
							<span>{t('Read more')} &rsaquo;</span>
						</a>
					</footer>
				</article>
			))}

			{hasMore && (
				<article className="more clickable" onClick={handleLoadMore} style={{ cursor: 'pointer' }}>
					<div className="off-disabled text-center">
						<button className="btn btn-outline-primary">
							<span>{t('Load more')}</span>
						</button>
					</div>
				</article>
			)}
		</section>
	)
}

export default Blog
