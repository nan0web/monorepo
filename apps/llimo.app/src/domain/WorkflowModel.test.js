import { test, describe } from "node:test"
import assert from "node:assert/strict"
import { WorkflowModel } from "./WorkflowModel.js"
import { WorkflowStepModel } from "./WorkflowStepModel.js"

describe("WorkflowModel Contract", () => {
  test("1. Default initializations", () => {
    const model = new WorkflowModel()
    assert.equal(model.filename, "")
    assert.equal(model.budget, 1.0)
    assert.deepEqual(model.steps, [])
    assert.equal(model.historyDir, "~/.llimo")
  })

  test("2. Proper instantiation with nested steps array map", () => {
    const rawData = {
      filename: "test.md",
      budget: 5.0,
      steps: [
        { name: "Step 1", command: "@bash echo 1" },
        { name: "Step 2", command: "@web" }
      ]
    }
    const model = new WorkflowModel(rawData)
    
    assert.equal(model.filename, "test.md")
    assert.equal(model.budget, 5.0)
    assert.equal(model.steps.length, 2)
    
    // Check deep nested objects were converted to WorkflowStepModel
    assert.ok(model.steps[0] instanceof WorkflowStepModel, "Steps should be instance of WorkflowStepModel")
    assert.equal(model.steps[0].command, "@bash echo 1")
    assert.equal(model.steps[1].command, "@web")
  })

  test("3. Static Schema Validation: Filename", () => {
    assert.equal(WorkflowModel.filename.validate("workflow.md"), true, "Must accept .md files")
    assert.equal(typeof WorkflowModel.filename.validate("workflow.txt"), "string", "Must reject non .md files")
    assert.equal(typeof WorkflowModel.filename.validate(""), "string", "Must reject empty strings")
  })
})
