import {configer} from "configer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';
import prompt from 'prompt'


/** author:明悅
 *  create time:Thu Mar 04 2021 13:50:11 GMT+0800 (Taipei Standard Time)
 */

class newp {


}

export {newp as newp}

if (configer.DEBUG_MODE) {
    (async () => {
        await Util.createPackage('../');
    })();

}
