import {selectYesNo, ask} from './io.js';
import {prepareGoogleFont, applyGoogleFontLocal, applyGoogleFontCdn} from '../fonts/googleFonts.js';
import {updateFontFamilyVariable, updateFontWeightVariables} from '../fonts/textVars.js';

async function askFontWeights(rl, min, max) {
	const defaultValue = '400,700';

	while (true) {
		const answerRaw = (await ask(
			rl,
			`Enter font weights separated by comma (from ${min} to ${max}, e.g. 400,700) [${defaultValue}]: `
		)).trim();

		const answer = answerRaw || defaultValue;
		const parts = answer.split(',').map((value) => value.trim()).filter((value) => value.length > 0);

		if (!parts.length) {
			console.log('You must enter at least one weight.');
			continue;
		}

		const weights = [];
		let valid = true;

		for (const part of parts) {
			if (!/^\d+$/.test(part)) {
				console.log(`"${part}" is not a number.`);
				valid = false;
				break;
			}

			const value = Number(part);
			if (value < min || value > max) {
				console.log(`Weight ${value} is outside the allowed range ${min}-${max}.`);
				valid = false;
				break;
			}

			if (value % 100 !== 0) {
				console.log('Use weights that are multiples of 100 (100, 200, ..., 900).');
				valid = false;
				break;
			}

			if (!weights.includes(value)) {
				weights.push(value);
			}
		}

		if (!valid) {
			continue;
		}

		weights.sort((a, b) => a - b);
		return weights;
	}
}

export async function configureFonts(rl) {
	const configure = await selectYesNo('Step 3: Fonts', 'Configure fonts now?', true);

	if (!configure) {
		await updateFontWeightVariables([400, 700]);
		console.log('');
		console.log('Step "Fonts" was skipped. _text.scss uses default weights 400 and 700.\n');
		return;
	}

	const useLocal = await selectYesNo(
		'Step 3: Fonts',
		'How to connect fonts? Yes — download locally, No — use Google CDN.',
		true
	);

	console.log('');
	console.log('Step 3: Fonts');
	console.log('--------------');

	const allWeights = new Set();

	while (true) {
		const addFont = await selectYesNo(
			'Step 3: Fonts',
			'Add another font? Yes — add, No — continue.',
			true
		);

		if (!addFont) {
			break;
		}

		console.log('');
		console.log('New font');
		console.log('-----------');

		let variableName;
		while (true) {
			const raw = (await ask(
				rl,
				'SCSS variable name for font-family (without $), e.g. ff, ff-title: '
			)).trim();

			if (!raw) {
				console.log('Variable name cannot be empty.');
				continue;
			}

			if (!/^[a-zA-Z0-9-]+$/.test(raw)) {
				console.log('Use only latin letters, digits and dash.');
				continue;
			}

			variableName = raw;
			break;
		}

		const cssUrl = (await ask(
			rl,
			'Paste Google Fonts CSS URL (the string from @import): '
		)).trim();

		if (!cssUrl) {
			console.log('URL cannot be empty, font will be skipped.');
			continue;
		}

		let prepared;

		try {
			console.log('Loading Google Fonts CSS...');
			prepared = await prepareGoogleFont(cssUrl);
		} catch (error) {
			console.log('Failed to load or parse Google Fonts CSS.');
			console.log(String(error));
			continue;
		}

		const family = prepared.family;
		const styles = prepared.styles.join(', ');
		const min = prepared.weightRange.min;
		const max = prepared.weightRange.max;

		console.log('');
		console.log(`Font found: ${family}`);
		console.log(`Available styles: ${styles}`);
		console.log(`Available weight range (normal): ${min}-${max}`);

		const weights = await askFontWeights(rl, min, max);
		weights.forEach((value) => allWeights.add(value));

		const fontValue = `'${family}', sans-serif`;

		try {
			await updateFontFamilyVariable(variableName, fontValue);
			console.log(`Variable $${variableName} in _text.scss was updated with ${fontValue}.`);
		} catch (error) {
			console.log('Failed to update _text.scss for font-family.');
			console.log(String(error));
		}

		const hasItalic = prepared.styles.includes('italic');
		let includeItalic = false;

		if (hasItalic) {
			includeItalic = await selectYesNo(
				'Step 3: Fonts',
				'This font has italic. Download / connect italic for the same weights?',
				false
			);
		}

		try {
			if (useLocal) {
				console.log('Mode: local font download (normal style).');
				await applyGoogleFontLocal(prepared, weights, 'normal');

				if (includeItalic) {
					console.log('Also processing italic style.');
					await applyGoogleFontLocal(prepared, weights, 'italic');
				}
			} else {
				console.log('Mode: using Google Fonts CDN (normal style).');
				await applyGoogleFontCdn(prepared, weights, 'normal');

				if (includeItalic) {
					console.log('Also connecting italic style from CDN.');
					await applyGoogleFontCdn(prepared, weights, 'italic');
				}
			}
		} catch (error) {
			console.log('Failed to apply font.');
			console.log(String(error));
		}

		console.log('');
		console.log('Font has been processed.');
	}

	const finalWeights = Array.from(allWeights);

	if (!finalWeights.length) {
		await updateFontWeightVariables([400, 700]);
		console.log('');
		console.log('No fonts were added. _text.scss uses default weights 400 and 700.\n');
		return;
	}

	try {
		await updateFontWeightVariables(finalWeights);
		console.log('');
		console.log('In _text.scss the variables $fw-XXX were updated for the selected weights.\n');
	} catch (error) {
		console.log('Failed to update weight variables in _text.scss.');
		console.log(String(error));
	}
}
