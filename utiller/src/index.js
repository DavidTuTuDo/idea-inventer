import ERROR from './exceptioner';
import pooller from './pooller';
import spider from './spider';
import _ from 'lodash';

let instance = undefined;
if (process !== undefined && !_.isUndefined(process.version) && !_.isEmpty(process.version)) {
    const self = require('./utiller/nodeutiller');
    instance = new self.default();
} else {
    const self = require('./utiller/index');
    instance = new self.default();
}

export {instance as utiller, ERROR as exceptioner, pooller as pooller, spider as spider};

