/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'credits'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "uk": "Credit",
    "en": "Credit"
  },
  "plural": {
    "uk": "Credits",
    "en": "Credits"
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
    "name": "actionMain",
    "type": "text",
    "label": {
      "uk": "Main Menu",
      "en": "Main Menu"
    }
  },
  {
    "name": "language",
    "type": "text",
    "label": {
      "uk": "Select language",
      "en": "Select language"
    }
  },
  {
    "name": "actionCatalog",
    "type": "text",
    "label": {
      "uk": "Select credit product",
      "en": "Select credit product"
    }
  },
  {
    "name": "actionProduct",
    "type": "text",
    "label": {
      "uk": "Product options",
      "en": "Product options"
    }
  },
  {
    "name": "amount",
    "admin": {
      "step": 100
    },
    "type": "number",
    "label": {
      "uk": "Desired loan amount (UAH)",
      "en": "Desired loan amount (UAH)"
    },
    "defaultValue": 10000
  },
  {
    "name": "term",
    "admin": {
      "step": 1
    },
    "type": "number",
    "label": {
      "uk": "Credit term (months)",
      "en": "Credit term (months)"
    },
    "defaultValue": 12
  },
  {
    "name": "phone",
    "type": "text",
    "label": {
      "uk": "Phone number",
      "en": "Phone number"
    },
    "defaultValue": ""
  },
  {
    "name": "tin",
    "type": "text",
    "label": {
      "uk": "Tax identification number (optional)",
      "en": "Tax identification number (optional)"
    },
    "defaultValue": ""
  },
  {
    "name": "passport",
    "type": "text",
    "label": {
      "uk": "Passport series and number (optional)",
      "en": "Passport series and number (optional)"
    },
    "defaultValue": ""
  },
  {
    "name": "confirm",
    "type": "checkbox",
    "label": {
      "uk": "Confirm application submission",
      "en": "Confirm application submission"
    },
    "defaultValue": false,
    "admin": {
      "components": {
        "Cell": "@nan0web/ui-payload#BooleanCell"
      }
    }
  },
  {
    "name": "abort",
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
