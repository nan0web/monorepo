import { VisualAdapter as ReactVisualAdapter } from '@nan0web/ui-react/src/testing/VisualAdapter.js'

/**
 * VisualAdapter (React-Bootstrap)
 * 
 * Рендерить інтенції у форматі Bootstrap-структур (JSON/HTML).
 */
export class VisualAdapter extends ReactVisualAdapter {
    /**
     * Конвертує інтенцію у візуальний блок Bootstrap.
     */
    static render(intent, t = (k) => k) {
        if (intent.type === 'ask') {
            return `
<FormGroup>
    <Label>${t(intent.schema?.help || '')}</Label>
    <FormControl value="${intent.input}" />
</FormGroup>`
        }
        return super.render(intent, t)
    }
}
