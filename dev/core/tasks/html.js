import gulp from 'gulp';
import plumber from 'gulp-plumber';
import fileInclude from 'gulp-file-include';
import {paths} from '../config/paths.js';
import {createErrorHandler} from '../config/utils.js';
import {browserSync} from '../config/server.js';

const {src, dest} = gulp;

export function html() {
	return src(paths.html.src)
		.pipe(plumber({errorHandler: createErrorHandler('HTML')}))
		.pipe(
			fileInclude({
				prefix: '@@',
				basepath: 'dev/src/html',
				indent: true
			})
		)
		.pipe(dest(paths.html.dest))
		.pipe(browserSync.stream());
}
