/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'cardblock'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "uk": "Card Block",
    "en": "Card Block"
  },
  "plural": {
    "uk": "Card Blocks",
    "en": "Card Blocks"
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
const group = "Content Blocks"
/** @replace */

/**
 * @replace fields
 */
const fields = [
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
