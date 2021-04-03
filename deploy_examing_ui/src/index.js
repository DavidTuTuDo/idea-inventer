import {configer} from "configer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';

/** author:明悅
 *  create time:Thu Mar 11 2021 16:49:49 GMT+0800 (Taipei Standard Time)
 */

class deploy_examing_ui {

}

export {deploy_examing_ui as deploy_examing_ui}

const destDir = '/Users/davidtu/cross-achieve/mimi/mimi-question/public';
(async () => {

        await Util.executeCommandLine(`cd ${libpath.resolve('../examing-ui')} && npm run build`);
        await Util.deleteChildByPath(destDir, true);
        await Util.copyFromFolderToDestFolder(
            '/Users/davidtu/cross-achieve/mimi/idea-inventer/examing-ui/dist',
            destDir,
            true,
            true,
            (path) => {
                Util.appendInfo(`${path} 複製到 ${destDir}`);
                return true;
            }
        )
        await Util.executeCommandLine(`cd ${Util.getFolderPathOfSpecificPath(destDir)} && firebase deploy`);

    }
)();
