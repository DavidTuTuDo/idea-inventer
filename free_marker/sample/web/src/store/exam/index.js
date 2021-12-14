/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-14-20-30-45
 */
import BaseExamStore from "./BaseExamStore";
import QuestionStore from "../examQuestion";

import _ from "lodash";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import Cookie from "../../cookie";
import Router from "../../router";
import ExamSubjectIdStore from "../examSubjectId";
import UserInfo from "../../userInfo";
import TestingRecordStore from "../examTestingRecord";
import ExamCountsOfExamTodayStore from "../examCountsOfExamToday";

class ExamStore extends BaseExamStore {

    syncQuestionDurationReply() {
        this.getTestingRecords().forEach((record, index) => {
            const question = _.nth(this.getQuestions(), index);
            if (question instanceof QuestionStore) {
                const int = Util.stringToInteger(record.getIsWrongReply() ? record.getMyWrongAnswer() : question.getAnswer());
                question.setReply(int);
                question.setDuration(`本題使用: ${Util.getTimeFormatOfDurationToMillionSecond(record.duration)}`);
                question.setReplyTimestamp(`作答時間: ${Util.getChineseTimeFormat(record.getUpdateTime())}`)
            }
        })
    }

    isHistoryWrongPage = () => {
        return _.isEqual('historyWrong', this.getExamFilterTips().type)
    }

    fetchExamsTestingRecords = async (clearAll = false) => {
        const questions = [];
        if (clearAll) {
            this.cleanTestingRecords();
            this.cleanQuestions();
            this.summarizeFilterConditionChanged();
        }
        const items = await this.fetchTestingRecords(this.getComponent());
        const questionIds = items.map((each) => each.qid);
        this.setQuestionConditions(this.getInArrayConditions(questionIds));
        this.setNextQuestionPageMode('custom');
        if(!clearAll) {
            const qs = await this.fetchQuestions(this.getComponent());
            questions.push(...qs)
        }

        this.syncQuestionDurationReply();
        return questions;
    }

    summarizeFilterConditionChanged = () => {
        const filter = this.getHistoryFilter();
        const subject = filter.getSelectedWhichSubject();
        const replyType = filter.getSelectedReplyType();
        const orderByWhat = filter.getSelectedOrderByWhat();
        const conditions = [];
        if (!_.isEqual('all', subject))
            conditions.push({where: (stmt) => stmt.where('subject', '==', subject)})

        if (!_.isEqual('all', replyType))
            conditions.push({where: (stmt) => stmt.where('isWrongReply', '==', _.isEqual(replyType, 'wrong'))})
        switch (orderByWhat) {
            case 'duration':
                conditions.push({orderBy: (stmt) => stmt.orderBy('duration', 'desc')})
                break;
            case 'latest':
                conditions.push({orderBy: (stmt) => stmt.orderBy('updateTime', 'desc')})
                break;
        }
        this.setTestingRecordConditions(conditions);
    }

    getExamFilterTips = () => {
        const filter = Cookie.getExamFilter();
        const subject = filter.subject; // 'string'
        const type = filter.type; // 'string' /** */
        const range = filter.range; // [100, 105]
        const countsOfExam = filter.countsOfExam; //25 or 40
        return {subject, type, range, countsOfExam};
    }

    async fetch(view) {
        const {range, subject, type, countsOfExam} = this.getExamFilterTips();
        const questions = [];
        function getRandomCondition() {
            const conditions = [];
            if (!_.isEqual('綜合測驗', subject)) {
                conditions.push({where: (stmt) => stmt.where('subject', '==', _.trim(subject))});
            }
            conditions.push({where: (stmt) => stmt.where('year', '>=', _.toNumber(range.shift()))});
            conditions.push({where: (stmt) => stmt.where('year', '<=', _.toNumber(range.shift()))});
            return conditions;
        }

        switch (type) {
            case 'history':
                this.setQuestionConditions([
                    {where: (stmt) => stmt.where('subject', '==', _.trim(subject))},
                    {where: (stmt) => stmt.where('year', '==', _.toNumber(_.head(range)))},
                    {orderBy: (stmt) => stmt.orderBy("qid")}
                ]);
                break;
            case 'random':
                const subjectID = new ExamSubjectIdStore();
                const idMaps = await subjectID.fetchSubjectIds(this.getComponent(), ...getRandomCondition())
                const ids = _.sampleSize(idMaps, countsOfExam).map(each => each.quid)
                this.pushNextQuestionIDs(...ids);
                break;
            case 'historyWrong':
                this.getComponent().setScrollToBottomJobs(this.fetchExamsTestingRecords)
                 const qs = await this.fetchExamsTestingRecords(true);
                questions.push(...qs)
                break;
            default:
                Util.appendError(`8354 ==> type can't not be ${type}`);
                /**
                 * show error dialog then return
                 **/
                break;
        }
        const result = await super.fetch(this.getComponent());
        this.syncQuestionDurationReply();
        return result;
    }

    async submitQuestionRecord(question) {
        if (!this.isHistoryWrongPage() && UserInfo.isLoginInSucceed()) {
            const record = new TestingRecordStore();
            await record.submitTestingRecords(undefined, undefined, {
                id: question.getId(),
                qid: question.getId(),
                duration: Util.getDurationOfMillionSec(this.currentTimeStamp),
                subject: question.getSubject(),
                myWrongAnswer: question.isAnswerWrong() ? Util.integerToString(question.getReply()) : '',
                isWrongReply: question.isAnswerWrong(),
            })
        }
    }

    onInitialFetchSucceed(obj) {
        this.incrementCountsOfExamToday().then();
        this.currentTimeStamp = Util.getCurrentTimeStamp();
    }

    async incrementCountsOfExamToday() {
        const self = this;
        const today = Util.getTodayTimeFormat();
        if (UserInfo.isLoginInSucceed()) {
            const store = new ExamCountsOfExamTodayStore()
            const info = await store.fetchCountsOfExamToday();
            _.isEqual(info.today, today) ?
                await store.submitIncrementCounts() :
                await store.submitCountsOfExamToday(undefined, undefined, {today: Util.getTodayTimeFormat(), counts: 1})
        } else {
            const info = Cookie.getCountsOfExamToday();
            let counts = info ? (_.isEqual(today, info.today) ? (info.counts + 1) : 1) : 1
            Cookie.setCountsOfExamToday({today, counts});
        }
    }

}

export default ExamStore;
