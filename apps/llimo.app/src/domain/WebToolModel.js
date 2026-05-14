import { Model } from '@nan0web/types'

/**
 * Model-as-Schema for a Web Extractor Tool (Proxy @web)
 */
export class WebToolModel extends Model {
  static url = {
    help: "URL to the web document or API that the agent wants to read",
    default: "",
    type: "string",
    validate: (val) => (/^https?:\/\//.test(val) ? true : "Invalid URL format"),
  }

  static engines = {
    help: "Fallback strategy array of execution engines to try sequentially until success",
    default: ["wget", "fetch", "playwright-headless", "playwright-ui"],
    type: "array",
    options: ["wget", "fetch", "playwright-headless", "playwright-ui"],
    validate: (val) => (val && val.length > 0 ? true : "At least one engine must be provided for fallback"),
  }

  /**
   * @param {Partial<WebToolModel>} data
   * @param {Partial<import('@nan0web/types').ModelOptions>} options
   */
  constructor(data = {}, options = /** @type {any} */ ({})) {
    super(data, options)
    /** @type {string} URL to the web document or API that the agent wants to read */ this.url
    /** @type {string[]} Fallback strategy array of execution engines to try sequentially until success */ this.engines
  }
}
