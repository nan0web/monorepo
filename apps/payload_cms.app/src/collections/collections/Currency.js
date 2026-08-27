/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'currencies'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "uk": "Currency",
    "en": "Currency"
  },
  "plural": {
    "uk": "Currencies",
    "en": "Currencies"
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
const group = "Bank Products"
/** @replace */

/**
 * @replace fields
 */
const fields = [
  {
    "name": "code",
    "type": "text",
    "label": {
      "uk": "Currency ISO Code (e.g. UAH, USD)",
      "en": "Currency ISO Code (e.g. UAH, USD)"
    },
    "required": true
  },
  {
    "name": "title",
    "type": "text",
    "label": {
      "uk": "Currency Name",
      "en": "Currency Name"
    },
    "localized": true,
    "required": true
  },
  {
    "name": "symbol",
    "type": "text",
    "label": {
      "uk": "Currency Symbol (e.g. ₴, $)",
      "en": "Currency Symbol (e.g. ₴, $)"
    }
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
