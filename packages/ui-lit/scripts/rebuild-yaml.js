import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// Component code examples — authoritative hand-written snippets
const codeExamples = {
	'block-nav': {
		codeHtml: `<ui-nav id="my-nav"></ui-nav>
<script>
  nav.brand = { title: 'Bank Shell', url: '#' }
  nav.items = [
    { label: 'Головна', url: '#' },
    { label: 'Про нас', url: '#' },
    { label: 'Послуги', children: [
      { label: 'Депозити' },
      { label: 'Кредити' }
    ]}
  ]
</script>`,
		codeYaml: `Nav:
  brand:
    title: Bank Shell
    url: "#"
  items:
    - label: Головна
      url: "#"
    - label: Про нас
      url: "#"`,
	},
	'block-sidebar': {
		codeHtml: `<ui-sidebar id="sb"></ui-sidebar>
<script>
  sb.title = 'Налаштування'
  sb.items = [
    { label: 'Профіль', url: '#profile', active: true },
    { label: 'Безпека', url: '#security' },
    { label: 'Сповіщення', children: [{ label: 'Email' }] }
  ]
</script>`,
		codeYaml: `Sidebar:
  title: Налаштування
  items:
    - label: Профіль
      active: true
    - label: Безпека`,
	},
	'block-callout': {
		codeHtml: `<ui-alert variant="info" title="Info" content="Message."></ui-alert>
<ui-alert variant="success" title="Success" content="Done!"></ui-alert>
<ui-alert variant="warning" title="Warning" content="Caution."></ui-alert>
<ui-alert variant="error" title="Error" content="Failed."></ui-alert>
<ui-alert variant="tip" title="Tip" content="Pro tip."></ui-alert>`,
		codeYaml: `Alert:
  variant: info
  title: Info
  content: Informational message.`,
	},
	'block-markdown': {
		codeHtml: `<ui-markdown id="md"></ui-markdown>
<script>
  md.content = '<p><strong>Bold</strong> and <a href="#">link</a></p>'
</script>`,
		codeYaml: `Markdown: |
  <p><strong>Bold</strong> and <a href="#">link</a></p>`,
	},
	'block-themetoggle': {
		codeHtml: `<ui-theme-toggle></ui-theme-toggle>`,
		codeYaml: `ThemeToggle: {}`,
	},
	'block-langselect': {
		codeHtml: `<ui-lang-select></ui-lang-select>`,
		codeYaml: `LangSelect: {}`,
	},
	'block-badge': {
		codeHtml: `<ui-badge label="neutral"></ui-badge>
<ui-badge label="info" variant="info"></ui-badge>
<ui-badge label="success" variant="success"></ui-badge>
<ui-badge label="warning" variant="warning"></ui-badge>
<ui-badge label="error" variant="error"></ui-badge>`,
		codeYaml: `Badge:
  label: info
  variant: info`,
	},
	'block-code': {
		codeHtml: `<ui-code-block id="cb" title="example.js" lang="javascript"></ui-code-block>
<script>
  cb.code = "import { UIAlert } from '@nan0web/ui-lit/core'"
</script>`,
		codeYaml: `CodeBlock:
  title: example.js
  lang: javascript
  code: "console.log('hello')"`,
	},
	'block-table': {
		codeHtml: `<ui-table id="tb"></ui-table>
<script>
  tb.data = [
    { component: 'Alert', status: '✅', variants: 'info, success, warning, error' },
    { component: 'Badge', status: '✅', variants: 'neutral, info, success' },
  ]
</script>`,
		codeYaml: `Table:
  data:
    - component: Alert
      status: "✅"
      variants: "info, success, warning, error"`,
	},
	'block-input': {
		codeHtml: `<ui-input
  label="Ім'я"
  placeholder="Введіть ім'я"
  hint="Обов'язкове поле"
  required
></ui-input>
<ui-input label="Email" type="email" state="success" hint="Валідний email"></ui-input>
<ui-input label="Пароль" type="password" state="error" hint="Мінімум 8 символів"></ui-input>`,
		codeYaml: `Input:
  label: "Ім'я"
  placeholder: "Введіть ім'я"
  required: true
  hint: "Обов'язкове поле"`,
	},
	'block-select': {
		codeHtml: `<ui-select id="sel" label="Категорія" placeholder="Оберіть..."></ui-select>
<script>
  sel.options = [
    { value: 'dep', label: 'Депозити' },
    { value: 'crd', label: 'Кредити' },
    { value: 'ins', label: 'Страхування' },
  ]
</script>`,
		codeYaml: `Select:
  label: Категорія
  options:
    - value: dep
      label: Депозити
    - value: crd
      label: Кредити`,
	},
	'block-button': {
		codeHtml: `<ui-button label="Primary" variant="primary"></ui-button>
<ui-button label="Secondary" variant="secondary"></ui-button>
<ui-button label="Danger" variant="danger"></ui-button>
<ui-button label="Ghost" variant="ghost"></ui-button>
<ui-button label="Outline" variant="outline"></ui-button>`,
		codeYaml: `Button:
  label: Primary
  variant: primary`,
	},
	'block-toggle': {
		codeHtml: `<ui-toggle label="Сповіщення"></ui-toggle>
<ui-toggle label="Автозбереження" checked></ui-toggle>
<ui-toggle label="Вимкнений" disabled></ui-toggle>`,
		codeYaml: `Toggle:
  label: Сповіщення
  checked: false`,
	},
	'block-confirm': {
		codeHtml: `<ui-confirm
  message="Видалити запис?"
  confirm-label="Так"
  cancel-label="Ні"
  open
></ui-confirm>`,
		codeYaml: `Confirm:
  message: "Видалити запис?"
  open: true`,
	},
	'block-page': {
		codeHtml: `<ui-page>
  <div slot="nav">NAV BAR</div>
  <div slot="sidebar">Menu</div>
  <p>Main content</p>
</ui-page>`,
		codeYaml: `Page:
  nav: NAV BAR
  sidebar: Menu
  content: Main content`,
	},
	'block-card': {
		codeHtml: `<ui-card title="Депозит +" subtitle="12% річних" hoverable>
  <p>Найвигідніший вклад з щомісячною капіталізацією.</p>
</ui-card>`,
		codeYaml: `Card:
  title: "Депозит +"
  subtitle: "12% річних"
  hoverable: true`,
	},
	'block-modal': {
		codeHtml: `<ui-button id="open-btn" label="Відкрити Modal" variant="primary"></ui-button>
<ui-modal id="modal" title="Нова заявка">
  <p>Заповніть форму.</p>
  <ui-input label="ПІБ" placeholder="Іванов Іван"></ui-input>
</ui-modal>
<script>
  openBtn.addEventListener('btn-click', () => { modal.open = true })
</script>`,
		codeYaml: `Modal:
  title: Нова заявка
  content: Форма`,
	},
	'block-accordion': {
		codeHtml: `<ui-accordion id="acc"></ui-accordion>
<script>
  acc.items = [
    { title: 'Як відкрити рахунок?', content: 'Онлайн за 5 хв.' },
    { title: 'Які документи?', content: 'Паспорт та ІПН.' },
  ]
</script>`,
		codeYaml: `Accordion:
  items:
    - title: "Як відкрити рахунок?"
      content: "Онлайн за 5 хв."
    - title: "Які документи?"
      content: "Паспорт та ІПН."`,
	},
	'block-toast': {
		codeHtml: `<ui-toast variant="info" message="Дані збережено." open duration="0"></ui-toast>
<ui-toast variant="success" message="Операція успішна!" open duration="0"></ui-toast>
<ui-toast variant="warning" message="Перевірте дані." open duration="0"></ui-toast>
<ui-toast variant="error" message="Помилка з'єднання." open duration="0"></ui-toast>`,
		codeYaml: `Toast:
  variant: success
  message: "Операція успішна!"`,
	},
	'block-spinner': {
		codeHtml: `<ui-spinner variant="ring" size="md"></ui-spinner>
<ui-spinner variant="dots" size="md"></ui-spinner>
<ui-spinner variant="pulse" size="md"></ui-spinner>`,
		codeYaml: `Spinner:
  variant: ring
  size: md`,
	},
	'block-progress': {
		codeHtml: `<ui-progress value="68" show-label size="md"></ui-progress>
<ui-progress indeterminate size="md"></ui-progress>`,
		codeYaml: `Progress:
  value: 68
  show-label: true`,
	},
	'block-slider': {
		codeHtml: `<ui-slider
  label="Сума (грн)"
  value="50000"
  min="1000"
  max="100000"
  step="1000"
  show-value
></ui-slider>`,
		codeYaml: `Slider:
  label: "Сума (грн)"
  min: 1000
  max: 100000
  value: 50000`,
	},
	'block-autocomplete': {
		codeHtml: `<ui-autocomplete id="ac" label="Місто" placeholder="Введіть назву..."></ui-autocomplete>
<script>
  ac.options = ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів']
</script>`,
		codeYaml: `Autocomplete:
  label: Місто
  options: [Київ, Харків, Одеса, Дніпро, Львів]`,
	},
	'block-sortable': {
		codeHtml: `<ui-sortable id="sl"></ui-sortable>
<script>
  sl.items = ['Зробити тести', 'Написати код', 'Code review', 'Deploy']
</script>`,
		codeYaml: `Sortable:
  items:
    - Зробити тести
    - Написати код
    - Code review
    - Deploy`,
	},
	'block-tree': {
		codeHtml: `<ui-tree id="tree"></ui-tree>
<script>
  tree.items = [
    { label: '📁 src/', expanded: true, children: [
      { label: '📄 index.js', active: true },
      { label: '📁 components/', children: [
        { label: '📄 Alert.js' },
        { label: '📄 Button.js' },
      ]}
    ]},
    { label: '📄 package.json' },
  ]
</script>`,
		codeYaml: `Tree:
  items:
    - label: "📁 src/"
      expanded: true
      children:
        - label: "📄 index.js"
          active: true
    - label: "📄 package.json"`,
	},
}

