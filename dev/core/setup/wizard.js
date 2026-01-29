import {createInterface} from './io.js';
import {configureLayout} from './layout.js';
import {configureColors} from './colors.js';
import {configureFonts} from './fontsStep.js';
import {configureTemplates} from './templates.js';

export async function runSetupWizard() {
	const rl = createInterface();

	try {
		await configureLayout(rl);
		await configureColors(rl);
		await configureFonts(rl);
		await configureTemplates(rl);
	} finally {
		rl.close();
	}
}
