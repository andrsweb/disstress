import gulp from 'gulp';
import {browserSync} from '../config/server.js';
import {paths} from '../config/paths.js';
import {html} from './html.js';
import {styles} from './styles.js';
import {scripts} from './scripts.js';
import {staticAssets, images, fonts} from './assets.js';

const {watch, series} = gulp;

export function serve() {
	browserSync.init({
		server: {
			baseDir: paths.root
		},
		port: 3000,
		open: true,
		notify: true
	});

	watch(paths.html.watch, html);
	watch(paths.styles.watch, styles);
	watch(paths.scripts.watch, scripts);
	watch(paths.static.src, staticAssets);
	watch(paths.images.src, images);
	watch(paths.fonts.src, fonts);
}
