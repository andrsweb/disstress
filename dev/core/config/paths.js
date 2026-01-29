import {isWP} from "./env.js";

export const paths = {
	root: 'assets',
	html: {
		src: 'dev/src/html/pages/**/*.html',
		watch: 'dev/src/html/**/*.html',
		dest: 'assets'
	},
	styles: {
		src: 'dev/src/scss/main.scss',
		watch: [
			'dev/src/scss/**/*.scss',
			'!dev/src/scss/generated/**/*.scss',
			'dev/src/html/**/*.scss'
		],
		dest: isWP ? '../assets/css' : 'assets/css'
	},
	scripts: {
		src: 'dev/src/js/main.js',
		watch: [
			'dev/src/js/**/*.js',
			'dev/src/html/**/*.js'
		],
		dest: isWP ? '../assets/js' : 'assets/js'
	},
	static: {
		src: 'dev/public/**/*',
		dest: 'assets'
	},
	images: {
		src: 'dev/src/img/**/*.{png,jpg,jpeg,svg,gif,webp,ico}',
		dest: isWP ? '../assets/img' : 'assets/img'
	},
	fonts: {
		src: 'dev/src/fonts/**/*',
		dest: isWP ? '../assets/fonts' : 'assets/fonts'
	}
};
