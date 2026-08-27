import { CollectionConfig } from 'payload'

/**
 * BumpMonorepoApp Collection
 * Auto-generated from Model-as-Schema
 */

export const BumpMonorepoApps: CollectionConfig = {
  slug: 'bumpmonorepoapp',
  labels: {
    singular: 'BumpMonorepoApp',
    plural: 'BumpMonorepoApps',
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
        "label": "Bumps version of all packages in the monorepo to a specific version.",
        "defaultValue": "false }"
    },
    {
        "name": "version",
        "type": "text",
        "label": "The version to bump to (e.g. 3.0.1).",
        "defaultValue": "3.0.0"
    },
    {
        "name": "dryRun",
        "type": "text",
        "label": "Dry run mode: list version changes without performing them.",
        "defaultValue": "false"
    }
],
}
