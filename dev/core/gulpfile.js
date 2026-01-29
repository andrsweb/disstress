import gulp from 'gulp';
import {deleteAsync} from 'del';
import {html} from './tasks/html.js';
import {styles} from './tasks/styles.js';
import {scripts} from './tasks/scripts.js';
import {assets} from './tasks/assets.js';
import {serve} from './tasks/serve.js';
import {validate} from './tasks/validate.js';
import {paths} from './config/paths.js';
import {skipLint} from './config/env.js';

const {series, parallel} = gulp;

function clean() {
	return deleteAsync([paths.root]);
}

const buildTasks = parallel(html, styles, scripts, assets);

export {clean, html, styles, scripts, assets, validate};
export const dev = series(clean, buildTasks, serve);
export const build = skipLint ? series(clean, buildTasks) : series(clean, buildTasks, validate);
export default dev;
