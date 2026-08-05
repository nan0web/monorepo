/**
 * Seed Collection
 * Auto-generated from Model-as-Schema
 *
 * @type {import('payload').CollectionConfig}
 */
export const SeedCollection = {
  slug: 'seed',
  labels: {
    singular: {
      uk: 'Seed',
      en: 'Seed',
    },
    plural: {
      uk: 'Seed',
      en: 'Seed',
    },
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
        "name": "target",
        "type": "text",
        "label": "Target directory containing SSOT data files (.yaml, .nano, .json)",
        "defaultValue": "data"
    },
    {
        "name": "output",
        "type": "text",
        "label": "Output bank-web directory containing payload.config.ts",
        "defaultValue": "../bank-web"
    }
],
}
