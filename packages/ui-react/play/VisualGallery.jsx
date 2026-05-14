import React from 'react'
import { GalleryInspector } from '../src/testing/GalleryInspector.jsx'
import { GDPRConsent } from '../src/models/GDPRConsent.js'

// Dummy Model for testing
function* TestModel(initialData = {}) {
    yield { type: 'progress', message: 'Starting Test Model' }
    
    const name = yield { 
        type: 'ask', 
        field: 'name', 
        schema: { help: 'Enter your name' },
        input: initialData.name
    }
    
    yield { type: 'log', level: 'info', message: { received: name } }
    
    if (name === 'error') {
        throw new Error('Name cannot be error')
    }

    yield { type: 'result', data: { success: true, name } }
}

const scenarios = {
    'GDPRConsent': [
        { 
            name: 'New visitor (Default)', 
            model: { run: () => GDPRConsent() } 
        },
        { 
            name: 'Visitor accepts All', 
            model: { run: () => GDPRConsent() },
            inputs: ['all']
        }
    ],
    'MarkdownExamples': [
        {
            name: 'User Example (marked)',
            model: function* () {
                yield { 
                    type: 'render', 
                    component: 'Markdown', 
                    props: { 
                        content: '# Справжній Markdown\n\nЦе приклад рендеру markdown за допомогою marked.\n\n- Підтримує списки\n- [Посилання](https://ivan.ua)\n- HTML теги: <br/> `code`' 
                    } 
                }
            }
        }
    ],
    'TestComponent': [
        { 
            name: 'Successful run', 
            model: { run: () => TestModel({ name: 'Antigravity' }) } 
        }
    ]
}

export default function VisualGallery() {
    return (
        <div style={{ background: '#eee', minHeight: '100vh' }}>
            <GalleryInspector scenarios={scenarios} />
        </div>
    )
}
