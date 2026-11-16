const esbuild = require("esbuild");
const fs = require('fs-extra');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
fs.ensureDirSync(distDir);

// Copy Python files to dist
function copyPythonFiles() {
    try {
        const srcDir = path.join(__dirname, 'eco_code_analyzer');
        const destDir = path.join(__dirname, 'dist', 'eco_code_analyzer');
        fs.ensureDirSync(destDir);
        fs.copySync(srcDir, destDir, {
            filter: (src) => {
                return src.endsWith('.py') || fs.statSync(src).isDirectory();
            }
        });
        console.log('✓ Python files copied to dist directory');
    } catch (err) {
        console.error('✘ Error copying Python files:', err);
        process.exit(1);
    }
}

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts',
			'src/test/suite/index.ts',
			'src/test/suite/extension.test.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: 'both',
		sourcesContent: true,
		sourceRoot: 'src',
		platform: 'node',
		outdir: 'dist',
		outbase: 'src',
		external: ['vscode'],
		define: {
			'process.env.NODE_ENV': production ? '"production"' : '"development"'
		},
		logLevel: 'info',
		plugins: [
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin,
		],
	});
	if (watch) {
		copyPythonFiles();
		await ctx.watch();
	} else {
		copyPythonFiles();
		await ctx.rebuild();
		await ctx.dispose();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
