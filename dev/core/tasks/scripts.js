import gulp from 'gulp';
import plumber from 'gulp-plumber';
import gulpEsbuild from 'gulp-esbuild';
import path from 'path';
import {Transform} from 'stream';
import javascriptObfuscator from 'javascript-obfuscator';
import {paths} from '../config/paths.js';
import {isProd} from '../config/env.js';
import {createErrorHandler} from '../config/utils.js';
import {browserSync} from '../config/server.js';

const {src, dest} = gulp;

function createObfuscateStream() {
	const options = {
		compact: true,
		controlFlowFlattening: true,
		controlFlowFlatteningThreshold: 0.75,
		deadCodeInjection: false,
		stringArray: true,
		stringArrayThreshold: 0.75,
		shuffleStringArray: true,
		rotateStringArray: true,
		target: 'browser'
	};

	return new Transform({
		objectMode: true,
		transform(file, _encoding, callback) {
			if (path.extname(file.path) !== '.js') {
				return callback(null, file);
			}
			if (file.isBuffer()) {
				try {
					const code = file.contents.toString('utf8');
					const result = javascriptObfuscator.obfuscate(code, options);
					file.contents = Buffer.from(result.getObfuscatedCode(), 'utf8');
				} catch (error) {
					console.error('JS obfuscation error:', error);
				}
			}

			callback(null, file);
		}
	});
}

export function scripts() {
	let stream = src(paths.scripts.src, {allowEmpty: true})
		.pipe(plumber({errorHandler: createErrorHandler('JS')}))
		.pipe(
			gulpEsbuild({
				outfile: 'main.min.js',
				bundle: true,
				sourcemap: !isProd,
				minify: isProd,
				target: ['es2017'],
				platform: 'browser',
				format: 'iife',
				alias: {
					'@': path.resolve('dev/src/js')
				}
			})
		);

	if (isProd) {
		stream = stream.pipe(createObfuscateStream());
	}

	return stream.pipe(dest(paths.scripts.dest)).pipe(browserSync.stream());
}
