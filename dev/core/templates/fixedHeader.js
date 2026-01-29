import path from 'path';
import fs from 'fs/promises';

const HEADER_JS_PATH = path.resolve('dev/src/html/components/common/header/header.js');
const MAIN_JS_PATH = path.resolve('dev/src/js/main.js');
const HEADER_SCSS_PATH = path.resolve('dev/src/html/components/common/header/header.scss');

function ensureDeclaration(block, property, value) {
	const pattern = new RegExp(`${property}\\s*:\\s*[^;]+;`);
	const line = `${property}: ${value};`;

	if (pattern.test(block)) {
		return block.replace(pattern, line);
	}

	const braceIndex = block.indexOf('{');
	if (braceIndex === -1) {
		return block;
	}

	const before = block.slice(0, braceIndex + 1);
	const after = block.slice(braceIndex + 1);
	return `${before}\n  ${line}${after}`;
}

function ensureScrolledNested(block) {
	if (block.includes('&.scrolled')) {
		return block;
	}

	const closeIndex = block.lastIndexOf('}');
	if (closeIndex === -1) {
		return block;
	}

	const before = block.slice(0, closeIndex);
	const after = block.slice(closeIndex);
	const nestedLines = [
		'  &.scrolled {',
		'    background-color: red;',
		'  }',
		''
	];
	const nested = `\n${nestedLines.join('\n')}\n`;
	return `${before}${nested}${after}`;
}

export async function enableFixedHeaderTemplate() {
	let headerContent = '';

	try {
		headerContent = await fs.readFile(HEADER_JS_PATH, 'utf8');
	} catch (error) {
	}

	const hasScrolledClassLogic =
		headerContent.includes("header.classList.add('scrolled')") ||
		headerContent.includes('header.classList.add("scrolled")');

	let updatedScript = false;

	if (!hasScrolledClassLogic) {
		const newHeaderContentLines = [
			"document.addEventListener('DOMContentLoaded', () => {",
			"  'use strict';",
			'  headerScroll();',
			'});',
			'',
			'const headerScroll = () => {',
			"  const header = document.querySelector('.header');",
			'  if (!header) {',
			'    return;',
			'  }',
			'  const onScroll = () => {',
			'    if (window.scrollY > 0) {',
			"      header.classList.add('scrolled');",
			'    } else {',
			"      header.classList.remove('scrolled');",
			'    }',
			'  };',
			'  onScroll();',
			"  window.addEventListener('scroll', onScroll);",
			'};',
			''
		];

		headerContent = newHeaderContentLines.join('\n');
		await fs.mkdir(path.dirname(HEADER_JS_PATH), {recursive: true});
		await fs.writeFile(HEADER_JS_PATH, headerContent);
		updatedScript = true;
	}

	let mainContent;

	try {
		mainContent = await fs.readFile(MAIN_JS_PATH, 'utf8');
	} catch (error) {
		console.log('File main.js not found, could not import header.js.');
		return;
	}

	const importLine = "import '../html/components/common/header/header.js';";
	let updatedImport = false;

	if (!mainContent.includes(importLine)) {
		if (mainContent.includes("import './common/common';")) {
			mainContent = mainContent.replace(
				"import './common/common';",
				"import './common/common';\n" + importLine
			);
		} else {
			mainContent = `${importLine}\n${mainContent}`;
		}

		await fs.writeFile(MAIN_JS_PATH, mainContent);
		updatedImport = true;
	}

	let updatedStyles = false;

	try {
		let scssContent = await fs.readFile(HEADER_SCSS_PATH, 'utf8');
		const match = scssContent.match(/\.header\s*{[^}]*}/s);

		if (match) {
			let block = match[0];
			const originalBlock = block;

			block = ensureDeclaration(block, 'position', 'fixed');
			block = ensureDeclaration(block, 'left', '0');
			block = ensureDeclaration(block, 'top', '0');
			block = ensureDeclaration(block, 'width', '100%');
			block = ensureScrolledNested(block);

			if (block !== originalBlock) {
				scssContent = scssContent.replace(match[0], block);
				await fs.writeFile(HEADER_SCSS_PATH, scssContent);
				updatedStyles = true;
			}
		} else {
			if (!scssContent.endsWith('\n')) {
				scssContent += '\n';
			}

			const blockLines = [
				'.header {',
				'  position: fixed;',
				'  left: 0;',
				'  top: 0;',
				'  width: 100%;',
				'',
				'  &.scrolled {',
				'    background-color: red;',
				'  }',
				'}',
				''
			];

			scssContent += blockLines.join('\n');
			await fs.writeFile(HEADER_SCSS_PATH, scssContent);
			updatedStyles = true;
		}
	} catch (error) {
		console.log('File header.scss not found, skipping header styles update.');
	}

	if (updatedScript || updatedImport || updatedStyles) {
		console.log('Fixed header on scroll is configured: JS and styles updated.');
	} else {
		console.log('Fixed header on scroll was already configured.');
	}
}