// Read, patch, write YAML
let yamlContent = fs.readFileSync(path.join(root, 'data/play/index.yaml'), 'utf-8')
const lines = yamlContent.split('\n')
const output = []
let currentId = null
let inExample = false
let skipUntilNextExample = false

const INDENT = '            '

for (let i = 0; i < lines.length; i++) {
	const line = lines[i]

	// Track current item id
	const idMatch = line.match(/^\s{6}- id:\s*"(.+)"/)
	if (idMatch) {
		currentId = idMatch[1]
	}

	// Track example start
	if (line.match(/^\s+- label:/)) {
		inExample = true
	}

	// If we encounter next item or next example, flush pending code
	const isNextItem = line.match(/^\s{6}- id:/)
	const isNextExample = line.match(/^\s+- label:/) && inExample
	const isNextSection = line.match(/^\s{2}- title:/)

	output.push(line)

	// Look ahead: if next meaningful line is a new item/example/section,
	// and current example is missing codes — inject them
	const nextMeaningful = lines.slice(i + 1).find((l) => l.trim().length > 0)
	const isEndOfExample =
		nextMeaningful &&
		(nextMeaningful.match(/^\s+- label:/) ||
			nextMeaningful.match(/^\s{6}- id:/) ||
			nextMeaningful.match(/^\s{2}- title:/))
	const isLastLine = i === lines.length - 1

	// Check if current line ends a previewHtml block or codeYaml block
	// and we should inject missing codes
}

