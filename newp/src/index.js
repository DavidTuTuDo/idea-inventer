import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import libpath from 'path';


/** author:明悅
 *  create time:Thu Mar 04 2021 13:50:11 GMT+0800 (Taipei Standard Time)
 */

class newp {

    async createPackageInTerminal(path = './') {
        const result = await Util.getAnswerFromPromptQ();
        Util.appendInfo(result)
        if (!_.isEmpty(result.name)) {
            Util.appendInfo(`${result.name} is generating`)
            await Util.packageTemplatify(path, result.name);
        } else {
            throw new ERROR(8005, `package name is ==> ''${result.name}`);
        }
    }

}

(async () => {
    await new newp().createPackageInTerminal('../');
})();

export {newp as newp}


