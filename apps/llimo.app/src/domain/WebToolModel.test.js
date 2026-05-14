import { test, describe } from "node:test"
import assert from "node:assert/strict"
import { WebToolModel } from "./WebToolModel.js"

describe("WebToolModel Contract", () => {
  test("1. Basic initialization with defaults", () => {
    const model = new WebToolModel()
    assert.equal(model.url, "")
    assert.deepEqual(model.engines, ["wget", "fetch", "playwright-headless", "playwright-ui"])
  })

  test("2. Parsing full payload object", () => {
    const model = new WebToolModel({ 
      url: "https://architechnomag.com", 
      engines: ["wget", "playwright-headless"]
    })
    assert.equal(model.url, "https://architechnomag.com")
    assert.deepEqual(model.engines, ["wget", "playwright-headless"])
  })

  test("3. Static Schema Validation: URL Format", () => {
    assert.equal(WebToolModel.url.validate("http://example.com"), true, "Must accept valid http")
    assert.equal(WebToolModel.url.validate("https://example.com/api/v1"), true, "Must accept valid https")
    
    // Invalid
    assert.equal(typeof WebToolModel.url.validate("ftp://example.com"), "string", "Must reject ftp")
    assert.equal(typeof WebToolModel.url.validate("example.com"), "string", "Must reject domains without protocol")
    assert.equal(typeof WebToolModel.url.validate(""), "string", "Must reject empty strings")
  })

  test("4. Static Schema Validation: Engines minimum", () => {
    assert.equal(WebToolModel.engines.validate(["fetch"]), true, "Must accept at least one engine")
    assert.equal(WebToolModel.engines.validate(["fetch", "wget"]), true, "Must accept multiple engines")
    
    // Invalid
    assert.equal(typeof WebToolModel.engines.validate([]), "string", "Must reject empty arrays")
    assert.equal(typeof WebToolModel.engines.validate(), "string", "Must reject undefined")
  })
})
