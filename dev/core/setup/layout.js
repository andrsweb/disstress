import path from 'path';
import fs from 'fs/promises';
import {selectYesNo, askNumberPx} from './io.js';

async function readGridDefaults() {
	const filePath = path.resolve('dev/src/scss/vars/_grid.scss');
	let content;
	try {
		content = await fs.readFile(filePath, 'utf8');
	} catch (e) {
		return {containerWidth: '1200', containerPadding: '20'};
	}

	const widthMatch = content.match(/\$container-width\s*:\s*(\d+)px/);
	const paddingMatch = content.match(/\$container-padding\s*:\s*(\d+)px/);

	return {
		containerWidth: widthMatch ? widthMatch[1] : '1200',
		containerPadding: paddingMatch ? paddingMatch[1] : '20'
	};
}

async function updateGrid(containerWidth, containerPadding) {
	const filePath = path.resolve('dev/src/scss/vars/_grid.scss');
	let content;
	try {
		content = await fs.readFile(filePath, 'utf8');
	} catch (e) {
		return;
	}

	content = content.replace(
		/(\$container-width\s*:\s*)[^;]+(;)/,
		`$1${containerWidth}px$2`
	);

	content = content.replace(
		/(\$container-padding\s*:\s*)[^;]+(;)/,
		`$1${containerPadding}px$2`
	);

	await fs.writeFile(filePath, content);
}

async function setDefaultGrid() {
	const defaults = {containerWidth: '1200', containerPadding: '20'};
	await updateGrid(defaults.containerWidth, defaults.containerPadding);
	return defaults;
}

export async function configureLayout(rl) {
	const configure = await selectYesNo('Step 1: Layout grid', 'Configure layout grid now?', true);

	if (!configure) {
		const defaults = await setDefaultGrid();
		console.log('');
		console.log(
			`Step "Layout grid" was skipped. Defaults applied: container width = ${defaults.containerWidth}px, inner padding = ${defaults.containerPadding}px.\n`
		);
		return;
	}

	console.log('');
	console.log('Step 1: Layout grid');
	console.log('--------------------');

	const defaults = await readGridDefaults();
	const containerWidth = await askNumberPx(
		rl,
		'Container width in pixels',
		defaults.containerWidth
	);
	const containerPadding = await askNumberPx(
		rl,
		'Container inner padding in pixels',
		defaults.containerPadding
	);

	await updateGrid(containerWidth, containerPadding);
	console.log(
		`Layout grid updated: container width = ${containerWidth}px, inner padding = ${containerPadding}px.\n`
	);
}
