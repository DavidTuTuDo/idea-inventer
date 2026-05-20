import ERROR from './exceptioner';
import pooller from './pooller';
import spider from './spider';

let instance = undefined;

if (
    typeof process !== 'undefined' &&
    typeof process.version === 'string' &&
    process.version.trim().length > 0
) {
    const self = require('./utiller/nodeutiller');
    instance = new self.default();
} else {
    const self = require('./utiller/index');
    instance = new self.default();
}

export {instance as utiller, ERROR as exceptioner, pooller as pooller, spider as spider};
