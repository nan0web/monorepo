import { test, describe } from "node:test"
import assert from "node:assert/strict"
import { SecurityGateModel } from "./SecurityGateModel.js"

describe("SecurityGateModel Contract", () => {
  test("1. Basic initialization with strict defaults", () => {
    const model = new SecurityGateModel()
    
    // Ensure all @ proxies are properly defaulted securely
    assert.deepEqual(model.allowedProxies, ["@bash", "@web", "@validate", "@get", "@ls", "@llimo"])
    assert.ok(model.forbiddenPatterns.length > 0, "Security matrix must contain forbidden pattern traps")
    assert.ok(model.forbiddenPatterns.some(p => p.includes("rm") && p.includes("rf")))
  })

  test("2. Injecting custom security matrix rules", () => {
    const payload = {
      allowedProxies: ["@python", "@git"],
      forbiddenPatterns: ["/exec\\(/", "/sudo/"]
    }
    const model = new SecurityGateModel(payload)
    
    assert.deepEqual(model.allowedProxies, ["@python", "@git"])
    assert.deepEqual(model.forbiddenPatterns, ["/exec\\(/", "/sudo/"])
  })

  test("3. Static Schema Validation: Proxies array limit", () => {
    assert.equal(SecurityGateModel.allowedProxies.validate(["@custom"]), true, "Passed for at least one proxy tool")
    
    assert.equal(typeof SecurityGateModel.allowedProxies.validate([]), "string", "Must reject empty arrays for security list") // Failing means rejecting empty list
  })
})
