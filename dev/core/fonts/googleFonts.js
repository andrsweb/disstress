import https from 'https';
import fs from 'fs/promises';
import path from 'path';
import ttf2woff2 from 'ttf2woff2';

function requestWithRedirects(url, maxRedirects, handleResponse, buildErrorMessage) {
	return new Promise((resolve, reject) => {
		function request(currentUrl, redirectCount) {
			if (redirectCount > maxRedirects) {
				reject(new Error(buildErrorMessage('too many redirects')));
				return;
			}

			https
				.get(currentUrl, (res) => {
					const statusCode = res.statusCode;
					if (
						statusCode &&
						statusCode >= 300 &&
						statusCode < 400 &&
						res.headers.location
					) {
						const location = res.headers.location.startsWith('http')
							? res.headers.location
							: new URL(res.headers.location, currentUrl).toString();
						request(location, redirectCount + 1);
						return;
					}

					if (!statusCode || statusCode < 200 || statusCode >= 300) {
						reject(
							new Error(buildErrorMessage(`HTTP status ${statusCode ?? 'unknown'}`))
						);
						return;
					}

					handleResponse(res, resolve, reject);
				})
				.on('error', (error) => {
					reject(error);
				});
		}

		request(url, 0);
	});
}

function fetchCss(url) {
	return requestWithRedirects(
		url,
		5,
		(res, resolve) => {
			let data = '';
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => resolve(data));
		},
		(detail) => `Failed to load Google Fonts CSS: ${detail}`
	);
}

function downloadBinary(url) {
	return requestWithRedirects(
		url,
		5,
		(res, resolve) => {
			const chunks = [];
			res.on('data', (chunk) => {
				chunks.push(chunk);
			});
			res.on('end', () => {
				resolve(Buffer.concat(chunks));
			});
		},
		(detail) => `Failed to download font file: ${detail}`
	);
}

function parseGoogleFontsCss(css) {
	const faces = [];
	const faceRegex = /@font-face\s*{([^}]+)}/g;
	let match;

	while ((match = faceRegex.exec(css)) !== null) {
		const block = match[1];

		const familyMatch = block.match(/font-family:\s*["']([^"']+)["']/);
		const styleMatch = block.match(/font-style:\s*(normal|italic)/);
		const weightRangeMatch = block.match(/font-weight:\s*(\d+)\s+(\d+)/);
		const weightSingleMatch = block.match(/font-weight:\s*(\d+)/);
		const srcMatch = block.match(/src:\s*([^;]+);/);

		if (!familyMatch || !styleMatch || !srcMatch) {
			continue;
		}

		const srcPart = srcMatch[1];
		const urlMatch = srcPart.match(/url\(([^)]+)\)\s*format\('([^']+)'\)/);
		if (!urlMatch) {
			continue;
		}

		const rawUrl = urlMatch[1].trim().replace(/^['"]|['"]$/g, '');
		const format = urlMatch[2];

		let weightMin;
		let weightMax;

		if (weightRangeMatch) {
			weightMin = Number(weightRangeMatch[1]);
			weightMax = Number(weightRangeMatch[2]);
		} else if (weightSingleMatch) {
			const value = Number(weightSingleMatch[1]);
			weightMin = value;
			weightMax = value;
		} else {
			weightMin = 400;
			weightMax = 400;
		}

		faces.push({
			family: familyMatch[1],
			style: styleMatch[1],
			weightMin,
			weightMax,
			srcUrl: rawUrl,
			format
		});
	}

	if (!faces.length) {
		throw new Error('Failed to find @font-face in Google Fonts CSS');
	}

	const family = faces[0].family;
	const stylesSet = new Set();
	let minWeightNormal = Infinity;
	let maxWeightNormal = -Infinity;

	faces.forEach((face) => {
		stylesSet.add(face.style);
		if (face.style === 'normal') {
			if (face.weightMin < minWeightNormal) {
				minWeightNormal = face.weightMin;
			}
			if (face.weightMax > maxWeightNormal) {
				maxWeightNormal = face.weightMax;
			}
		}
	});

	if (!Number.isFinite(minWeightNormal) || !Number.isFinite(maxWeightNormal)) {
		minWeightNormal = 400;
		maxWeightNormal = 700;
	}

	return {
		family,
		styles: Array.from(stylesSet),
		weightRange: {
			min: minWeightNormal,
			max: maxWeightNormal
		},
		faces
	};
}

function sanitizeFamilyName(name) {
	return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '') || 'font';
}

function formatFontFamilyName(family) {
	if (/^[a-zA-Z0-9-]+$/.test(family)) {
		return family;
	}

	return `'${family.replace(/'/g, "\\'")}'`;
}

async function ensureDir(dir) {
	await fs.mkdir(dir, {recursive: true});
}

