import Command from "./Command.js"
import { Alert } from "../../cli/components/index.js"

export default class WorkflowCommand extends Command {
	static name = "workflow"
	static help = "Get the templates or workflows from the project to understand the context"
	static example = "```\ncode-style.md\n```"

	async * run() {
		const file = this.parsed.correct?.find((f) => f.filename === "@workflow")
		if (!file || !file.content) return

		const workflows = file.content
			.trim()
			.split("\n")
			.map(p => p.trim())
			.filter(Boolean)

		for (const w of workflows) {
			yield new Alert(`- [](@workflow/${w})`)
		}
	}
}
