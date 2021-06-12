import Remote from './remote';
import {databaser} from "../../../databaser";
import {utiller as Util} from "utiller";

(async () => {
    const db = new databaser(`/Users/davidtu/cross-achieve/mimi/idea-inventer/databaser/secret_infos_latest.db`);
    await db.init();
    const qs = await db.fetchRecords('CHOOSER');
    const remote = new Remote();
    // for (const q of qs) {
    //     /** 把`a...b...c..` 換成 ['a...','b...','c....']*/
    //     const choiceStringArray = q.choice.split(new RegExp(`\\([A-D]\\)`, `g`));
    //     choiceStringArray.shift();
    //      q.choices = choiceStringArray.map((stmt) => {
    //             return {statement: Util.getNormalizedStringNotEndWith(stmt, ',', ' ')}
    //         }
    //     )
    //     await remote.pushQuestions(q);
    // }
    // console.log(await remote.fetchQuestions());
    // console.log(await remote.deleteQuestions());
    await remote.setUserInfo('0349', {name: 'david', from: 'kh'})
})();
