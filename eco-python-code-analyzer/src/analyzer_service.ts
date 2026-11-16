import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';

export interface AnalysisResult {
    score: number;
    issues: Array<{
        message: string;
        severity: 'Warning' | 'Information';
        range?: vscode.Range;
    }>;
}

export class AnalyzerService {
    private pythonPath: string;
    private diagnosticCollection: vscode.DiagnosticCollection;
    private outputChannel: vscode.OutputChannel;

    private extensionPath: string;

    constructor(outputChannel: vscode.OutputChannel, extensionPath: string) {
        this.pythonPath = 'python3';  // Default to python3
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('eco-python-code-analyzer');
        this.outputChannel = outputChannel;
        this.extensionPath = extensionPath;
    }

    public async analyzeFile(document: vscode.TextDocument): Promise<AnalysisResult> {
        return new Promise((resolve, reject) => {
            // Use the provided extension path to locate the Python analyzer module
            const analyzerPath = path.join(this.extensionPath, 'eco_code_analyzer');
            
            this.outputChannel.appendLine(`Current directory: ${process.cwd()}`);
            this.outputChannel.appendLine(`Extension path: ${this.extensionPath}`);
            this.outputChannel.appendLine(`Looking for Python analyzer at: ${analyzerPath}`);
            
            // Check if the directory exists
            const fs = require('fs');
            if (!fs.existsSync(analyzerPath)) {
                this.outputChannel.appendLine(`Error: Analyzer directory not found at ${analyzerPath}`);
                this.outputChannel.appendLine(`Current directory contents: ${fs.readdirSync(this.extensionPath)}`);
                reject(new Error(`Python analyzer directory not found at: ${analyzerPath}`));
                return;
            }
            this.outputChannel.appendLine('Found analyzer directory');
            
            // Check if required Python files exist
            const requiredFiles = ['analyzer.py', 'rules.py'];
            for (const file of requiredFiles) {
                const filePath = path.join(analyzerPath, file);
                if (!fs.existsSync(filePath)) {
                    this.outputChannel.appendLine(`Error: Required Python file not found: ${filePath}`);
                    reject(new Error(`Required Python file not found: ${file}`));
                    return;
                }
            }
            this.outputChannel.appendLine('All required Python files found');

            // First verify Python is available and log version
            const pythonVersion = spawn(this.pythonPath, ['--version']);
            let versionOutput = '';
            pythonVersion.stdout.on('data', (data) => {
                versionOutput += data;
            });
            pythonVersion.stderr.on('data', (data) => {
                versionOutput += data;
            });
            pythonVersion.on('error', (err) => {
                this.outputChannel.appendLine(`Error: Failed to execute Python: ${err.message}`);
                reject(new Error(`Failed to execute Python: ${err.message}`));
                return;
            });
            pythonVersion.on('close', (code) => {
                this.outputChannel.appendLine(`Python version check: ${versionOutput.trim()}`);
                if (code !== 0) {
                    reject(new Error(`Python version check failed with code: ${code}`));
                    return;
                }
            });

            // Log the Python command being executed
            const pythonScript = `
try:
    import os
    import sys
    import json
    print("Current working directory:", os.getcwd())
    print("Python path:", sys.path)
    print("Analyzer path to add:", '${analyzerPath}')
    sys.path.insert(0, '${analyzerPath}')
    print("Updated Python path:", sys.path)
    print("Attempting to import analyzer module...")
    from analyzer import analyze_code
    print("Successfully imported analyze_code")
    print("Attempting to import rules module...")
    from rules import get_eco_score
    print("Successfully imported get_eco_score")
except Exception as e:
    print(f"Error during imports: {str(e)}")
    print(f"Error type: {type(e).__name__}")
    import traceback
    print("Traceback:")
    print(traceback.format_exc())
    sys.exit(1)

content = sys.stdin.read()
analysis = analyze_code(content)
score = get_eco_score(analysis)

issues = []
if analysis.get('energy_efficiency', 1.0) < 0.7:
    issues.append({
        'message': 'Consider optimizing loops and comprehensions for better energy efficiency',
        'severity': 'Warning'
    })
if analysis.get('resource_usage', 1.0) < 0.7:
    issues.append({
        'message': 'Resource usage could be optimized',
        'severity': 'Information'
    })

result = {
    'score': score,
    'issues': issues
}
print(json.dumps(result))
            `;
            this.outputChannel.appendLine('Executing Python script:');
            this.outputChannel.appendLine(pythonScript);

            const python = spawn(this.pythonPath, [
                '-c',
                `
try:
    import sys
    import json
    print("Adding analyzer path:", '${analyzerPath}')
    sys.path.append('${analyzerPath}')
    print("Importing analyzer module...")
    from analyzer import analyze_code
    print("Importing rules module...")
    from rules import get_eco_score

content = sys.stdin.read()
analysis = analyze_code(content)
score = get_eco_score(analysis)

issues = []
if analysis.get('energy_efficiency', 1.0) < 0.7:
    issues.append({
        'message': 'Consider optimizing loops and comprehensions for better energy efficiency',
        'severity': 'Warning'
    })
if analysis.get('resource_usage', 1.0) < 0.7:
    issues.append({
        'message': 'Resource usage could be optimized',
        'severity': 'Information'
    })

result = {
    'score': score,
    'issues': issues
}
print(json.dumps(result))
                `
            ]);

            let output = '';
            let errorOutput = '';

            python.stdout.on('data', (data) => {
                output += data;
            });

            python.stderr.on('data', (data) => {
                errorOutput += data;
                this.outputChannel.appendLine(`Python analyzer error: ${data.toString()}`);
            });

            python.on('close', (code) => {
                this.outputChannel.appendLine(`Python process exited with code: ${code}`);
                if (code !== 0) {
                    const error = new Error(`Python analyzer failed: ${errorOutput}`);
                    this.outputChannel.appendLine(`Analysis failed: ${error}`);
                    reject(error);
                    return;
                }

                try {
                    this.outputChannel.appendLine(`Raw output from Python: ${output}`);
                    const result = JSON.parse(output);
                    this.outputChannel.appendLine(`Parsed analysis result: ${JSON.stringify(result, null, 2)}`);
                    resolve(result as AnalysisResult);
                } catch (e) {
                    const error = new Error(`Failed to parse analyzer output: ${e}\nRaw output: ${output}`);
                    this.outputChannel.appendLine(`Parse error: ${error}`);
                    reject(error);
                }
            });

            // Send the document content to the Python process
            python.stdin.write(document.getText());
            python.stdin.end();
        });
    }

    public updateDiagnostics(document: vscode.TextDocument, result: AnalysisResult) {
        const diagnostics: vscode.Diagnostic[] = result.issues.map(issue => {
            const range = issue.range || new vscode.Range(0, 0, 0, 0);
            const severity = issue.severity === 'Warning' 
                ? vscode.DiagnosticSeverity.Warning 
                : vscode.DiagnosticSeverity.Information;
            
            return new vscode.Diagnostic(range, issue.message, severity);
        });

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    public clearDiagnostics() {
        this.diagnosticCollection.clear();
    }

    public dispose() {
        this.diagnosticCollection.dispose();
    }
}
