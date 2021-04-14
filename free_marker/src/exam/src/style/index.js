import {isMobile} from 'react-device-detect'

let instance;
if (isMobile) {
    instance = require('./mobile.style.js')
} else {
    instance = require('./app.style.js')
}

export default instance.default
