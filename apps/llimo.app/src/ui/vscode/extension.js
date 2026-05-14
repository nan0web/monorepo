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
    if (message.type === 'start-capture') {
        const intent = await vscode.window.showInputBox({
            prompt: "🎤 Ваш намір (Емуляція Voice-to-App, бо мікрофон у Webview обмежений)",
            placeHolder: "Наприклад: Створи нову модель..."
        });
        
        if (intent) {
            webview.postMessage({ type: 'feedback', text: `Отримано намір: ${intent}` });
            await processIntent(intent, webview);
        } else {
            webview.postMessage({ type: 'feedback', text: `Введення скасовано.` });
        }
    } else if (message.type === 'voice-command') {
        await processIntent(message.text, webview);
    }
}

async function processIntent(intent, webview) {
    vscode.window.showInformationMessage(`LLiMo Intent Captured: "${intent}"`);
    
    try {
        // Використовуємо доменну модель додатка llimo.app для розбору наміру (Zero-React)
        const { WorkflowModel } = await import('../../domain/WorkflowModel.js');
        const workflow = new WorkflowModel({ intent });
        
        // Емуляція делегування оркестратору
        webview.postMessage({ 
            type: 'feedback', 
            text: `Розібрано намір: [${/** @type {any} */(workflow).intent || intent}]. Очікування оркестратора...` 
        });
    } catch (e) {
        console.error("Помилка ізоляції домену (не вдалося завантажити модель):", e);
        webview.postMessage({ type: 'feedback', text: `Intent: "${intent}" (Model load failed)` });
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
