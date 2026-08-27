/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'contracts'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "uk": "Contract",
    "en": "Contract"
  },
  "plural": {
    "uk": "Contracts",
    "en": "Contracts"
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
const group = "Terms and Tariffs"
/** @replace */

/**
 * @replace fields
 */
const fields = [
  {
    "name": "contractId",
    "type": "text",
    "required": true
  },
  {
    "name": "title",
    "type": "text",
    "localized": true,
    "required": true
  },
  {
    "name": "order",
    "type": "number",
    "defaultValue": 0
  },
  {
    "name": "directory",
    "blocks": [
      {
        "slug": "contracttermblock",
        "fields": [
          {
            "name": "sectionId",
            "type": "text",
            "required": true
          },
          {
            "name": "text",
            "type": "text",
            "localized": true
          },
          {
            "name": "files",
            "fields": [
              {
                "name": "attachment",
                "type": "relationship",
                "relationTo": "attachments"
              }
            ],
            "type": "array"
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
