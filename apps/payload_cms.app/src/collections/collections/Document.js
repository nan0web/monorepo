/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'documents'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "uk": "Document Page",
    "en": "Document Page"
  },
  "plural": {
    "uk": "Document Pages",
    "en": "Document Pages"
  }
}
/** @replace */

/**
 * @replace useAsTitle
 */
const useAsTitle = 'title'
/** @replace */

/**
 * @replace group
 */
const group = "Site Pages"
/** @replace */

/**
 * @replace fields
 */
const fields = [
  {
    "name": "title",
    "type": "text",
    "localized": true,
    "required": true
  },
  {
    "name": "slug",
    "type": "text",
    "required": true
  },
  {
    "name": "layout",
    "blocks": [
      {
        "slug": "articleblock",
        "fields": [
          {
            "name": "title",
            "type": "text",
            "localized": true,
            "required": true
          },
          {
            "name": "slug",
            "type": "text",
            "required": true
          },
          {
            "name": "content",
            "type": "textarea",
            "localized": true
          }
        ]
      },
      {
        "slug": "cardblockblock",
        "fields": [
          {
            "name": "title",
            "type": "text",
            "localized": true
          },
          {
            "name": "description",
            "type": "text",
            "localized": true
          }
        ]
      }
    ],
    "type": "blocks"
  }
]
/** @replace */

/** @type {import('payload').CollectionConfig} */
export const collectionConfig = {
	slug: collectionSlug,
	labels,
	admin: {
		useAsTitle,
		group,
	},
	access: {
		read: () => true,
		create: (/** @type {any} */ { req: { user } }) => Boolean(user),
		update: (/** @type {any} */ { req: { user } }) => Boolean(user),
		delete: (/** @type {any} */ { req: { user } }) => Boolean(user),
	},
	fields,
}
