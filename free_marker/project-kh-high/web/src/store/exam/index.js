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
import UserInfo from "../../base/BaseUserInfo";
import TestingRecordStore from "../examTestingRecord";
import ExamCountsOfExamTodayStore from "../examCountsOfExamToday";
import WhoknowzConfuseStore from "../whoknowzConfuse";
import WhoknowzFavoriteStore from "../whoknowzFavorite";

import {
    action,
    observable,
} from "mobx";

class ExamStore extends BaseExamStore {

    @observable
    freeze = false;

    @action
    setFreezePage(frz) {
        this.freeze = frz;
    }

    constructor() {
        super();
        this.currentTimeStamp = Util.getCurrentTimeStamp();
    }

    syncQuestionDurationReply() {
        this.getTestingRecords().forEach((record, index) => {
            const question = _.nth(this.getQuestions(), index);
            if (question instanceof QuestionStore) {
                const reply = record.getIsWrongReply() ? record.getMyWrongAnswer() : question.getAnswer();
                question.setReply(reply);
                question.setDuration(`本題使用: ${Util.getTimeFormatOfDurationToMillionSecond(record.duration)}`);
                question.setReplyTimestamp(`作答時間: ${Util.getChineseTimeFormat(record.getUpdateTime())}`)
            }
        })
    }

    setFreezeQuestion(question) {
        this.setFreezePage(true);
        this.pushQuestion(question);
    }

    isHistoryWrongPage = () => {
        return _.isEqual('historyWrong', this.getExamFilterTips().type)
    }

    isFreezePage() {
        return this.freeze;
    }

    fetchExamsTestingRecords = async (clearAll = false) => {
        const questions = [];
        this.summarizeFilterConditionChanged();
        if (clearAll) {
            this.cleanTestingRecords();
            this.cleanQuestions();
        }
        const items = await this.fetchTestingRecords(this.getComponent());
        const questionIds = items.map((each) => each.qid);
        this.setQuestionConditions(this.getInArrayConditions(questionIds));
        this.setNextQuestionPageMode('custom');
        if (!clearAll) {
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
        const type = !!this.freeze ? 'freeze' : filter.type; // 'string' /** */
        const range = filter.range; // [100, 105]
        const countsOfExam = filter.countsOfExam; //25 or 40
        const qid = filter.qid
        return {subject, type, range, countsOfExam, qid};
    }

    async fetch(view) {
        const {range, subject, type, countsOfExam, qid} = this.getExamFilterTips();
        // console.log({range, subject, type, countsOfExam, qid})
        const questions = [];
        // console.log(range);
        function getRandomCondition() {
            const conditions = [];
            if (!_.isEqual('綜合題目', subject)) {
                conditions.push({where: (stmt) => stmt.where('subject', '==', _.trim(subject))});
            }
            conditions.push({where: (stmt) => stmt.where('year', '>=', _.toNumber(range.shift()))});
            conditions.push({where: (stmt) => stmt.where('year', '<=', _.toNumber(range.shift()))});
            return conditions;
        }

        switch (type) {
            case 'history':
                /** 考古題呀 */
                const mTimesAndYear = _.head(range).split('-');
                const year = mTimesAndYear.shift();
                const times = mTimesAndYear.pop();

                Util.appendInfo('year:'+year, 'times:'+times, 'complete:'+_.head(range));
                this.setQuestionConditions([
                    {where: (stmt) => stmt.where('subject', '==', _.trim(subject))},
                    {where: (stmt) => stmt.where('year', '==', _.toNumber(year))},
                    {where: (stmt) => stmt.where('timesOfYear', '==', _.toNumber(times))},
                    {orderBy: (stmt) => stmt.orderBy("qid")}
                ]);
                break;
            case 'random':
                /** 隨機測驗 */
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
            case 'freeze':
                /** 當作範例題目 */
                return {};
                break;
            case 'demo':
                this.getComponent().clearScrollToBottomJobs();
                this.setQuestionConditions(this.getInArrayConditions([qid]))
                break;
            default:
                this.getComponent().clearScrollToBottomJobs();
                Util.appendError(`8354 ==> type can't not be ${type}`);
                this.getComponent().showWarningSnackMessage(`很抱歉,連結已失效`)
                return undefined;
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
            try {
                await record.submitTestingRecords(undefined, undefined, {
                    id: question.getId(),
                    qid: question.getId(),
                    duration: Util.getDurationOfMillionSec(this.currentTimeStamp),
                    subject: question.getSubject(),
                    myWrongAnswer: question.isAnswerWrong() ? question.getReply() : '',
                    isWrongReply: question.isAnswerWrong(),
                })
            } finally {
                this.renewTimeStamp();
            }

        }
    }

    async onInitialFetchSucceed(collection) {
        await super.onInitialFetchSucceed(collection)
        await this.incrementCountsOfExamToday()
        this.renewTimeStamp();
    }

    renewTimeStamp() {
        this.currentTimeStamp = Util.getCurrentTimeStamp();
    }

    async submitConfusedQuestion(question) {
        const item = await (new WhoknowzConfuseStore()).submitConfuseItem(this.getComponent(), {
            qid: question.id,
            userId: UserInfo.getUid(),
            isPublic: true,
            subject: question.subject,
            tip: `請你幫幫我-${Util.getCurrentTimeFormat()}`
        })
        return item.value.id;
    }

    async submitToFavoriteQuestion(question) {
        await (new WhoknowzFavoriteStore()).submitFavoriteItem(this.getComponent(), undefined, {
            id: question.id,
            qid: question.id,
            subject: question.subject,
            tip: undefined
        })
        return 'succeed';
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
