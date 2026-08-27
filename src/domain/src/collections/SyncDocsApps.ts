import { CollectionConfig } from 'payload'

/**
 * SyncDocsApp Collection
 * Auto-generated from Model-as-Schema
 */

export const SyncDocsApps: CollectionConfig = {
  slug: 'syncdocsapp',
  labels: {
    singular: 'SyncDocsApp',
    plural: 'SyncDocsApps',
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
        "name": "path",
        "type": "text",
        "label": "Path to the target folder, default is @app/docs",
        "defaultValue": "@app/docs"
    },
    {
        "name": "separator",
        "type": "text",
        "label": "Separator for nested variables, default is /",
        "defaultValue": "/"
    },
    {
        "name": "tag",
        "type": "text",
        "label": "Tag name for variables, default is v",
        "defaultValue": "v"
    }
],
}
