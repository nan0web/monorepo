import { CollectionConfig } from 'payload'

/**
 * UnifyMonorepoApp Collection
 * Auto-generated from Model-as-Schema
 */

export const UnifyMonorepoApps: CollectionConfig = {
  slug: 'unifymonorepoapp',
  labels: {
    singular: 'UnifyMonorepoApp',
    plural: 'UnifyMonorepoApps',
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
        "name": "help",
        "type": "text",
        "label": "Unify monorepo structure by removing redundant .git directories.",
        "defaultValue": "false }"
    },
    {
        "name": "dryRun",
        "type": "text",
        "label": "Dry run mode: list actions without performing them.",
        "defaultValue": "false"
    }
],
}
