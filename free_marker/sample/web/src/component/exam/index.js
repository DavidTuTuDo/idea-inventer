/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-19-21-49-49
 */
import {observer, inject} from "mobx-react";
import BaseExamComponent from "./BaseExamComponent";
import React from 'react';
import {Application} from '../../index.js';
import {utiller as Util} from "utiller";
import _ from "lodash";
import Router from '../../router';
import Cookie from "../../cookie";
import ExamSubjectIdStore from "../../store/examSubjectId";
import TestingRecordStore from "../../store/examTestingRecord";
import ExamCountsOfExamTodayStore from "../../store/examCountsOfExamToday";
import UserInfo from "../../userInfo";


@inject("exam")
@observer
class ExamComponent extends BaseExamComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/
    componentDidMount() {
        this.handleExamFilter();
        super.componentDidMount();
    }

    onInitialApiSucceed(object) {
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
                await store.submitIncrementCounts(self) :
                await store.submitCountsOfExamToday(undefined, undefined, {today: Util.getTodayTimeFormat(), counts: 1})
        } else {
            const info = Cookie.getCountsOfExamToday();
            let counts = info ? (_.isEqual(today, info.today) ? (info.counts + 1) : 1) : 1
            Cookie.setCountsOfExamToday({today, counts});
        }
    }

    handleExamFilter = () => {
        const filter = Cookie.getExamFilter();
        const self = this;
        if (_.isEmpty(filter)) {
            Router.gotoMainPage(this.getComponentInstance());
            return;
        }
        const subject = filter.subject; // 'string'
        const type = filter.type; // 'string'
        const range = filter.range; // [100, 105]
        const countsOfExam = filter.countsOfExam; //25 or 40
        Util.appendInfo(subject, type, range, countsOfExam);

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
                this.getStore().setQuestionConditions([
                    {where: (stmt) => stmt.where('subject', '==', _.trim(subject))},
                    {where: (stmt) => stmt.where('year', '==', _.toNumber(_.head(range)))},
                    {orderBy: (stmt) => stmt.orderBy("qid")}
                ]);
                break;
            case 'random':
                this.setEnableInitFetch(false);
                const subjectID = new ExamSubjectIdStore();
                subjectID.fetchSubjectIds(this, ...getRandomCondition()).then((idMaps) => {
                    const ids = _.sampleSize(idMaps, countsOfExam).map(each => each.quid);
                    this.getStore().pushNextQuestionIDs(...ids);
                    return this.getStore().fetch(self)
                }).then();
                break;
            case 'wrongHistory':
                this.setEnableInitFetch(false);
                self.getStore().
                /**
                 * 1. 呼叫wrongHistory list(limit size)
                 * 2. wrongHistory list attr(qid) 換成 question list.
                 * 3. 顯示 question list.
                 * 4. override onScrollToBottomJob (用history list 最後一筆去要next page 再轉換成 question id)
                 * 5.
                 *
                 */




                break;
            default:
                Util.appendError(`8354 ==> type can't not be ${type}`);
                /**
                 * show error dialog then return
                 **/
                break;
        }
    }

    getChoiceButtonColor(choice) {
        const question = choice.getParentNode();
        if (!question.isReply() || choice.isReplyEqualToAnswer()) {
            return 'primary';
        }

        if (choice.isWrongReply()) {
            return 'secondary';
        }
        return 'inherit';
    }

    getInjectPropsOfChoiceStatementButton(choice) {
        const props = {}
        props.color = this.getChoiceButtonColor(choice);
        return props;
    }

    getInjectStyleOfQuestionChoiceDiv(choice) {
        if (choice.hasPhotos()) {
            return {
                'borderStyle': 'solid',
                'borderWidth': '3px',
                'borderRadius': '10px',
                'borderColor': 'grey',
                'padding': '5px',
            }
        } else {
            return {}
        }
    }

    getInjectStyleOfQuestionAlertDiv(question) {
        return Util.getVisibleOrNone(question.isAnswerWrong())
    }

    onStatementButtonClicked(param) {
        const self = this;
        const choice = param.object;
        const question = choice.getParentNode();
        if (question.isReply()) {
            return;
        }
        const reply = question.getChoices().indexOf(choice);
        question.setReply(reply);
        this.submitQuestionRecord(question).finally((result) => {
            self.currentTimeStamp = Util.getCurrentTimeStamp();
        });
    }

    getInjectStyleOfChoiceStatementButton(choice) {
        if (choice.isReplyEqualToAnswer()) {
            return {borderWidth: '5px'}
        }
        return {borderWidth: '2px'}
    }

    async submitQuestionRecord(question) {
        if (UserInfo.isLoginInSucceed()) {
            const record = new TestingRecordStore();
            await record.submitTestingRecords(undefined, undefined, {
                qid: question.getId(),
                duration: Util.getDurationOfMillionSec(this.currentTimeStamp),
                subject: question.getSubject(),
                myWrongAnswer: question.isAnswerWrong() ? question.getReplyString() : '',
                isWrongReply: question.isAnswerWrong(),
                expiredTime: Util.getTimeStampAfterCondition(record.getObjectOfCurrentTimeStamp().toMillis(), {days: 20})
            })
        }
    }


    /** -------------------- async api -------------------- **/
}

export default ExamComponent;
