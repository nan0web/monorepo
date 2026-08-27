import { CollectionConfig } from 'payload'

/**
 * PrepareApp Collection
 * Auto-generated from Model-as-Schema
 */

export const PrepareApps: CollectionConfig = {
  slug: 'prepareapp',
  labels: {
    singular: 'PrepareApp',
    plural: 'PrepareApps',
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
        "label": "Prepare active workspace context, compile workflows, and synthesize prompt.md.",
        "defaultValue": "false"
    },
    {
        "name": "target",
        "type": "text",
        "label": "Target package directory (e.g. packages/ui).",
        "defaultValue": "packages/ui"
    },
    {
        "name": "step",
        "admin": {
            "step": 0.01
        },
        "type": "number",
        "label": "Target step number (1 to 9).",
        "defaultValue": "3"
    }
],
}
