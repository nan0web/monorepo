import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { OlmuiAdapter } from '../src/components/OlmuiAdapter.jsx';
import { useOlmuiGenerator } from '../src/hooks/useOlmuiGenerator.js';
import { DEMO_MAP } from './scenarios.js';
import * as Elements from '../src/components/elements/index.jsx';
import yaml from 'js-yaml';

const rawPages = import.meta.glob('./data/pages/*.yaml', { eager: true, query: '?raw' });
const sandboxData = {};

for (const [path, module] of Object.entries(rawPages)) {
    const key = path.split('/').pop().replace('.yaml', '');
    sandboxData[key] = yaml.load(module.default);
}

const pageKeys = Object.keys(sandboxData).sort();

function InteractiveWrapper({ Component, props }) {
    const [value, setValue] = React.useState(props.value || props.checked || (Array.isArray(props.options) ? [] : ''));
    
    const interactiveProps = { ...props };
    
    // Connect state
    if (['Multiselect', 'Input', 'Mask', 'Select', 'Markdown'].includes(Component.name)) {
        interactiveProps.value = value;
        interactiveProps.onChange = setValue;
    } else if (Component.name === 'Checkbox') {
        interactiveProps.checked = value;
        interactiveProps.onChange = (e) => setValue(e.target.checked);
    }
    
    // Connect Confirm
    if (Component.name === 'Confirm') {
        interactiveProps.onConfirm = () => alert('You clicked Yes!');
        interactiveProps.onCancel = () => alert('You clicked No!');
    }

    return (
        <div>
            <Component {...interactiveProps} />
            {['Multiselect', 'Input', 'Mask', 'Select', 'Markdown', 'Checkbox'].includes(Component.name) && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-sidebar, #64748b)', padding: '0.2rem', background: 'var(--bg-main, transparent)' }}>
                    <strong style={{ opacity: 0.7 }}>Current Value:</strong> {typeof value === 'object' && !Array.isArray(value) ? 'File/Object selected' : JSON.stringify(value)}
                </div>
            )}
        </div>
    );
}

function renderContentBlock(block, index) {
    // If the block is just a primitive string, treat it as a paragraph
    if (typeof block === 'string') {
        return (
            <div key={index}>
                <InteractiveWrapper Component={Elements.Text} props={{ type: 'body', content: block }} />
            </div>
        );
    }

    const keys = Object.keys(block);
    const mainKey = keys.find(k => !k.startsWith('$'));
    if (!mainKey) return null;

    let Component = Elements[mainKey];
    let props = {};
    
    // Support for lowercase native-like text blocks (h1, h2, p, blockquote)
    const textAliases = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'strong', 'em', 'mark'];
    if (!Component && textAliases.includes(mainKey)) {
        Component = Elements.Text;
        props.type = mainKey === 'p' ? 'body' : mainKey;
        props.content = block[mainKey];
    } else if (!Component) {
        Component = Elements.Text;
        props.content = block[mainKey];
    } else {
        const mainVal = block[mainKey];
        if (typeof mainVal === 'string') {
            if (mainKey === 'Text') props.content = mainVal;
            else if (mainKey === 'Alert' || mainKey === 'Confirm' || mainKey === 'Toast' || mainKey === 'Spinner') props.message = mainVal;
            else if (mainKey === 'Badge') props.label = mainVal;
        } else if (typeof mainVal === 'object' && mainVal !== null) {
            Object.assign(props, mainVal);
        }
    }
    
    // Apply explicitly passed props (like $variant, $type)
    for (const key of keys) {
        if (key.startsWith('$')) {
            props[key.slice(1)] = block[key];
        }
    }

    return (
        <div key={index} style={{ marginBottom: '1rem' }}>
            <InteractiveWrapper Component={Component} props={props} />
        </div>
    );
}

