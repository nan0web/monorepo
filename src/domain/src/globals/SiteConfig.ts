import { GlobalConfig } from 'payload'

/**
 * SiteConfig Global
 * Auto-generated from Model-as-Schema
 */

export const SiteConfig: GlobalConfig = {
  slug: 'site_config',
  label: 'Site Settings',
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
        "name": "siteName",
        "type": "text",
        "label": "Site Name",
        "localized": true,
        "defaultValue": "My Site"
    }
],
}
