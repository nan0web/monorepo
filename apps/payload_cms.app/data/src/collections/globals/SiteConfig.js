/**
 * SiteConfig Global
 * Auto-generated from Model-as-Schema
 *
 * @type {import('payload').GlobalConfig}
 */
export const SiteConfig = {
  slug: 'site_config',
  label: {
          "en": "Site Configuration",
          "uk": "Site Configuration"
    },
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
        "name": "siteName",
        "type": "text",
        "label": {
            "uk": "Site name",
            "en": "Site name"
        },
        "localized": true,
        "required": true
    },
    {
        "name": "contactEmail",
        "type": "email",
        "label": {
            "uk": "Contact email",
            "en": "Contact email"
        }
    },
    {
        "name": "seo",
        "fields": [
            {
                "name": "defaultTitle",
                "type": "text",
                "localized": true
            },
            {
                "name": "defaultDescription",
                "type": "text",
                "localized": true
            }
        ],
        "type": "group",
        "label": {
            "uk": "SEO Configuration",
            "en": "SEO Configuration"
        }
    }
],
}
