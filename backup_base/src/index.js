import {configer} from "configer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';

/** author:明悅
 *  create time:Sat Apr 10 2021 14:33:10 GMT+0800 (Taipei Standard Time)
 */

class backup_base {


}

export { backup_base as backup_base }

if (configer.DEBUG_MODE) {
(async () => {
        Util.copyFromFolderToDestFolder(
            `../gen/src/base`,
            `../free_marker/base`
        )
    }
)();
}
