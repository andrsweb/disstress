import gulp from 'gulp';
import plumber from 'gulp-plumber';
import * as dartSass from 'sass';
import gulpSassFactory from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import rename from 'gulp-rename';
import {stylesIndex} from './styles-index.js';
import {paths} from '../config/paths.js';
import {isProd} from '../config/env.js';
import {createErrorHandler} from '../config/utils.js';
import {browserSync} from '../config/server.js';

const {src, dest, series} = gulp;
const gulpSass = gulpSassFactory(dartSass);

function stylesCompile() {
	const plugins = [autoprefixer()];
	if (isProd) {
		plugins.push(cssnano());
	}
	return src(paths.styles.src, {sourcemaps: !isProd})
		.pipe(plumber({errorHandler: createErrorHandler('SCSS')}))
		.pipe(
			gulpSass(
				{
					includePaths: ['node_modules', 'dev/src/scss', 'dev/src/html']
				},
				undefined
			)
		)
		.pipe(
			rename({
				suffix: '.min'
			})
		)
		.pipe(postcss(plugins))
		.pipe(dest(paths.styles.dest, {sourcemaps: '.'}))
		.pipe(browserSync.stream());
}

export const styles = series(stylesIndex, stylesCompile);
