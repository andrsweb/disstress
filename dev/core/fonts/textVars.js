import fs from 'fs/promises';
import path from 'path';

const TEXT_VARS_PATH = path.resolve('dev/src/scss/vars/_text.scss');

async function readTextFile() {
	try {
		return await fs.readFile(TEXT_VARS_PATH, 'utf8');
	} catch (e) {
		return '';
	}
}

export async function updateFontFamilyVariable(variableName, fontValue) {
	const name = variableName.trim();
	if (!name) {
		return;
	}

	let content = await readTextFile();

	if (!content) {
		content = `// Font families.\n$${name}: ${fontValue};\n\n// Font sizes.\n\n// Font weights.\n\n// Line heights.\n`;
		await fs.writeFile(TEXT_VARS_PATH, content);
		return;
	}

	if (!content.includes('// Font families.')) {
		content = `// Font families.\n$${name}: ${fontValue};\n` + content;
		await fs.writeFile(TEXT_VARS_PATH, content);
		return;
	}

	const pattern = new RegExp(`(\\$${name}\\s*:\\s*)[^;]+(;)`);
	if (pattern.test(content)) {
		content = content.replace(pattern, `$1${fontValue}$2`);
	} else {
		content = content.replace('// Font families.', `// Font families.\n$${name}: ${fontValue};`);
	}

	await fs.writeFile(TEXT_VARS_PATH, content);
}

export async function updateFontWeightVariables(weights) {
	const unique = Array.from(new Set(weights.filter((value) => Number.isFinite(value))));
	const sorted = unique.length
		? unique.sort((a, b) => a - b)
		: [400, 700];

	let content = await readTextFile();

	if (!content) {
		const lines = sorted.map((value) => `$fw-${value}: ${value};`).join('\n');
		content = `// Font families.\n\n// Font sizes.\n\n// Font weights.\n${lines}\n\n// Line heights.\n`;
		await fs.writeFile(TEXT_VARS_PATH, content);
		return;
	}

	const marker = '// Font weights.';
	const index = content.indexOf(marker);

	if (index === -1) {
		const lines = sorted.map((value) => `$fw-${value}: ${value};`).join('\n');
		if (!content.endsWith('\n')) {
			content += '\n';
		}
		content += `${marker}\n${lines}\n`;
		await fs.writeFile(TEXT_VARS_PATH, content);
		return;
	}

	const afterMarkerIndex = content.indexOf('\n', index);
	const tail = afterMarkerIndex === -1 ? '' : content.slice(afterMarkerIndex + 1);
	const nextMarkerMatch = tail.match(/\n\/\/ /);

	const endIndex = nextMarkerMatch
		? afterMarkerIndex + 1 + nextMarkerMatch.index + 1
		: content.length;

	const before = content.slice(0, index);
	const after = content.slice(endIndex);
	const lines = sorted.map((value) => `$fw-${value}: ${value};`).join('\n');
	const middle = `${marker}\n${lines}\n`;

	const updated = before + middle + after;
	await fs.writeFile(TEXT_VARS_PATH, updated);
}
