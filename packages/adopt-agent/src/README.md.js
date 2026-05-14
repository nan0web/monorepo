import fs from 'node:fs'
import test from 'node:test'

test('Generate README.md', () => {
	const content = `# 🤖 Agent Blueprint (NaN0Web)

> A production-ready template for Zero-Hallucination Agents.

## 🚀 Features

- **Multi-Platform Support**: Works seamlessly via CLI, Chat, Web, and Voice.
- **Model-as-Schema**: Config validation and generation in one pass.
- **Built-in Docs**: Generate documentation with search natively.

## 🛠️ Usage

### CLI
\`\`\`bash
pnpm run play
\`\`\`

### Other Interfaces
- **Chat**: \`node play/chat.js\`
- **Web**: \`node play/web.js\`
- **Voice**: \`node play/voice.js\`

## 📚 Documentation
Run \`pnpm run test:docs\` to regenerate this file.
`

	fs.writeFileSync('README.md', content)
})
