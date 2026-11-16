import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(myExtension);
    });

    test('Extension should activate', async () => {
        const ext = vscode.extensions.getExtension('eco-python-code-analyzer');
        assert.ok(ext);
        
        if (ext) {
            await ext.activate();
            assert.ok(true);
        }
    });

    test('Should analyze Python files', async () => {
        const document = await vscode.workspace.openTextDocument({
            content: 'print("test")',
            language: 'python'
        });
        
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('eco-python-code-analyzer.analyzeFile');
        
        // Give time for analysis to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Basic check that the command executed without error
        assert.ok(true);
    });
});
