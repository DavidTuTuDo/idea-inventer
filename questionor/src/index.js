import {configer} from "configer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';
import {BuildApplication} from '../../free_marker'

/** author:明悅
 *  create time:Thu Aug 12 2021 22:51:32 GMT+0800 (Taipei Standard Time)
 */

(async () => {
        const builder = new BuildApplication({genRootPath:'../gen',projectRootPath:'./project',freeMarkerRootPath:'../'});
        await builder.buildWeb();
    }
)();
