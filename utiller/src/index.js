import ERROR from './exceptioner';
import pooller from './pooller';
import {configerer} from "configerer";


let instance = undefined;
if (configerer.IS_NODE_ENV) {
    const self = require('./utiller/nodeutiller');
    instance = new self.default();
} else {
    const self = require('./utiller/index');
    instance = new self.default();
}

export {instance as utiller, ERROR as exceptioner, pooller as pooller};

