/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'deposits'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "uk": "Deposit",
    "en": "Deposit"
  },
  "plural": {
    "uk": "Deposits",
    "en": "Deposits"
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
    "name": "title",
    "type": "text",
    "label": {
      "uk": "Deposit Product Name",
      "en": "Deposit Product Name"
    },
    "localized": true,
    "required": true
  },
  {
    "name": "description",
    "type": "textarea",
    "label": {
      "uk": "Short description of the product",
      "en": "Short description of the product"
    },
    "localized": true
  },
  {
    "name": "image",
    "type": "text",
    "label": {
      "uk": "URL to product image",
      "en": "URL to product image"
    },
    "admin": {
      "components": {
        "Cell": "@nan0web/ui-payload#ImageCell"
      }
    }
  },
  {
    "name": "features",
    "fields": [
      {
        "name": "item",
        "type": "text"
      }
    ],
    "type": "array",
    "label": {
      "uk": "List of features/benefits",
      "en": "List of features/benefits"
    },
    "localized": true
  },
  {
    "name": "order",
    "type": "number",
    "label": {
      "uk": "Sort order",
      "en": "Sort order"
    },
    "defaultValue": 0
  },
  {
    "name": "currencies",
    "fields": [
      {
        "name": "currencies",
        "type": "relationship",
        "relationTo": "currencies"
      }
    ],
    "type": "array",
    "label": {
      "uk": "Available currencies",
      "en": "Available currencies"
    }
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
    "type": "array",
    "label": {
      "uk": "Documents (Terms, Tariffs)",
      "en": "Documents (Terms, Tariffs)"
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
