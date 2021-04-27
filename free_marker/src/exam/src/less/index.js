import {isMobile} from 'react-device-detect'
import('./common.css');

if(isMobile) {
    import('./mobile.css');
} else {
    import('./app.css');
}
