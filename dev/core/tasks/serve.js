import gulp from 'gulp';
import { browserSync } from '../config/server.js';
import { paths } from '../config/paths.js';
import { html } from './html.js';
import { styles } from './styles.js';
import { scripts } from './scripts.js';
import { staticAssets, images, fonts } from './assets.js';

const { watch, series } = gulp;

export function serve() {
	browserSync.init({
		server: {
			baseDir: paths.root
		},
		port: 3000,
		open: true,
		notify: true
	});

	watch(paths.html.watch, series(html, (done) => { browserSync.reload(); done(); }));
	watch(paths.styles.watch, styles);
	watch(paths.scripts.watch, series(scripts, (done) => { browserSync.reload(); done(); }));
	watch(paths.static.src, series(staticAssets, (done) => { browserSync.reload(); done(); }));
	watch(paths.images.src, series(images, (done) => { browserSync.reload(); done(); }));
	watch(paths.fonts.src, series(fonts, (done) => { browserSync.reload(); done(); }));
}
