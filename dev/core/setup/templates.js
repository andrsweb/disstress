import {selectYesNo} from './io.js';
import {enableFixedHeaderTemplate} from '../templates/fixedHeader.js';
import {enableModalTemplate} from '../templates/modal.js';

export async function configureTemplates(rl) {
	const enableTemplates = await selectYesNo(
		'Step 4: Templates',
		'Do you want to enable ready-made templates (for example, fixed header on scroll)?',
		false
	);

	if (!enableTemplates) {
		console.log('');
		console.log('Step "Templates" was skipped.');
		console.log('');
		return;
	}

	const enableFixedHeader = await selectYesNo(
		'Step 4: Templates',
		'Enable fixed header on scroll (add JS that toggles class scrolled on .header)?',
		true
	);

	if (enableFixedHeader) {
		await enableFixedHeaderTemplate();
	}

	const enableModalScript = await selectYesNo(
		'Step 4: Templates',
		'Connect base modal script (body scroll lock, smooth open and close)?',
		true
	);

	if (enableModalScript) {
		await enableModalTemplate();
	}

	console.log('Templates configuration finished.');
	console.log('');
}
