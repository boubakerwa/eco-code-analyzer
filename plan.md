# MVP Plan: Eco-Code-Analyzer VSCode Extension

## Overview
Create a minimal viable product (MVP) of the eco-code analyzer as a VSCode extension, focusing on core functionality only.

## Core Features (MVP)
1. Analyze Python files for basic eco-patterns
2. Display simple diagnostics
3. Show basic eco-score in status bar

## Implementation Steps

### Phase 1: Basic Extension Setup (1 day)
1. Create VSCode extension
```bash
npm install -g yo generator-code
yo code
```

2. Configure basic extension settings
```json
{
  "name": "eco-code-analyzer",
  "displayName": "Eco Code Analyzer",
  "description": "Analyze Python code for ecological impact",
  "version": "0.1.0",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [
    "onLanguage:python"
  ],
  "main": "./out/extension.js"
}
```

### Phase 2: Python Integration (1-2 days)

1. Simple Python Analysis Service
```python
# analyzer_service.py
from eco_code_analyzer.analyzer import analyze_code, get_eco_score

def analyze_file(file_content: str) -> dict:
    """Analyze Python file content and return basic metrics"""
    analysis = analyze_code(file_content)
    score = get_eco_score(analysis)
    return {
        'score': score,
        'issues': get_basic_issues(analysis)
    }

def get_basic_issues(analysis: dict) -> list:
    """Extract basic issues from analysis results"""
    issues = []
    if analysis['energy_efficiency'] < 0.7:
        issues.append({
            'message': 'Consider using list comprehension instead of loop',
            'severity': 'Warning'
        })
    if analysis['resource_usage'] < 0.7:
        issues.append({
            'message': 'Resource usage could be optimized',
            'severity': 'Information'
        })
    return issues
```

### Phase 3: Extension Development (2-3 days)

1. Basic Extension Implementation
```typescript
// extension.ts
import * as vscode from 'vscode';
import { spawn } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    // Create status bar item
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right
    );
    context.subscriptions.push(statusBarItem);

    // Create diagnostic collection
    const diagnostics = vscode.languages.createDiagnosticCollection('eco-code');
    context.subscriptions.push(diagnostics);

    // Register document analyzer
    let timeout: NodeJS.Timer | undefined = undefined;
    function triggerAnalysis(document: vscode.TextDocument) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        timeout = setTimeout(() => analyzeDocument(document), 500);
    }

    // Watch for document changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId === 'python') {
                triggerAnalysis(event.document);
            }
        })
    );

    // Analyze current document
    if (vscode.window.activeTextEditor) {
        triggerAnalysis(vscode.window.activeTextEditor.document);
    }
}

function analyzeDocument(document: vscode.TextDocument) {
    // Call Python analyzer
    const python = spawn('python', ['-c', `
import sys
import json
from analyzer_service import analyze_file
result = analyze_file(sys.stdin.read())
print(json.dumps(result))
    `]);

    // Send document content
    python.stdin.write(document.getText());
    python.stdin.end();

    // Handle results
    let output = '';
    python.stdout.on('data', data => output += data);
    python.stdout.on('end', () => {
        const result = JSON.parse(output);
        updateUI(document, result);
    });
}

function updateUI(document: vscode.TextDocument, result: any) {
    // Update status bar
    const statusBarItem = vscode.window.activeStatusBarItem;
    if (statusBarItem) {
        statusBarItem.text = `$(symbol-misc) Eco Score: ${Math.round(result.score * 100)}%`;
        statusBarItem.show();
    }

    // Update diagnostics
    const diagnostics = vscode.languages.getDiagnosticCollection('eco-code');
    const diags = result.issues.map(issue => new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 0),
        issue.message,
        issue.severity === 'Warning' 
            ? vscode.DiagnosticSeverity.Warning 
            : vscode.DiagnosticSeverity.Information
    ));
    diagnostics.set(document.uri, diags);
}
```

### Phase 4: Testing (1 day)
1. Basic functionality testing
2. Performance testing with different file sizes
3. Error handling verification

### Phase 5: Documentation (1 day)
1. Basic README with:
   - Installation instructions
   - Usage guide
   - Feature list
   - Known limitations

## MVP Features

### 1. Analysis
- Basic eco-score calculation
- Simple pattern detection
- File-level analysis only

### 2. UI Elements
- Status bar showing eco-score
- Basic diagnostic warnings
- Simple hover messages

### 3. Limitations
- No real-time updates (analysis on save only)
- Basic pattern detection only
- No detailed reports or visualizations
- No configuration options
- Single file analysis only (no project-wide analysis)

## Future Improvements (Post-MVP)
1. Real-time analysis
2. Detailed reports and visualizations
3. Project-wide analysis
4. Configuration options
5. Quick fixes and code actions
6. Git history integration
7. CO2 emission calculations
8. Tree planting recommendations

This MVP focuses on delivering core value quickly while laying the groundwork for future enhancements. It maintains the essential functionality of eco-code analysis while simplifying the implementation and user interface.
