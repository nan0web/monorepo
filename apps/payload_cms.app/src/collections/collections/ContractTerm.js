/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'contractterm'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "uk": "Contract Term",
    "en": "Contract Term"
  },
  "plural": {
    "uk": "Contract Terms",
    "en": "Contract Terms"
  }
}
/** @replace */

/**
 * @replace useAsTitle
 */
const useAsTitle = 'id'
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
