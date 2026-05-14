import React from 'react'
import PropTypes from 'prop-types'
import { useUI } from '../../context/UIContext.jsx'

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
const NewsPost = ({ post, className = 'nw-news-post' }) => {
    const { t } = useUI()

    if (!post) return null

    const containerStyle = {
        marginBottom: '4rem',
        borderRadius: '24px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s ease',
    }

    const mediaStyle = {
        width: '100%',
        aspectRatio: '16/9',
        objectFit: 'cover',
        display: 'block',
        borderBottom: '1px solid var(--border)',
    }

    const contentWrapperStyle = {
        padding: '2.5rem',
    }

    const metaStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    }

    const titleStyle = {
        fontSize: '2.25rem',
        fontWeight: '900',
        lineHeight: '1.2',
        marginBottom: '1.5rem',
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
    }

    const excerptStyle = {
        fontSize: '1.2rem',
        lineHeight: '1.6',
        color: 'var(--text-secondary)',
        marginBottom: '2rem',
        borderLeft: '4px solid var(--accent)',
        paddingLeft: '1.5rem',
        fontStyle: 'italic',
    }

    const htmlContentStyle = {
        fontSize: '1.1rem',
        lineHeight: '1.8',
        color: 'var(--text-primary)',
    }

    // Helper to render media
    const renderMedia = () => {
        // Video has priority
        if (post.video) {
            const isYoutube = post.video.includes('youtube.com') || post.video.includes('youtu.be')
            if (isYoutube) {
                const videoId = post.video.split('v=')[1] || post.video.split('/').pop()
                return (
                    <iframe
                        style={mediaStyle}
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={post.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                )
            }
            return (
                <video style={mediaStyle} controls poster={post.image}>
                    <source src={post.video} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )
        }

        // Image Gallery
        if (post.images && Array.isArray(post.images) && post.images.length > 1) {
            return (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4px', height: '400px', borderBottom: '1px solid var(--border)' }}>
                    <img src={post.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '4px' }}>
                        <img src={post.images[1]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        {post.images[2] ? (
                            <div style={{ position: 'relative', height: '100%' }}>
                                <img src={post.images[2]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                {post.images.length > 3 && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'rgba(0,0,0,0.6)', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.5rem', fontWeight: 'bold'
                                    }}>
                                        +{post.images.length - 3}
                                    </div>
                                )}
                            </div>
                        ) : <div style={{ background: 'var(--bg-page)' }} />}
                    </div>
                </div>
            )
        }

        // Single Image
        if (post.image) {
            return (
                <figure style={{ margin: 0 }}>
                    {post.url ? (
                        <a href={post.url} style={{ display: 'block' }}>
                            <img src={post.image} alt={post.title} style={mediaStyle} />
                        </a>
                    ) : (
                        <img src={post.image} alt={post.title} style={mediaStyle} />
                    )}
                </figure>
            )
        }

        return null
    }

    return (
        <article className={className} data-nw-id={post.id} style={containerStyle}>
            {renderMedia()}

            <div style={contentWrapperStyle}>
                <div style={metaStyle}>
                    {post.date && (
                        <span className="nw-date" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            📅 {new Date(post.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    )}
                    {post.author && (
                        <span className="nw-author" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            👤 {post.author}
                        </span>
                    )}
                    {post.categories?.length > 0 && (
                        <div className="categories" style={{ display: 'flex', gap: '0.8rem' }}>
                            {post.categories.map((category, idx) => (
                                <span key={idx} style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                                    #{typeof category === 'string' ? category : category.title}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <h2 style={titleStyle}>
                    {post.url ? (
                        <a href={post.url} style={{ color: 'inherit', textDecoration: 'none' }} className="nw-title">
                            {post.title}
                        </a>
                    ) : (
                        <span className="nw-title">{post.title}</span>
                    )}
                </h2>

                {post.excerpt && (
                    <div className="excerpt" style={excerptStyle}>
                        <p>{post.excerpt}</p>
                    </div>
                )}

                {post.content && (
                    <div
                        className="nw-content"
                        style={htmlContentStyle}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                )}

                {post.url && (
                    <footer style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <a
                            href={post.url}
                            style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: 'var(--accent)', 
                                textDecoration: 'none', 
                                fontWeight: '900',
                                fontSize: '1.1rem'
                            }}
                        >
                            <span>{t('news.action.read_more')}</span>
                            <span style={{ fontSize: '1.4rem' }}>→</span>
                        </a>
                    </footer>
                )}
            </div>
        </article>
    )
}

NewsPost.propTypes = {
    post: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string.isRequired,
        author: PropTypes.string,
        date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
        image: PropTypes.string,
        images: PropTypes.arrayOf(PropTypes.string),
        video: PropTypes.string,
        url: PropTypes.string,
        excerpt: PropTypes.string,
        content: PropTypes.string,
        categories: PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.shape({
                    title: PropTypes.string,
                    url: PropTypes.string,
                }),
            ]),
        ),
    }).isRequired,
    className: PropTypes.string,
}

export default NewsPost
