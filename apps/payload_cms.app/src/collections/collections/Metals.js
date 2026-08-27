/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'metals'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "uk": "Metal",
    "en": "Metal"
  },
  "plural": {
    "uk": "Metals",
    "en": "Metals"
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
const group = "Bank Products"
/** @replace */

/**
 * @replace fields
 */
const fields = [
  {
    "name": "pageTitle",
    "type": "text"
  },
  {
    "name": "pageSubtitle",
    "type": "text"
  },
  {
    "name": "category",
    "type": "text"
  },
  {
    "name": "search",
    "type": "text"
  },
  {
    "name": "searchInput",
    "type": "text"
  },
  {
    "name": "weight",
    "type": "text"
  },
  {
    "name": "priceRange",
    "type": "text"
  },
  {
    "name": "noResults",
    "type": "text"
  },
  {
    "name": "noResultsHint",
    "type": "text"
  },
  {
    "name": "resetFilters",
    "type": "text"
  },
  {
    "name": "itemOne",
    "type": "text"
  },
  {
    "name": "itemFew",
    "type": "text"
  },
  {
    "name": "itemMany",
    "type": "text"
  },
  {
    "name": "priceFrom",
    "type": "text"
  },
  {
    "name": "priceTo",
    "type": "text"
  },
  {
    "name": "gold",
    "type": "text"
  },
  {
    "name": "silver",
    "type": "text"
  },
  {
    "name": "coins",
    "type": "text"
  },
  {
    "name": "buy",
    "type": "text"
  },
  {
    "name": "sell",
    "type": "text"
  },
  {
    "name": "grams",
    "type": "text"
  },
  {
    "name": "assay",
    "type": "text"
  },
  {
    "name": "design",
    "type": "text"
  },
  {
    "name": "allTypes",
    "type": "text"
  },
  {
    "name": "order",
    "type": "text"
  },
  {
    "name": "personalVisit",
    "type": "text"
  },
  {
    "name": "phone",
    "type": "text"
  },
  {
    "name": "submit",
    "type": "text"
  },
  {
    "name": "par",
    "type": "text"
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
