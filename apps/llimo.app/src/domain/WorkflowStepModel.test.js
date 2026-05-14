import { test, describe } from "node:test"
import assert from "node:assert/strict"
import { WorkflowStepModel } from "./WorkflowStepModel.js"

describe("WorkflowStepModel Contract", () => {
  test("1. Basic initialization with default values", () => {
    const step = new WorkflowStepModel()
    assert.equal(step.name, "")
    assert.equal(step.command, "")
    assert.deepEqual(step.args, [])
    assert.equal(step.verify, "")
    assert.equal(step.maxCost, 0.5)
  })

  test("2. Parsing full payload object", () => {
    const step = new WorkflowStepModel({
      name: "Fetch website",
      command: "@web",
      args: ["https://example.com"],
      verify: "echo OK",
      maxCost: 1.5
    })
    
    assert.equal(step.name, "Fetch website")
    assert.equal(step.command, "@web")
    assert.deepEqual(step.args, ["https://example.com"])
    assert.equal(step.verify, "echo OK")
    assert.equal(step.maxCost, 1.5)
  })

  test("3. Static Schema Validation: Name", () => {
    assert.equal(WorkflowStepModel.name.validate("My Step"), true, "Valid name should pass")
    assert.equal(typeof WorkflowStepModel.name.validate(""), "string", "Empty name should fail with error message")
  })

  test("4. Static Schema Validation: Command starts with @", () => {
    assert.equal(WorkflowStepModel.command.validate("@bash"), true, "Proxy command @bash must pass")
    assert.equal(WorkflowStepModel.command.validate("@web https://x.com"), true, "Proxy command with args must pass")
    
    // Invalid calls (missing @)
    assert.equal(typeof WorkflowStepModel.command.validate("npm install"), "string", "Missing @ must fail validation")
    assert.equal(typeof WorkflowStepModel.command.validate(""), "string", "Empty command must fail")
  })
})
