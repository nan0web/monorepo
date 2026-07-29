const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// ==========================================
// 🏗 Domain Isolation (Model-as-Schema)
// Примітка: Плагін виступає ЛИШЕ адаптером. 
// Бізнес-логіка імпортується з src/ (наприклад, WorkflowModel)
// використовуючи dynamic import(), щоб сумістити CommonJS Extension та ESM додаток.
// ==========================================

function activate(context) {
    console.log('LLiMo Extension "ui/vscode" is now active!');

    // 1. Команда для відкриття Webview як Panel
    const startCmd = vscode.commands.registerCommand('llimo.startRunner', async () => {
        const panel = vscode.window.createWebviewPanel(
            'llimoRunner',
            'LLiMo Universal Runner',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.file(context.extensionPath)]
            }
        );

        panel.webview.html = getWebviewContent(context, panel.webview);

        // IPC: Обробка повідомлень з Webview (Web Speech API)
        panel.webview.onDidReceiveMessage(async message => {
            await handleWebviewMessage(message, panel.webview);
        }, undefined, context.subscriptions);
    });

    // 2. Провайдер для бокової панелі (Activity Bar)
    const provider = new LLiMoViewProvider(context);
    const viewReg = vscode.window.registerWebviewViewProvider('llimo-runner-view', provider);

    context.subscriptions.push(startCmd, viewReg);
}

class LLiMoViewProvider {
    constructor(context) {
        this.context = context;
    }

    resolveWebviewView(webviewView, context, token) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(this.context.extensionPath)]
        };

        webviewView.webview.html = getWebviewContent(this.context, webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async message => {
            await handleWebviewMessage(message, webviewView.webview);
        });
    }
}

// Міст: Webview -> Субагенти / Node.js
async function handleWebviewMessage(message, webview) {
    if (message.type === 'get-models') {
        const list = await getModelsList();
        webview.postMessage({ type: 'models-list', list });
    } else if (message.type === 'get-files') {
        const list = await getWorkspaceFiles();
        webview.postMessage({ type: 'files-list', list });
    } else if (message.type === 'run-command') {
        await runLlimoCommand(message.command, message.intent, message.model, webview);
    } else if (message.type === 'get-telemetry') {
        const stats = await getSessionTelemetry();
        webview.postMessage({ type: 'telemetry', stats });
    } else if (message.type === 'get-aliases') {
        const aliases = await getAliasesAndFiles();
        webview.postMessage({ type: 'aliases-list', aliases });
    }
}

async function getSessionTelemetry() {
    try {
        const { StatsCollector } = await import('../../utils/StatsCollector.js');
        const stats = await StatsCollector.getTodayStats();
        return stats;
    } catch (err) {
        console.error('Error fetching telemetry:', err);
        return { costUsd: 0, tokensInput: 0, tokensOutput: 0, speedTps: 0 };
    }
}

async function getAliasesAndFiles() {
    try {
        const { FileSystem } = await import('../../utils/FileSystem.js');
        const { loadConfig } = await import('../../llm/pack.js');
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const rootPath = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : process.cwd();
        const fsHelper = new FileSystem({ cwd: rootPath });
        const config = await loadConfig(fsHelper);
        
        const aliasesData = {};
        for (const [alias, target] of Object.entries(config.aliases || {})) {
            const targetPath = path.isAbsolute(target) ? target : path.resolve(rootPath, target);
            const files = [];
            try {
                if (fs.existsSync(targetPath)) {
                    const stat = fs.statSync(targetPath);
                    if (stat.isDirectory()) {
                        const entries = fs.readdirSync(targetPath);
                        for (const entry of entries) {
                            if (fs.statSync(path.join(targetPath, entry)).isFile()) {
                                files.push(entry);
                            }
                        }
                    }
                }
            } catch (e) {}
            aliasesData[alias] = {
                path: target,
                files
            };
        }
        return aliasesData;
    } catch (err) {
        console.error('Error loading config/aliases:', err);
        return {};
    }
}

async function getModelsList() {
    try {
        const { loadModels } = await import('../../Chat/models.js');
        const modelMap = await loadModels();
        return Array.from(modelMap.values()).map(m => ({
            id: m.id,
            provider: m.provider,
            context_length: m.context_length
        }));
    } catch (err) {
        console.error('Error loading models:', err);
        return [];
    }
}

async function getWorkspaceFiles() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return [];
    const rootPath = workspaceFolders[0].uri.fsPath;
    try {
        const { FileSystem } = await import('../../utils/FileSystem.js');
        const fsHelper = new FileSystem({ cwd: rootPath });
        const list = [];
        await fsHelper.browse(rootPath, {
            recursive: true,
            ignore: ['.git', 'node_modules', '.agent', 'dist', 'out'],
            onRead: async (dir, entries) => {
                for (const entry of entries) {
                    const full = path.join(dir, entry);
                    const relative = path.relative(rootPath, full);
                    try {
                        const stat = fs.statSync(full);
                        if (stat.isFile()) {
                            list.push(relative);
                        }
                    } catch (e) {
                        // ignore unreadable/broken symlinks
                    }
                }
            }
        });
        return list;
    } catch (err) {
        console.error('Error scanning workspace:', err);
        return [];
    }
}

async function runLlimoCommand(cmdName, intent, modelName, webview) {
    try {
        const { LlimoApp } = await import('../../domain/app/LlimoApp.js');
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const rootPath = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : process.cwd();
        
        const app = new LlimoApp({
            command: cmdName,
            intent: intent,
            model: modelName
        }, {
            // Setup CWD so that it operates inside the workspace folder
            cwd: rootPath
        });

        const gen = app.run();
        let next = await gen.next();
        while (!next.done) {
            const val = next.value;
            if (val) {
                webview.postMessage({
                    type: 'yield',
                    value: {
                        type: val.type || 'show',
                        level: val.level || val.variant || 'info',
                        message: val.message || val.text || ''
                    }
                });
            }
            // Send periodic telemetry updates
            const stats = await getSessionTelemetry();
            webview.postMessage({ type: 'telemetry', stats });

            next = await gen.next();
        }
        
        // Final telemetry sync
        const stats = await getSessionTelemetry();
        webview.postMessage({ type: 'telemetry', stats });

        webview.postMessage({ type: 'complete', result: next.value });
    } catch (err) {
        console.error('Error executing llimo command:', err);
        webview.postMessage({ type: 'error', error: err.message });
    }
}

function getWebviewContent(context, webview) {
    const templatePath = path.join(context.extensionPath, 'webview-template.html');
    let html = fs.readFileSync(templatePath, 'utf8');
    
    // Підготовка CSP (Content Security Policy) для безпеки та завантаження локальних ресурсів (ui-lit), якщо необхідно
    const nonce = getNonce();
    html = html.replaceAll('{{CSP_NONCE}}', nonce);
    
    return html;
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
