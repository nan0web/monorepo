/**
 * TestArticle Collection
 * Auto-generated from Model-as-Schema
 *
 * @type {import('payload').CollectionConfig}
 */
export const TestArticleCollection = {
  slug: 'news',
  labels: {
    singular: 'News Article',
    plural: 'News Articles',
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
