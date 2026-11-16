import * as vscode from 'vscode';

console.log('🔥 EXTENSION FILE STARTING TO LOAD 🔥');

export function activate(context: vscode.ExtensionContext) {
    console.log('🔥 ACTIVATE FUNCTION CALLED 🔥');
    
    // Register a test command
    let disposable = vscode.commands.registerCommand('eco-python-code-analyzer.test', () => {
        vscode.window.showInformationMessage('Test command executed!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
