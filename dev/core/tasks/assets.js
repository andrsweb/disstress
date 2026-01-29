import gulp from 'gulp';
import {paths} from '../config/paths.js';
import {ensureDir} from '../config/utils.js';

const {src, dest, parallel} = gulp;

export function staticAssets() {
	const staticRootDir = paths.static.src.replace('/**/*', '');
	if (staticRootDir) {
		ensureDir(staticRootDir);
	}
	
	return src(paths.static.src, {
		allowEmpty: true,
		encoding: false,
		buffer: true,
		objectMode: false
	})
	.pipe(dest(paths.static.dest));
}

export function images() {
	ensureDir('dev/src/img');
	
	return src(paths.images.src, {
		allowEmpty: true,
		encoding: false,
		buffer: true,
		objectMode: false
	})
	.pipe(dest(paths.images.dest));
}

export function fonts() {
	ensureDir('dev/src/fonts');
	
	return src(paths.fonts.src, {
		allowEmpty: true,
		encoding: false,
		buffer: true,
		objectMode: false
	})
	.pipe(dest(paths.fonts.dest));
}

export const assets = parallel(staticAssets, images, fonts);
