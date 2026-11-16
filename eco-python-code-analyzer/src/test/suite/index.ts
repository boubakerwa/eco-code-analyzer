import * as path from 'path';
import Mocha from 'mocha';

export async function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	// Add the test file directly since we know its location
	mocha.addFile(path.resolve(__dirname, './extension.test.ts'));

	try {
		// Run the mocha test
		return new Promise<void>((resolve, reject) => {
			mocha.run(failures => {
				if (failures > 0) {
					reject(new Error(`${failures} tests failed.`));
				} else {
					resolve();
				}
			});
		});
	} catch (err) {
		console.error(err);
		throw err;
	}
}
