import readline from 'readline';

const COLOR_RESET = '\x1b[0m';
const COLOR_PRIMARY = '\x1b[36m';
const COLOR_DIM = '\x1b[2m';
const STYLE_BOLD = '\x1b[1m';

export function printStartBanner() {
	const line = `${COLOR_PRIMARY}================================${COLOR_RESET}`;
	console.log(line);
	console.log(`${COLOR_PRIMARY}||${COLOR_RESET} ${STYLE_BOLD}AW HTML Builder (Gulp + ESBuild)${COLOR_RESET}`);
	console.log(line);
	console.log(`${COLOR_DIM}Starter HTML build on Gulp + ESBuild.${COLOR_RESET}`);
	console.log('');
	console.log('Main commands:');
	console.log('  npm start      — run dev server with setup wizard');
	console.log('  npm run build  — production build');
	console.log('  npm run help   — CLI help with steps and commands');
	console.log('');
}

export function createInterface() {
	return readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
}

export function selectYesNo(title, question, defaultYes) {
	if (!process.stdin.isTTY) {
		return Promise.resolve(defaultYes);
	}

	readline.emitKeypressEvents(process.stdin);
	const wasRaw = process.stdin.isTTY && process.stdin.isRaw;
	if (process.stdin.isTTY && !wasRaw) {
		process.stdin.setRawMode(true);
	}

	const options = ['Yes', 'No'];
	let index = defaultYes ? 0 : 1;

	function render() {
		process.stdout.write('\x1B[2J\x1B[0f');
		printStartBanner();
		console.log(title);
		console.log('');
		console.log(question);
		console.log('');
		options.forEach((option, i) => {
			const isActive = i === index;
			const prefix = isActive ? `${COLOR_PRIMARY}›${COLOR_RESET} ` : '  ';
			const label = isActive ? `${STYLE_BOLD}[${option}]${COLOR_RESET}` : ` ${option} `;
			console.log(prefix + label);
		});
	}

	return new Promise((resolve) => {
		function cleanup() {
			process.stdin.removeListener('keypress', onKeypress);
			if (process.stdin.isTTY && !wasRaw) {
				process.stdin.setRawMode(false);
			}
		}

		function onKeypress(str, key) {
			if (!key) {
				return;
			}
			if (key.name === 'up' || key.name === 'down' || key.name === 'left' || key.name === 'right') {
				const delta = key.name === 'up' || key.name === 'left' ? -1 : 1;
				index = (index + delta + options.length) % options.length;
				render();
				return;
			}
			if (key.name === 'return' || key.name === 'enter') {
				cleanup();
				resolve(index === 0);
				return;
			}
			if (key.ctrl && key.name === 'c') {
				cleanup();
				process.exit(0);
			}
		}

		process.stdin.on('keypress', onKeypress);
		render();
	});
}

export function ask(rl, question) {
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer);
		});
	});
}

export async function askNumberPx(rl, label, initial) {
	while (true) {
		const suffix = initial ? ` [${initial}]` : '';
		const answer = (await ask(rl, `${label}${suffix}: `)).trim();
		if (!answer && initial) {
			return initial;
		}
		if (!answer) {
			console.log('Enter a value.');
			continue;
		}
		if (!/^\d+$/.test(answer)) {
			console.log('Use digits only, without px.');
			continue;
		}
		return answer;
	}
}