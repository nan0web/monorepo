import { CollectionConfig } from 'payload'

/**
 * WorkflowIndexApp Collection
 * Auto-generated from Model-as-Schema
 */

export const WorkflowIndexApps: CollectionConfig = {
  slug: 'workflowindexapp',
  labels: {
    singular: 'WorkflowIndexApp',
    plural: 'WorkflowIndexApps',
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
        "label": "Target workflows directory",
        "defaultValue": "docs/uk/workflows"
    }
],
}
