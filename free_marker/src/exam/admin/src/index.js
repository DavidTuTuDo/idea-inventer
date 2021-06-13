import Remote from './remote';
import {databaser} from "databaser";
import {utiller as Util} from "utiller";
import _ from 'lodash';

(async () => {
    const db = new databaser(`/Users/davidtu/cross-achieve/mimi/idea-inventer/databaser/secret_infos_latest.db`);
    await db.init();
    const qs = await db.fetchRecords('CHOOSER');
    const remote = new Remote();

    // const questions = qs.map((q) => {
    //     /** 把`a...b...c..` 換成 ['a...','b...','c....']*/
    //     const choiceStringArray = q.choice.split(new RegExp(`\\([A-D]\\)`, `g`));
    //     choiceStringArray.shift();
    //     q.choices = choiceStringArray.map((stmt) => {
    //             return {statement: Util.getNormalizedStringNotEndWith(stmt, ',', ' ')}
    //         }
    //     )
    //     delete q.uid;
    //     return q;
    // })

    // await remote.deleteQuestions();
    // await remote.batchSubmitQuestionsItem(...questions);
    // await remote.submitExamObject({david:'dd'});
    // await remote.deleteExam();
})();