function resolveFaceForWeight(parsed, weight, style) {
	const faces = parsed.faces;
	const primaryList = style
		? faces.filter((face) => face.style === style)
		: faces.filter((face) => face.style === 'normal');
	const fallbackList = style ? [] : faces;

	function findIn(list) {
		for (const face of list) {
			if (weight >= face.weightMin && weight <= face.weightMax) {
				return face;
			}
		}
		return null;
	}

	const primary = findIn(primaryList);
	if (primary) {
		return primary;
	}

	return findIn(fallbackList);
}

function buildFontFaceBlocks(family, entries) {
	const fontFamily = formatFontFamilyName(family);
	return entries
		.map((entry) => {
			return [
				`@font-face {`,
				`  font-family: ${fontFamily};`,
				`  src: url('${entry.src}') format('${entry.format || 'woff2'}');`,
				`  font-weight: ${entry.weight};`,
				`  font-style: ${entry.style};`,
				`  font-display: swap;`,
				`}`
			].join('\n');
		})
		.join('\n\n');
}

async function appendToFontsScss(blocks) {
	const filePath = path.resolve('dev/src/scss/common/fonts.scss');
	let content;

	try {
		content = await fs.readFile(filePath, 'utf8');
	} catch (e) {
		content = '';
	}

	if (content && !content.endsWith('\n')) {
		content += '\n';
	}

	content += blocks;
	if (!content.endsWith('\n')) {
		content += '\n';
	}

	await fs.writeFile(filePath, content);
}

export async function prepareGoogleFont(cssUrl) {
	const css = await fetchCss(cssUrl);
	const parsed = parseGoogleFontsCss(css);
	return {
		css,
		family: parsed.family,
		styles: parsed.styles,
		weightRange: parsed.weightRange,
		faces: parsed.faces
	};
}

export async function applyGoogleFontLocal(prepared, weights, style = 'normal') {
	const family = prepared.family;
	const familyDirName = sanitizeFamilyName(family);
	const baseDir = path.resolve('dev/src/fonts', familyDirName);
	const urlToLocal = new Map();
	const entries = [];

	await ensureDir(baseDir);

	for (const weight of weights) {
		const face = resolveFaceForWeight(prepared, weight, style);
		if (!face || !face.srcUrl) {
			console.log(`  [${family}] Skipping weight ${weight}, no matching font source found.`);
			continue;
		}

		const srcUrl = face.srcUrl;
		let localInfo = urlToLocal.get(srcUrl);

		if (!localInfo) {
			const styleSuffix = face.style === 'normal' ? '' : `-${face.style}`;
			const filename = `${familyDirName}-${weight}${styleSuffix}.woff2`;
			const targetPath = path.join(baseDir, filename);

			try {
				await fs.access(targetPath);
				console.log(`  [${family}] File already exists: fonts/${familyDirName}/${filename}`);
			} catch (e) {
				console.log(`  [${family}] Downloading ${weight} ${face.style} → fonts/${familyDirName}/${filename} ...`);

				let input;
				try {
					input = await downloadBinary(srcUrl);
				} catch (error) {
					console.log(`  [${family}] Failed to download font file: ${srcUrl}`);
					console.log(String(error));
					continue;
				}

				let output = input;

				if (face.format !== 'woff2') {
					try {
						output = ttf2woff2(input);
					} catch (error) {
						console.log(`  [${family}] Failed to convert to WOFF2, skipping weight ${weight}.`);
						console.log(String(error));
						continue;
					}
				}

				try {
					await fs.writeFile(targetPath, output);
					console.log(`  [${family}] Done: fonts/${familyDirName}/${filename}`);
				} catch (error) {
					console.log(`  [${family}] Failed to save font file: fonts/${familyDirName}/${filename}`);
					console.log(String(error));
					continue;
				}

				localInfo = {
					relPath: `/fonts/${familyDirName}/${filename}`,
					format: 'woff2'
				};
			}

			urlToLocal.set(srcUrl, localInfo);
		}

		entries.push({
			weight,
			style: face.style,
			src: localInfo.relPath,
			format: localInfo.format
		});
	}

	if (!entries.length) {
		console.log(`  [${family}] Failed to prepare any font weights.`);
		return;
	}

	const blocks = buildFontFaceBlocks(family, entries);
	await appendToFontsScss(blocks);
}

export async function applyGoogleFontCdn(prepared, weights, style = 'normal') {
	const family = prepared.family;
	const entries = [];

	for (const weight of weights) {
		const face = resolveFaceForWeight(prepared, weight, style);
		if (!face || !face.srcUrl) {
			console.log(`  [${family}] Skipping weight ${weight}, no matching font source found.`);
			continue;
		}

		console.log(`  [${family}] Attaching weight ${weight} ${face.style} from CDN.`);

		entries.push({
			weight,
			style: face.style,
			src: face.srcUrl,
			format: face.format
		});
	}

	if (!entries.length) {
		console.log(`  [${family}] Failed to prepare any font weights.`);
		return;
	}

	const blocks = buildFontFaceBlocks(family, entries);
	await appendToFontsScss(blocks);
}