// Simpler approach: rebuild YAML from scratch using components.json + codeExamples
const jsonContent = fs.readFileSync(path.join(root, 'data/play/components.json'), 'utf-8')
const data = JSON.parse(jsonContent)

let yaml = `# Sandbox Component Examples

title: Каталог OLMUI
subtitle: "@nan0web/ui-lit"
sections:
`

for (const group of data.groups) {
	yaml += `  - title: "${group.title}"\n    items:\n`
	for (const item of group.items) {
		yaml += `      - id: "${item.id}"\n`
		yaml += `        title: "${item.title.replace(/"/g, '\\"')}"\n`
		yaml += `        desc: "${item.desc.replace(/"/g, '\\"')}"\n`
		yaml += `        examples:\n`
		if (item.examples) {
			for (const ex of item.examples) {
				yaml += `          - label: "${ex.label.replace(/"/g, '\\"')}"\n`

				// previewHtml — clean from <template> tags
				if (ex.previewHtml) {
					let preview = ex.previewHtml
					if (preview.indexOf('<template') !== -1) {
						preview = preview.substring(0, preview.indexOf('<template')).trim()
					}
					if (preview) {
						yaml += `            previewHtml: |\n`
						preview.split('\n').forEach((l) => {
							yaml += `              ${l}\n`
						})
					}
				}

				// Use authoritative code examples from our map
				const codes = codeExamples[item.id]
				if (codes) {
					if (codes.codeHtml) {
						yaml += `            codeHtml: |\n`
						codes.codeHtml.split('\n').forEach((l) => {
							yaml += `              ${l}\n`
						})
					}
					if (codes.codeYaml) {
						yaml += `            codeYaml: |\n`
						codes.codeYaml.split('\n').forEach((l) => {
							yaml += `              ${l}\n`
						})
					}
				}
			}
		}
	}
}

// Append tree block (not in components.json)
yaml += `      - id: "block-tree"
        title: "Tree"
        desc: "Ієрархічне дерево (Tree View)."
        examples:
          - label: "Дерево файлів"
            previewHtml: |
              <div style="max-width: 400px; max-height: 300px; overflow: auto; border: 1px solid var(--border); border-radius: 8px; background: var(--ba-surface)">
                <ui-tree id="e2e-tree"></ui-tree>
              </div>
            codeHtml: |
              ${codeExamples['block-tree'].codeHtml.split('\n').join('\n              ')}
            codeYaml: |
              ${codeExamples['block-tree'].codeYaml.split('\n').join('\n              ')}
`

fs.writeFileSync(path.join(root, 'data/play/index.yaml'), yaml)
console.log('✅ Rebuilt index.yaml with code examples for ALL components')
