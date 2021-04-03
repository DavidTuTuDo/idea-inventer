import ERROR from './exceptioner';
import pooller from './pooller';
import {configer} from 'configer';


let instance = undefined;
if (configer.IS_NODE_ENV) {
    const self = require('./utiller/nodeutiller');
    instance = new self.default();
} else {
    const self = require('./utiller/index');
    instance = new self.default();
}

export {instance as utiller, ERROR as exceptioner, pooller as pooller};

