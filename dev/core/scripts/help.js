const sections = [
	{
		title: 'Core npm scripts',
		items: [
			{
				cmd: 'npm start',
				desc: 'Run dev server with setup wizard and HTML/SCSS linters enabled.'
			},
			{
				cmd: 'npm run start:nl',
				desc: 'Run dev server without linters (no-lint). Handy when you just need to quickly preview markup.'
			},
			{
				cmd: 'npm run build',
				desc: 'Production build: HTML, CSS, JS, assets + HTML/SCSS validation, JS obfuscation and minification.'
			},
			{
				cmd: 'npm run build:nl',
				desc: 'Production build without HTML/SCSS validation (no-lint).'
			}
		]
	},
	{
		title: 'Gulp tasks (if you need them directly)',
		items: [
			{
				cmd: 'gulp --gulpfile dev/core/gulpfile.js --cwd . dev',
				desc: 'Run dev server directly via gulp.'
			},
			{
				cmd: 'gulp --gulpfile dev/core/gulpfile.js --cwd . build --prod',
				desc: 'Production build directly via gulp (analogue of npm run build).'
			},
			{
				cmd: 'gulp --gulpfile dev/core/gulpfile.js --cwd . clean',
				desc: 'Clean build folder (assets).'
			}
		]
	},
	{
		title: 'Project setup wizard',
		items: [
			{
				cmd: 'Step 1: Layout grid',
				desc: 'Configure container width and inner paddings. Can be skipped — defaults will be used.'
			},
			{
				cmd: 'Step 2: Base colors',
				desc: 'Add and configure color variables ($c-white, $c-black, etc.). Can be skipped — base colors will stay default.'
			},
			{
				cmd: 'Step 3: Fonts',
				desc: 'Connect fonts from Google Fonts (locally or via CDN), choose weights, generate @font-face and SCSS variables.'
			},
			{
				cmd: 'Step 4: Templates',
				desc: 'Set of ready-made solutions (e.g. fixed header on scroll). Can be enabled selectively.'
			}
		]
	},
	{
		title: 'Linters and validation',
		items: [
			{
				cmd: 'HTML (W3C)',
				desc: 'Validate built HTML files against W3C validator. In dev it prints warnings, in build it can fail the build.'
			},
			{
				cmd: 'SCSS (stylelint)',
				desc: 'Validate SCSS with modern rules: formatting, colors, naming, etc. In dev it prints errors, in build it can break the build.'
			},
			{
				cmd: '--no-lint / start:nl / build:nl',
				desc: 'Run dev or build without HTML/SCSS validation when you just need to quickly check functionality or layout.'
			}
		]
	}
];

function printHeader() {
	console.log('==========================');
	console.log('  Commands help         ');
	console.log('==========================');
	console.log('');
}

function printSections() {
	sections.forEach((section) => {
		console.log(section.title);
		console.log('-'.repeat(section.title.length));
		section.items.forEach((item) => {
			console.log(`  ${item.cmd}`);
			console.log(`    ${item.desc}`);
		});
		console.log('');
	});
}

printHeader();
printSections();
