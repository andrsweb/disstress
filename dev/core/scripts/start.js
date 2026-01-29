import {spawn} from 'child_process';
import {runSetupWizard} from '../setup/wizard.js';
import {selectYesNo, printStartBanner} from '../setup/io.js';

function startGulp() {
	const extraArgs = process.argv.slice(2);
	const gulpArgs = [
		'node_modules/gulp/bin/gulp.js',
		'--gulpfile',
		'dev/core/gulpfile.js',
		'--cwd',
		'.',
		'dev',
		...extraArgs
	];

	const child = spawn(process.execPath, gulpArgs, {
		stdio: 'inherit'
	});

	child.on('exit', (code) => {
		process.exit(code ?? 0);
	});
}

async function askSetup() {
	if (!process.stdin.isTTY) {
		printStartBanner();
		startGulp();
		return;
	}

	const configure = await selectYesNo('Setup wizard', 'Run project setup before starting dev server?', true);

	if (configure) {
		console.log('');
		console.log('Starting setup wizard...');
		console.log('');
		try {
			await runSetupWizard();
		} catch (error) {
			console.error('Setup wizard failed:', error);
		}
	} else {
		console.log('Setup was skipped.');
	}

	startGulp();
}

askSetup().catch((error) => {
	console.error('Failed to start setup wizard:', error);
	startGulp();
});
