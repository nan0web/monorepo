import { CollectionConfig } from 'payload'

/**
 * ReleaseAuditor Collection
 * Auto-generated from Model-as-Schema
 */

export const ReleaseAuditors: CollectionConfig = {
  slug: 'releaseauditor',
  labels: {
    singular: 'ReleaseAuditor',
    plural: 'ReleaseAuditors',
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
