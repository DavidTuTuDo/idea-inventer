import {configer} from "configer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';
import {databaser} from "../../databaser";
import {firebaser} from "../../firebaser";

/** author:明悅
 *  create time:Tue Mar 09 2021 14:31:57 GMT+0800 (Taipei Standard Time)
 */

class question_update {

}

export {question_update as question_update}

(async () => {
        const db = new databaser(`/Users/davidtu/cross-achieve/mimi/idea-inventer/databaser/secret_infos_latest.db`);
        await db.init();

        const fire = new firebaser(Util.getAdminCredential());
        await fire.deleteTable(configer.REFERENCE_QUESTION);
        const qs = await db.fetchRecords('CHOOSER');
        for (const q of qs) {
            Util.appendInfo(`${JSON.stringify(q)} is uploading`);
            await fire.setQuestion(q);
            Util.appendInfo(`${JSON.stringify(q)} is succeed`);
            await Util.syncDelay(50);
        }
        Util.appendInfo(`\n\n question_update is succeed`);

    }
)();
