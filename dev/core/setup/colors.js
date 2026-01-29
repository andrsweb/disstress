import path from 'path';
import fs from 'fs/promises';
import {selectYesNo, ask} from './io.js';

function normalizeColorName(raw) {
	return raw.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

function isValidHex(value) {
	return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

async function appendColorVariable(name, hex) {
	const filePath = path.resolve('dev/src/scss/vars/_colors.scss');
	let content;
	try {
		content = await fs.readFile(filePath, 'utf8');
	} catch (e) {
		content = '// Colors.\n';
	}

	const pattern = new RegExp(`^\\s*\\$c-${name}\\b`, 'm');
	if (pattern.test(content)) {
		console.log(`Color $c-${name} already exists, skipping.`);
		return;
	}

	if (!content.endsWith('\n')) {
		content += '\n';
	}

	const line = `$c-${name}: ${hex.toUpperCase()};\n`;
	content += line;
	await fs.writeFile(filePath, content);
}

async function ensureBaseColorsDefaults() {
	const filePath = path.resolve('dev/src/scss/vars/_colors.scss');
	let content;
	try {
		content = await fs.readFile(filePath, 'utf8');
	} catch (e) {
		content = '// Colors.\n';
	}

	if (!content.endsWith('\n')) {
		content += '\n';
	}

	function applyDefault(variableName, hex) {
		const pattern = new RegExp(`(\\$${variableName}\\s*:\\s*)[^;]+(;)`);
		if (pattern.test(content)) {
			content = content.replace(pattern, `$1${hex}$2`);
		} else {
			content += `$${variableName}: ${hex};\n`;
		}
	}

	applyDefault('c-white', '#FFF');
	applyDefault('c-black', '#111');

	await fs.writeFile(filePath, content);
}

export async function configureColors(rl) {
	const configure = await selectYesNo('Step 2: Base colors', 'Configure base colors now?', true);

	if (!configure) {
		await ensureBaseColorsDefaults();
		console.log('');
		console.log('Step "Base colors" was skipped. Defaults for $c-white and $c-black were applied.\n');
		return;
	}

	console.log('');
	console.log('Step 2: Base colors');
	console.log('--------------------');

	while (true) {
		const rawName = (await ask(rl, 'Color name (without $c-, empty to finish): ')).trim();
		if (!rawName) {
			break;
		}

		const name = normalizeColorName(rawName);
		if (!name) {
			console.log('Use only latin letters, digits and dash.');
			continue;
		}

		const hex = (await ask(rl, `HEX value for $c-${name} (for example, #FF5733): `)).trim();
		if (!isValidHex(hex)) {
			console.log('Invalid HEX. Use format #RRGGBB or #RGB.');
			continue;
		}

		await appendColorVariable(name, hex);
		console.log(`Added $c-${name}: ${hex.toUpperCase()}.`);
	}

	console.log('Color configuration finished.\n');
}
