import { CollectionConfig } from 'payload'

/**
 * NewsArticle Collection
 * Auto-generated from Model-as-Schema
 */

export const NewsArticles: CollectionConfig = {
  slug: 'news',
  labels: {
    singular: 'News',
    plural: 'Newss',
  },
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
        name: "title",
        type: "text",
        label: "Article title",
        defaultValue: ""
    },
    {
        name: "source",
        type: "text",
        label: "News source (HackerNews, Reddit, Twitter, etc.)",
        defaultValue: "HackerNews"
    },
    {
        name: "url",
        type: "text",
        label: "Article URL",
        defaultValue: ""
    },
    {
        name: "score",
        type: "text",
        label: "Engagement score (upvotes, retweets, etc.)",
        defaultValue: 0
    },
    {
        name: "published",
        type: "text",
        label: "Publication timestamp (ISO 8601)",
        defaultValue: "2026-08-02T09:40:43.112Z"
    },
    {
        name: "keywords",
        type: "text",
        label: "Extracted keywords"
    }
],
}
