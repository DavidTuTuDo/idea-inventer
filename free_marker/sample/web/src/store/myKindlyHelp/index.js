import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseMyKindlyHelpStore from "./BaseMyKindlyHelpStore";
import WhoknowzAnswerStore from '../whoknowzAnswer';
import UserInfo from '../../userInfo';
import ExamQuestionStore from "../examQuestion";

class MyKindlyHelpStore extends BaseMyKindlyHelpStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/
    myAnswers = [];

    getOrderByStmts() {
        return [{orderBy: (stmt) => stmt.orderBy('updateTime', 'desc')}];
    }

    async fetch(view) {
        const answers = await (new WhoknowzAnswerStore()).fetchAnswers(this.getComponent(),
            ...this.getOrderByStmts());
        await this.answerAdapter(answers)
    }

    answerAdapter = async (answers, isNext = false) => {
        this.myAnswers.push(...answers);
        const questionIds = answers.map((each) => each.qid);
        const questions = await (new ExamQuestionStore()).fetchQuestions(this.getComponent(), ...this.getInArrayConditions(questionIds));

        function getQuestion(qid) {
            return _.find(questions, (question) => _.isEqual(question.id, qid));
        }

        const items = answers.map((each) => {
            const question = getQuestion(each.qid);
            return {
                questionTopic: question.topic.name,
                replyTime: Util.getChineseTimeFormat(this.normalizeTimestamp(each.updateTime)),
                subjectInfo: `${question.year}-${question.subject}`
            }
        })

        if (isNext) {
            this.pushAnswers(...items)
        } else {
            this.setAnswers(...items)
        }
    }

    onBottomTouched = async () => {
        const answers = await (new WhoknowzAnswerStore()).fetchNextAnswers(this.getComponent(),
            _.last(this.myAnswers), ...this.getOrderByStmts());

        if (answers.length < WhoknowzAnswerStore.sizeOfPerPage) {
            this.setHasPageItems(false);
        }

        await this.answerAdapter(answers, true);
    }

    /** -------------------- async api -------------------- **/
}

export default MyKindlyHelpStore;
