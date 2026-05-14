// scripts/create-component.js
import fs from 'fs'
import path from 'path'

const name = process.argv[2]
if (!name) throw new Error('Usage: node create-component.js <name>')

const dir = path.resolve('src/components/atoms', name)

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

fs.writeFileSync(
	path.join(dir, `${name}.js`),
	`import Input from "../Input.js"
import { tokens } from "../../tokens.js"

class ${name} {
  /** @type {string} */
  static borderRadius = Input.borderRadius
  /** @type {string} */
  static paddingX = tokens.space.lg
  /** @type {string} */
  static paddingY = tokens.space.md
}

export default ${name}
`,
)

fs.writeFileSync(path.join(dir, 'index.js'), `export { default } from "./${name}.js"\n`)

console.log(`${name} component scaffolded.`)
