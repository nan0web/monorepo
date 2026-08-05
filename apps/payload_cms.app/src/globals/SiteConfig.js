/**
 * SiteConfig Global
 * Auto-generated from Model-as-Schema
 *
 * @type {import('payload').GlobalConfig}
 */
export const SiteConfig = {
  slug: 'site_config',
  label: {
          "en": "Site Settings",
          "uk": "Site Settings"
    },
  admin: {
  },
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
