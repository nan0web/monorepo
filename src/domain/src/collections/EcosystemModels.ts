import { CollectionConfig } from 'payload'

/**
 * EcosystemModel Collection
 * Auto-generated from Model-as-Schema
 */

export const EcosystemModels: CollectionConfig = {
  slug: 'ecosystem',
  labels: {
    singular: 'EcosystemModel',
    plural: 'EcosystemModels',
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
        "name": "schema",
        "type": "text",
        "defaultValue": "v3.0.0' }"
    }
],
}
