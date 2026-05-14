import { VisualAdapter as BaseVisualAdapter } from '@nan0web/ui/testing'
import { marked } from 'marked'

/**
 * VisualAdapter (React)
 * 
 * Рендерить "Логічні зліпки" у форматі React-структури (JSON/HTML) для превью.
 */
export class VisualAdapter extends BaseVisualAdapter {
    /**
     * Конвертує одну інтенцію у візуальний блок (React Snapshot).
     * @param {object} intent - Intent entry from LogicInspector
     * @param {function} t - i18n translate function
     * @returns {string} React-formatted visual (string representation)
     */
    static render(intent, t = (k) => k) {
        if (intent.type === 'ask') {
            const options = intent.schema?.options 
                ? `<div class="options">${intent.schema.options.map(o => `<span class="option-pill">${t(o.label)}</span>`).join('')}</div>`
                : ''
            return `
<div class="render-preview">
  <div class="preview-header">ASK: ${intent.field}</div>
  <div class="preview-content">
    <div class="ask-title">${t(intent.schema?.title || '')}</div>
    <div class="ask-help">${t(intent.schema?.help || '')}</div>
    ${options}
    <div class="ask-input">
        <input readonly value="${intent.input !== undefined ? intent.input : ''}" placeholder="${t(intent.schema?.placeholder || '')}" />
    </div>
  </div>
  <div class="preview-meta">
    <div class="meta-block jsx">
      <div class="meta-label">JSX</div>
      <pre>&lt;Input value="${intent.input}" /&gt;</pre>
    </div>
  </div>
</div>`
        }
        if (intent.type === 'log') {
            return `<div class="intent-log-inline ${intent.level || 'info'}"><b>${intent.level || 'info'}:</b> ${typeof intent.message === 'object' ? JSON.stringify(intent.message) : intent.message}</div>`
        }
        if (intent.type === 'progress') {
            return `<div class="intent-progress-inline">${t(intent.message || '')}</div>`
        }
        if (intent.type === 'render') {
            const isMarkdown = intent.component === 'Markdown'
            const content = intent.props?.content || intent.props?.doc?.Markdown || intent.props?.doc?.markdown || ''
            
            // Dynamic JSX/YAML generation
            const jsxCode = `&lt;Blocks.${intent.component} ${isMarkdown ? `doc={{ Markdown: "${content.replace(/\n/g, '\\n').slice(0, 40)}..." }}` : JSON.stringify(intent.props)} /&gt;`
            const yamlCode = `$content:\n  - ${intent.component}: |-\n      ${content.split('\n').join('\n      ')}`

            return `
<div class="render-preview">
  <div class="preview-header">${isMarkdown ? 'MARKDOWN RENDER' : `RENDER: ${intent.component}`}</div>
  <div class="preview-content markdown-content prose">${isMarkdown ? marked.parse(content) : `<pre>${JSON.stringify(intent.props, null, 2)}</pre>`}</div>
  <div class="preview-meta">
    <div class="meta-block jsx">
      <div class="meta-label">JSX</div>
      <pre>${jsxCode}</pre>
    </div>
    <div class="meta-block yaml">
      <div class="meta-label">Meta Data (YAML)</div>
      <pre>${yamlCode}</pre>
    </div>
  </div>
</div>`
        }
        if (intent.type === 'result') {
            return `<div class="intent-result-inline">RESULT: ${JSON.stringify(intent.data)}</div>`
        }
        return `<!-- unknown intent ${intent.type} -->`
    }
}
