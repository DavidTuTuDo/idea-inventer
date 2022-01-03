import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';

/** author:明悅
 *  create time:Thu Mar 04 2021 00:12:55 GMT+0800 (Taipei Standard Time)
 */

class gener {

}

export {gener as gener}

(async () => {
        await Util.generatePackage(
            '../databazer', true)

        await Util.generatePackage(
            '../linepay', true)

        await Util.generatePackage(
            '../configerer', true)

        await Util.generatePackage(
            '../utiller', true)

    }
)();
