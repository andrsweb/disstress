import gulp from 'gulp';
import fg from 'fast-glob';
import {w3cHtmlValidator} from 'w3c-html-validator';
import gulpStylelint from 'gulp-stylelint-esm';
import {paths} from '../config/paths.js';

const {src} = gulp;

function stylelintSummaryFormatter(results) {
	let messagesCount = 0;
	let hasErrors = false;

	for (const result of results) {
		const warnings = Array.isArray(result.warnings) ? result.warnings : [];
		messagesCount += warnings.length;
		if (warnings.some((warning) => warning.severity === 'error')) {
			hasErrors = true;
		}
	}

	const status = hasErrors ? 'fail' : 'pass';
	return `SCSS validation: ${status} (messages: ${messagesCount})`;
}

function createStylelintOptions(failAfterError) {
	return {
		failAfterError,
		reporters: [
			{
				formatter: 'string',
				console: true
			},
			{
				formatter: stylelintSummaryFormatter,
				console: true
			}
		]
	};
}

async function runHtmlValidation(failAfterError) {
	const files = await fg(`${paths.root}/**/*.html`);

	if (!files.length) {
		return;
	}

	let hasErrors = false;

	for (const filename of files) {
		const results = await w3cHtmlValidator.validate({
			filename,
			output: 'json'
		});

		if (!results.validates) {
			hasErrors = true;
		}

		w3cHtmlValidator.reporter(results, {
			title: filename
		});
	}

	if (failAfterError && hasErrors) {
		throw new Error('HTML validation failed');
	}
}

export async function validateHtml() {
	await runHtmlValidation(true);
}

export async function lintHtmlDev() {
	await runHtmlValidation(false);
}

export function validateStyles() {
	return src(['dev/src/**/*.scss'], {allowEmpty: true}).pipe(
		gulpStylelint(createStylelintOptions(true))
	);
}

export function lintStylesDev() {
	return src(['dev/src/**/*.scss'], {allowEmpty: true}).pipe(
		gulpStylelint(createStylelintOptions(false))
	);
}

export async function validate() {
	const errors = [];

	try {
		await validateHtml();
	} catch (error) {
		errors.push(error);
	}

	try {
		await new Promise((resolve, reject) => {
			const stream = validateStyles();
			stream.on('end', resolve);
			stream.on('error', reject);
		});
	} catch (error) {
		errors.push(error);
	}

	if (errors.length) {
		throw new Error('Validation failed');
	}
}
