# Eco Python Code Analyzer

A VSCode extension that analyzes Python code for ecological impact. This extension helps developers write more energy-efficient and environmentally conscious code by providing real-time feedback and suggestions.

## Features

- Real-time analysis of Python files
- Eco-score displayed in status bar
- Diagnostic warnings for potential optimizations
- Simple hover messages with improvement suggestions

## Installation

1. Clone this repository
2. Run `npm install` in the extension directory
3. Press F5 to open a new window with the extension loaded

## Usage

1. Open any Python file in VSCode
2. The extension will automatically analyze your code and show:
   - An eco-score in the status bar
   - Diagnostic warnings for potential improvements
   - Hover messages with optimization suggestions

### Commands

- `Analyze Python File for Ecological Impact`: Manually trigger analysis of the current file
- `Show Eco Score`: Display detailed information about the current file's eco-score

### Settings

- `eco-python-code-analyzer.enableRealTimeAnalysis`: Enable/disable real-time analysis (default: true)

## Known Limitations

- Basic pattern detection only
- File-level analysis only (no project-wide analysis)
- Limited to specific optimization patterns
- No detailed reports or visualizations
- No configuration options beyond enabling/disabling real-time analysis

## Credits

- Python Analyzer: Moudather Chelbi
- VSCode Extension: Wassim Boubaker

## Future Improvements

1. Real-time analysis improvements
2. Detailed reports and visualizations
3. Project-wide analysis
4. Advanced configuration options
5. Quick fixes and code actions
6. Git history integration
7. CO2 emission calculations
8. Tree planting recommendations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
