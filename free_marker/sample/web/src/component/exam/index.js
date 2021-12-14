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

    onOrderByWhatSelectedChange(value) {
        this.getStore().fetch(this).then();
    }

    onWhichSubjectSelectedChange(value) {
        this.getStore().fetch(this).then();
    }

    onReplyTypeSelectedChange(value) {
        this.getStore().fetch(this).then();
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
        return Util.getVisibleOrHidden(question.isAnswerWrong())
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
        self.getStore().submitQuestionRecord(question).finally((result) => {
            self.currentTimeStamp = Util.getCurrentTimeStamp();
        });
    }

    getInjectStyleOfChoiceStatementButton(choice) {
        if (choice.isReplyEqualToAnswer()) {
            return {borderWidth: '5px'}
        }
        return {borderWidth: '2px'}
    }

    getInjectStyleOfExamHistoryFilterDiv(exam) {
        return Util.getVisibleOrNone(this.getStore().isHistoryWrongPage())
    }

    getInjectStyleOfQuestionDurationTypography(question) {
        return Util.getVisibleOrNone(this.getStore().isHistoryWrongPage())
    }

    getInjectStyleOfQuestionReplyTimestampTypography(question) {
        return Util.getVisibleOrNone(this.getStore().isHistoryWrongPage())
    }

    /** -------------------- async api -------------------- **/
}

export default ExamComponent;
