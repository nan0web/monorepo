/**
 * TestArticle Collection
 * Auto-generated from Model-as-Schema
 *
 * @type {import('payload').CollectionConfig}
 */
export const TestArticleCollection = {
  slug: 'news',
  labels: {
    singular: {
          "en": "News Article",
          "uk": "News Article"
    },
    plural: {
          "en": "News Articles",
          "uk": "News Articles"
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ["title"],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
        "name": "title",
        "type": "text",
        "label": "Article title",
        "localized": true,
        "defaultValue": ""
    },
    {
        "name": "score",
        "type": "text",
        "label": "Score",
        "defaultValue": 0
    }
],
}
