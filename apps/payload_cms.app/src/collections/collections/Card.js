/**
 * @replace imports
 * Custom imports block
 */
/** @replace */

/**
 * @replace collectionSlug
 */
const collectionSlug = 'cards'
/** @replace */

/**
 * @replace labels
 */
const labels = {
  "singular": {
    "uk": "Card",
    "en": "Card"
  },
  "plural": {
    "uk": "Cards",
    "en": "Cards"
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
    "name": "VALID_TYPES",
    "type": "text"
  },
  {
    "name": "VALID_CATEGORIES",
    "type": "text"
  },
  {
    "name": "cardId",
    "type": "text",
    "label": {
      "uk": "Unique card identifier",
      "en": "Unique card identifier"
    },
    "defaultValue": ""
  },
  {
    "name": "type",
    "type": "text",
    "label": {
      "uk": "Card payment system (Visa or Master Card)",
      "en": "Card payment system (Visa or Master Card)"
    },
    "admin": {
      "position": "sidebar"
    },
    "defaultValue": ""
  },
  {
    "name": "title",
    "type": "text",
    "label": {
      "uk": "Card title",
      "en": "Card title"
    },
    "localized": true,
    "defaultValue": ""
  },
  {
    "name": "description",
    "type": "text",
    "label": {
      "uk": "Card description",
      "en": "Card description"
    },
    "localized": true,
    "defaultValue": ""
  },
  {
    "name": "image",
    "relationTo": "media",
    "type": "upload",
    "label": {
      "uk": "Card image",
      "en": "Card image"
    },
    "admin": {
      "position": "sidebar"
    },
    "defaultValue": ""
  },
  {
    "name": "filter",
    "type": "text",
    "label": {
      "uk": "Card filter",
      "en": "Card filter"
    }
  },
  {
    "name": "categories",
    "fields": [
      {
        "name": "item",
        "type": "text"
      }
    ],
    "type": "array",
    "label": {
      "uk": "Card categories",
      "en": "Card categories"
    }
  },
  {
    "name": "tags",
    "fields": [
      {
        "name": "item",
        "type": "text"
      }
    ],
    "type": "array",
    "label": {
      "uk": "Card tags",
      "en": "Card tags"
    }
  },
  {
    "name": "currencies",
    "fields": [
      {
        "name": "item",
        "type": "text"
      }
    ],
    "type": "array",
    "label": {
      "uk": "Card currencies",
      "en": "Card currencies"
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
      "uk": "Card features",
      "en": "Card features"
    },
    "localized": true
  },
  {
    "name": "files",
    "fields": [
      {
        "name": "item",
        "type": "text"
      }
    ],
    "type": "array",
    "label": {
      "uk": "Card files",
      "en": "Card files"
    }
  },
  {
    "name": "url",
    "type": "text",
    "label": {
      "uk": "Original file URL from DB index",
      "en": "Original file URL from DB index"
    },
    "defaultValue": ""
  },
  {
    "name": "content",
    "type": "json",
    "label": {
      "uk": "Card content (NaN0HTML AST)",
      "en": "Card content (NaN0HTML AST)"
    },
    "localized": true,
    "defaultValue": ""
  },
  {
    "name": "order",
    "admin": {
      "position": "sidebar"
    },
    "type": "number",
    "label": {
      "uk": "Order",
      "en": "Order"
    },
    "defaultValue": 0
  },
  {
    "name": "hidden",
    "type": "checkbox",
    "label": {
      "uk": "Card hidden",
      "en": "Card hidden"
    },
    "admin": {
      "position": "sidebar",
      "components": {
        "Cell": "@nan0web/ui-payload#BooleanCell"
      }
    },
    "defaultValue": false
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
