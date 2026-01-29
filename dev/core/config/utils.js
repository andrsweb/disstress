import notify from 'gulp-notify';
import fs from 'fs';

export function createErrorHandler(taskName) {
	return function handleError(err) {
		const parts = [];
		if (err.file) {
			const location = [err.line, err.column].filter(Boolean).join(':');
			const filePath = location ? `${err.file}:${location}` : err.file;
			parts.push(filePath);
		}
		if (err.message) {
			parts.push(err.message.toString());
		}
		const message = parts.join('\n');
		notify.onError({
			title: taskName,
			message,
			sound: false
		})(err);
		this.emit('end');
	};
}

export function ensureDir(dirPath) {
	fs.mkdirSync(dirPath, {recursive: true});
}
