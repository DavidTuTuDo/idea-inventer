const edit = true;

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

    fetchExamsTestingRecords = async (view, clearAll = false) => {
        const questions = [];
        this.summarizeFilterConditionChanged();
        if (clearAll) {
            this.cleanTestingRecords();
            this.cleanQuestions();
        }
        const items = await this.fetchTestingRecords(view);
        const questionIds = items.map((each) => each.qid);
        this.setQuestionConditions(this.getInArrayConditions(questionIds));
        this.setNextQuestionPageMode('default');
        if (!clearAll) {
            const qs = await this.fetchQuestions(view);
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
        if (!_.isEqual('all', subject)) conditions.push({type: 'where', params: ['subject', '==', subject]});
        if (!_.isEqual('all', replyType)) conditions.push({type: 'where', params: ['isWrongReply', '==', _.isEqual(replyType, 'wrong')]});

        switch (orderByWhat) {
            case 'duration':
                conditions.push({type: 'orderBy', params: ['duration', 'desc']})
                break;
            case 'latest':
                conditions.push({type: 'orderBy', params: ['updateTime', 'desc']})
                break;
        }
        this.setTestingRecordConditions(conditions);
    }

    getExamFilterTips = () => {
        const filter = Cookie.getExamFilter();
        const subject = filter.subject; // 'string'
        const type = this.isFreezePage() ? 'freeze' : filter.type; // 'string' /** */
        const range = filter.range; // [100, 105]
        const countsOfExam = filter.countsOfExam; //25 or 40
        const qid = filter.qid
        return {subject, type, range, countsOfExam, qid};
    }

    async fetch(view) {

        let {range, subject, type, countsOfExam, qid} = this.getExamFilterTips();
        // console.log({range, subject, type, countsOfExam, qid})
        const questions = [];

        // console.log(range);
        let isMath = false;
        let typeOfMath = [];
        if (Util.isOrEquals(subject, '數學A', '數學B')) {
            isMath = true;
            typeOfMath = _.isEqual(_.last(subject), 'A') ? [0, 1] : [0, 2];
            subject = '數學';
        }

        function getRandomCondition() {
            const conditions = [];
            if (!_.isEqual('綜合題目', subject)) conditions.push({type: 'where', params: ['subject', '==', _.trim(subject)]});
            conditions.push({type: 'where', params: ['year', '>=', _.toNumber(range.shift())]});
            conditions.push({type: 'where', params: ['year', '<=', _.toNumber(range.shift())]});
            handleConditionsBySubjectName(conditions);
            return conditions;
        }

        function handleConditionsBySubjectName(condition) {
            if (isMath) condition.push({type: 'where', params: ['typeOfMath', 'in', typeOfMath]})
        }

        switch (type) {
            case 'history':
                /** 考古題呀 */
                const mTimesAndYear = _.head(range).split('-');
                const year = mTimesAndYear.shift();
                const times = mTimesAndYear.pop();

                const conditionsOfHistory = [
                    {type: 'where', params: ['subject', '==', _.trim(subject)]},
                    {type: 'where', params: ['year', '==', _.toNumber(year)]},
                    {type: 'where', params: ['timesOfYear', '==', _.toNumber(times)]},
                    {type: 'orderBy', params: ['qid']}
                ]

                handleConditionsBySubjectName(conditionsOfHistory)
                Util.appendInfo('year:' + year, 'times:' + times, 'complete:' + _.head(range));
                this.setQuestionConditions(conditionsOfHistory);
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
                const qs = await this.fetchExamsTestingRecords(this.getComponent(), true);
                questions.push(...qs)
                break;
            case 'freeze':
                /** 當作範例題目 */
                return {};
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
        }

        const result = await super.fetch(this.getComponent());
        this.syncQuestionDurationReply();
        return result;
    }

    async submitQuestionRecord(question) {
        if (!this.isHistoryWrongPage() && UserInfo.isLoginWithSucceed()) {
            const record = new TestingRecordStore();
            try {
                await record.submitTestingRecords(undefined, [{
                    id: question.getId(),
                    qid: question.getId(),
                    duration: Util.getDurationOfMillionSec(this.currentTimeStamp),
                    subject: question.getSubject(),
                    myWrongAnswer: question.isAnswerWrong() ? question.getReply() : '',
                    isWrongReply: question.isAnswerWrong(),
                }])
            } finally {
                this.renewTimeStamp();
            }

        }
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection)

        /** 沒有用的破功能，先mark掉
         *  會產生attr/[object object]的error
         ** await this.incrementCountsOfExamToday() */

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
        await (new WhoknowzFavoriteStore()).submitFavoriteItem(this.getComponent(), {
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
        if (UserInfo.isLoginWithSucceed()) {
            const store = new ExamCountsOfExamTodayStore()
            const info = await store.fetchCountsOfExamToday();
            _.isEqual(info.today, today) ?
                await store.submitIncrementCounts() :
                await store.submitCountsOfExamToday(undefined, {today: Util.getTodayTimeFormat(), counts: 1})
        } else {
            const info = Cookie.getCountsOfExamToday();
            let counts = info ? (_.isEqual(today, info.today) ? (info.counts + 1) : 1) : 1
            Cookie.setCountsOfExamToday({today, counts});
        }
    }

}

export default ExamStore;
