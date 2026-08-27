import { CollectionConfig } from 'payload'

/**
 * DocumentationAuditor Collection
 * Auto-generated from Model-as-Schema
 */

export const DocumentationAuditors: CollectionConfig = {
  slug: 'documentationauditor',
  labels: {
    singular: 'DocumentationAuditor',
    plural: 'DocumentationAuditors',
  },
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
        "name": "dir",
        "type": "text",
        "label": "Package directory",
        "defaultValue": "."
    }
],
}