function ComponentPlayground({ pageId, pageConfig }) {
    if (!pageConfig) return <div>Page not found.</div>;
    
    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ padding: '2rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', background: 'var(--bg-panel, #f8fafc)', marginBottom: '2rem' }}>
                {(pageConfig.content || []).map((block, i) => renderContentBlock(block, i))}
            </div>
            
            <h3 style={{ marginTop: '2rem' }}>YAML Definition</h3>
            <pre style={{ background: 'var(--bg-sidebar, #1e293b)', color: 'var(--text-main, #f8fafc)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', border: '1px solid var(--border-color, #e2e8f0)' }}>
                {yaml.dump({ [pageId]: pageConfig })}
            </pre>
        </div>
    );
}

function Sandbox() {
    const [viewMode, setViewMode] = useState('gallery'); // 'gallery' or 'scenario'
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('olmui_theme') || 'light';
        } catch (e) {
            return 'light';
        }
    });

    React.useEffect(() => {
        try {
            localStorage.setItem('olmui_theme', theme);
        } catch (e) {}
    }, [theme]);

    // Sync state with URL hash
    const hash = window.location.hash.replace('#', '');
    const defaultPage = pageKeys.includes(hash) ? hash : pageKeys[0];
    const [selectedId, setSelectedId] = useState(defaultPage);
    
    // Listen for hash changes (back/forward buttons)
    React.useEffect(() => {
        const onHashChange = () => {
            const h = window.location.hash.replace('#', '');
            if (pageKeys.includes(h)) {
                setSelectedId(h);
                setViewMode('gallery');
            } else if (DEMO_MAP[h]) {
                setScenarioName(h);
                setViewMode('scenario');
            }
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    const handleSelectPage = (id) => {
        setSelectedId(id);
        setViewMode('gallery');
        window.location.hash = id;
        setSidebarOpen(false);
    };

    const handleSelectScenario = (id) => {
        setScenarioName(id);
        setViewMode('scenario');
        window.location.hash = id;
        setSidebarOpen(false);
    };

    const [scenarioName, setScenarioName] = useState(() => DEMO_MAP[hash] ? hash : 'login');
    const selectedComponent = useMemo(() => sandboxData[selectedId], [selectedId]);

    return (
        <div className={`sandbox-layout theme-${theme}`} data-color-mode={theme}>
            <style>{`
                .sandbox-layout { display: flex; height: 100vh; font-family: system-ui, sans-serif; overflow: hidden; }
                .sandbox-sidebar { width: 250px; background: var(--bg-sidebar, #f1f5f9); border-right: 1px solid var(--border-color, #e2e8f0); color: var(--text-sidebar, #334155); display: flex; flex-direction: column; transition: transform 0.3s ease; }
                .sandbox-main { flex: 1; overflow-y: auto; background: var(--bg-main, #fff); color: var(--text-main, #333); transition: background 0.3s, color 0.3s; padding-bottom: 80px; }
                .sandbox-mobile-header { display: none; padding: 1rem; background: var(--bg-mobile-header, #0369a1); color: white; align-items: center; justify-content: space-between; position: fixed; bottom: 0; left: 0; right: 0; z-index: 60; box-shadow: 0 -2px 8px rgba(0,0,0,0.1); }
                .sandbox-toggle { background: transparent; border: 1px solid white; color: white; padding: 0.5rem; border-radius: 4px; cursor: pointer; }
                
                /* Dark mode variables */
                .theme-dark {
                    color-scheme: dark;
                    --bg-main: #0f172a;
                    --text-main: #f8fafc;
                    --border-color: #334155;
                    --bg-panel: #1e293b;
                    --bg-sidebar: #1e293b;
                    --text-sidebar: #cbd5e1;
                    --bg-mobile-header: #0f172a;
                    --bg-active: #0ea5e9;
                    --text-active: #ffffff;
                    --input-bg: #0f172a;
                    --input-text: #f8fafc;
                }
                .theme-light {
                    --bg-main: #ffffff;
                    --text-main: #334155;
                    --border-color: #e2e8f0;
                    --bg-panel: #f8fafc;
                    --bg-sidebar: #f1f5f9;
                    --text-sidebar: #334155;
                    --bg-mobile-header: #0369a1;
                    --bg-active: #e0f2fe;
                    --text-active: #0369a1;
                    --input-bg: #ffffff;
                    --input-text: #334155;
                }
                
                .sandbox-main input,
                .sandbox-main select,
                .sandbox-main textarea {
                    background: var(--input-bg, #fff);
                    color: var(--input-text, #333);
                    border: 1px solid var(--border-color, #cbd5e1);
                }
                
                @media (max-width: 768px) {
                    .sandbox-layout { flex-direction: column; }
                    .sandbox-mobile-header { display: flex; }
                    .sandbox-sidebar { position: fixed; top: 0; left: 0; bottom: 0; z-index: 50; transform: translateX(-100%); width: 250px; box-shadow: 2px 0 8px rgba(0,0,0,0.5); }
                    .sandbox-sidebar.open { transform: translateX(0); }
                    .sandbox-main { flex: 1; padding-top: 0; }
                }
            `}</style>

            {/* Mobile Header */}
            <div className="sandbox-mobile-header">
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>NaN0Web UI</h2>
                <button className="sandbox-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    ☰ Menu
                </button>
            </div>

            {/* Sidebar */}
            <div className={`sandbox-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>NaN0Web UI</h2>
                    <button className="sandbox-toggle" style={{ color: '#333', borderColor: '#ccc', display: sidebarOpen ? 'block' : 'none' }} onClick={() => setSidebarOpen(false)}>✕</button>
                </div>
                
                <div style={{ padding: '1rem' }}>
                    <select 
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }}
                    >
                        <option value="gallery">Component Gallery</option>
                        <option value="scenario">Intents (Scenarios)</option>
                    </select>
                    
                    <button 
                        onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color, #cbd5e1)', background: 'var(--bg-main, #fff)', color: 'var(--text-main, #333)', cursor: 'pointer' }}
                    >
                        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {viewMode === 'gallery' ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {pageKeys.map(id => {
                                const c = sandboxData[id];
                                return (
                                <li key={id}>
                                    <button 
                                        onClick={() => handleSelectPage(id)}
                                        style={{
                                            width: '100%', textAlign: 'left', padding: '0.75rem 1.5rem',
                                            background: selectedId === id && viewMode === 'gallery' ? 'var(--bg-active)' : 'transparent',
                                            color: selectedId === id && viewMode === 'gallery' ? 'var(--text-active)' : 'var(--text-sidebar)',
                                            border: 'none', cursor: 'pointer', fontWeight: selectedId === id && viewMode === 'gallery' ? 'bold' : 'normal'
                                        }}
                                    >
                                        {c.title}
                                    </button>
                                </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {Object.keys(DEMO_MAP).map(key => (
                                <li key={key}>
                                    <button 
                                        onClick={() => handleSelectScenario(key)}
                                        style={{
                                            width: '100%', textAlign: 'left', padding: '0.75rem 1.5rem',
                                            background: scenarioName === key && viewMode === 'scenario' ? 'var(--bg-active)' : 'transparent',
                                            color: scenarioName === key && viewMode === 'scenario' ? 'var(--text-active)' : 'var(--text-sidebar)',
                                            border: 'none', cursor: 'pointer', fontWeight: scenarioName === key && viewMode === 'scenario' ? 'bold' : 'normal'
                                        }}
                                    >
                                        Scenario: {key}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                    className="sandbox-overlay"
                ></div>
            )}

            {/* Main Content */}
            <div className="sandbox-main">
                {viewMode === 'gallery' ? (
                    <ComponentPlayground key={selectedId} pageId={selectedId} pageConfig={selectedComponent} />
                ) : (
                    <div style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '2rem' }}>Scenario: {scenarioName}</h2>
                        <div style={{ border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', padding: '2rem', background: 'var(--bg-panel, #ffffff)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <Runner key={scenarioName} generatorFn={DEMO_MAP[scenarioName]} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Runner({ generatorFn }) {
    const adapterState = useOlmuiGenerator(generatorFn);

    return (
        <OlmuiAdapter 
            state={adapterState.state}
            onSubmit={adapterState.submit}
            onCancel={adapterState.cancel}
            onAcknowledge={adapterState.acknowledge}
        />
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<Sandbox />);
