import React, { useState, useEffect } from 'react'
import { LogicInspector } from '@nan0web/ui/testing'
import { VisualAdapter } from './VisualAdapter.js'

/**
 * GalleryInspector
 * 
 * Візуалізує послідовність інтенцій (Intent Stream) для набору сценаріїв.
 * Використовує LogicInspector для "захоплення" логіки та VisualAdapter для рендерингу.
 * 
 * @param {object} props
 * @param {object} props.scenarios - Об'єкт зі сценаріями { ComponentName: [{ name, model, inputs }] }
 * @param {function} props.t - Функція перекладу
 */
const defaultT = (k) => k;

export const GalleryInspector = ({ scenarios = {}, t = defaultT }) => {
    const [results, setResults] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const runScenarios = async () => {
            const allResults = {}

            for (const [componentName, list] of Object.entries(scenarios)) {
                allResults[componentName] = []
                for (const scenario of list) {
                    try {
                        const intentStream = scenario.model.run ? scenario.model.run() : scenario.model()
                        const intents = await LogicInspector.capture(intentStream, {
                            inputs: scenario.inputs || [],
                            t
                        })

                        allResults[componentName].push({
                            name: scenario.name,
                            intents
                        })
                    } catch (e) {
                        allResults[componentName].push({
                            name: scenario.name,
                            error: e.message
                        })
                    }
                }
            }
            setResults(allResults)
            setLoading(false)
        }

        runScenarios()
    }, [scenarios, t])

    if (loading) {
        return <div className="gallery-spinner">Loading Gallery...</div>
    }

    return (
        <div className="gallery-inspector">
            <header className="gallery-header">
                <h1>UI-React Visual Gallery</h1>
                <p>Verifying logic-to-ui mapping via deterministic scenarios.</p>
            </header>

            <div className="gallery-content">
                {Object.entries(results).map(([componentName, list]) => (
                    <section key={componentName} className="gallery-section">
                        <h2 className="section-title">{componentName}</h2>
                        <div className="scenario-grid">
                            {list.map((scenario, idx) => (
                                <article key={idx} className="scenario-card">
                                    <h3 className="scenario-name">{scenario.name}</h3>
                                    
                                    {scenario.error ? (
                                        <div className="scenario-error">Error: {scenario.error}</div>
                                    ) : (
                                        <div className="intent-stream">
                                            {scenario.intents.map((intent, iIdx) => (
                                                <div 
                                                    key={iIdx} 
                                                    className={`intent-block intent-${intent.type}`}
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: VisualAdapter.render(intent, t) 
                                                    }} 
                                                />
                                            ))}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
            
            <style jsx>{`
                .gallery-inspector {
                    padding: 2rem;
                    background: var(--bg-primary, #f9f9f9);
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                }
                .gallery-header {
                    margin-bottom: 3rem;
                    border-bottom: 1px solid var(--border-color, #eee);
                    padding-bottom: 1rem;
                }
                .section-title {
                    font-size: 1.5rem;
                    margin: 2rem 0 1rem;
                    color: var(--text-primary, #333);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .scenario-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 2rem;
                }
                .scenario-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    padding: 1.5rem;
                    border: 1px solid #eee;
                }
                .scenario-name {
                    margin: 0 0 1rem;
                    font-size: 1.1rem;
                    color: #555;
                    border-left: 4px solid #007aff;
                    padding-left: 0.75rem;
                }
                .intent-stream {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .intent-block {
                    padding: 1rem;
                    border-radius: 8px;
                    font-family: 'Fira Code', monospace;
                    font-size: 0.9rem;
                    white-space: pre-wrap;
                }
                .intent-ask { background: #f0f7ff; border-left: 4px solid #007bff; }
                .intent-progress { background: #fff3e0; border-left: 4px solid #ff9800; }
                .intent-log { background: #f5f5f5; border-left: 4px solid #9e9e9e; }
                .intent-render { background: white; border: 1px solid #eee; border-radius: 12px; padding: 0; overflow: hidden; }
                .intent-result { background: #e8f5e9; border-left: 4px solid #4caf50; font-weight: bold; }

                .render-preview { display: flex; flex-direction: column; }
                .preview-header { 
                    background: #f8f9fa; 
                    padding: 8px 16px; 
                    font-size: 0.7rem; 
                    font-weight: bold; 
                    color: #888; 
                    border-bottom: 1px solid #eee;
                    text-transform: uppercase;
                }
                .preview-content { padding: 20px; }
                .ask-title { font-weight: bold; font-size: 1.1rem; margin-bottom: 5px; color: #333; }
                .ask-help { font-size: 0.85rem; color: #666; margin-bottom: 15px; }
                .ask-input input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: #fafafa; }
                
                .preview-meta { display: flex; border-top: 1px solid #eee; }
                .meta-block { flex: 1; padding: 10px; font-size: 0.75rem; }
                .meta-block pre { margin: 0; background: #222; color: #eee; padding: 10px; border-radius: 4px; overflow-x: auto; }
                .meta-label { font-weight: bold; margin-bottom: 5px; padding: 2px 8px; color: white; border-radius: 4px; display: inline-block; }
                .jsx .meta-label { background: #007bff; }
                .yaml .meta-label { background: #28a745; }

                .option-pill { 
                    display: inline-block; 
                    padding: 2px 8px; 
                    background: #2196f3; 
                    color: white; 
                    border-radius: 12px; 
                    font-size: 0.7rem; 
                    margin-right: 4px; 
                    margin-bottom: 10px;
                }
                .intent-log-inline { padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; margin-bottom: 5px; }
                .intent-log-inline.info { background: #f5f5f5; border-left: 3px solid #9e9e9e; }
                .intent-log-inline.success { background: #e8f5e9; border-left: 3px solid #4caf50; }
                .intent-progress-inline { color: #ff9800; font-weight: bold; font-size: 0.85rem; margin-bottom: 5px; }
                .intent-result-inline { background: #e8f5e green; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; margin-top: 10px; }
                .intent-result-inline { background: #28a745; color: white; }
                
                .scenario-error { color: #d32f2f; background: #ffebee; padding: 1rem; border-radius: 8px; }
            `}</style>
        </div>
    )
}
