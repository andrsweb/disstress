import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

export const isProd = Boolean(argv.prod);
export const isWP = Boolean(argv.wp);
export const skipLint = Object.prototype.hasOwnProperty.call(argv, 'lint') && argv.lint === false;
