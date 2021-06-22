import Api from './api';
import {databaser} from "databaser";
import {utiller as Util,pooller as InfinitePool} from "utiller";
import _ from 'lodash';
import Listener from './listener'
import firebase from "./base/Firebaser";

(async () => {
    const db = new databaser(`/Users/davidtu/cross-achieve/mimi/idea-inventer/databaser/secret_infos_latest.db`);
    await db.init();
    const qs = await db.fetchRecords('CHOOSER');
    const remote = new Api();
    const listener = new Listener();

    const questions = qs.map((q) => {
        /** 把`a...b...c..` 換成 ['a...','b...','c....']*/
        const choiceStringArray = q.choice.split(new RegExp(`\\([A-D]\\)`, `g`));
        choiceStringArray.shift();
        q.choices = choiceStringArray.map((stmt) => {
                return {statement: Util.getNormalizedStringNotEndWith(stmt, ',', ' ')}
            }
        )
        delete q.uid;
        return q;
    })

    await remote.deleteQuestions();
    await remote.submitQuestions(...questions);
    // await remote.submitExamObject({david:'dd'});
    // await remote.deleteExam();
    // console.log(await remote.fetchSizeOfQuestions());
    // console.log(await remote.fetchExam());
    // const unsubscribe = remote.listenToQuestion();
    // const unsubscribe =
    //     listener.listenQuestionItem(`me4bYipBdZgoXDVVEo3i`, (result) => {
    //     console.log(result);
    // })
    //
    // await Util.syncDelay(60 * 5 * 1000); //監聽五分鐘
    // unsubscribe();


    /** transaction sample */
    // await firebase.firestore().collection('tests').doc('first').set({index: 1});
    // const asyncTasks = _.range(20).map(() => {
    //     return async () => {
    //         await firebase.firestore().runTransaction(async(transaction) => {
    //             const ref = firebase.firestore().collection('tests').doc('first');
    //             const result = await transaction.get(ref);
    //             const newbie = result.data().index + 1;
    //             await transaction.update(ref,{index : newbie});
    //         })
    //     }
    // });
    //
    // const pool = new InfinitePool(5)
    // await pool.runByEachTask(asyncTasks);

})();
