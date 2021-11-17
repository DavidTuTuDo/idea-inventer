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

import Router from '../../router';
import Cookie from "../../cookie";
import ExamSubjectIdStore from "../../store/examSubjectId";
import CommonFirebaseHelper from "../../base/CommonFirebaseHelper";

@inject("exam")
@observer
class ExamComponent extends BaseExamComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/
    componentDidMount() {
        this.handleExamFilter();
        super.componentDidMount();
    }

    handleExamFilter = () => {
        const filter = Cookie.getExamFilter();
        const self = this;
        if (_.isEmpty(filter)) {
            Router.gotoMainPage(this.getComponentInstance());
            return;
        }

        const subject = filter.subject;// 'string'
        const type = filter.type;// 'string'
        const range = filter.range;//[100,105]
        const countsOfExam = filter.countsOfExam; //25 or 40

        switch (type) {
            case 'history':
                this.getStore().setQuestionConditions([
                    (stmt) => stmt.where('subject', '==', _.trim(subject)),
                    (stmt) => stmt.where('year', '==', _.toNumber(_.head(range))),
                    (stmt) => stmt.orderBy("qid")
                ])
                break;
            case 'random':
                this.setEnableInitFetch(false);
                console.log(subject, range, countsOfExam)
                const conditions = [
                    (stmt) => stmt.where('subject', '==', _.trim(subject)),
                    (stmt) => stmt.where('year', '>=', _.toNumber(range.shift())),
                    (stmt) => stmt.where('year', '<=', _.toNumber(range.shift()))
                ]
                const subjectID = new ExamSubjectIdStore();
                subjectID.fetchSubjectIds(this, ...conditions).then((idMaps) => {
                    const ids = _.sampleSize(idMaps, 10).map(each => each.quid);
                    this.getStore().setQuestionConditions([(stmt)=> stmt.where(CommonFirebaseHelper.getFieldNameOfDocumentId(),'in',ids)])
                    return this.getStore().fetch(self)
                }).then((result) => {
                    console.log(result);
                });

                break;
            default:
                /** show error dialog then return */
                break;
        }
        Cookie.removeExamFilter();
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
        if (question.isAnswerWrong()) {
            return {visibility: 'visible'}
        }
        return {visibility: 'hidden'}
    }

    onStatementButtonClicked(param) {
        const choice = param.object;
        const question = choice.getParentNode();
        if (question.isReply()) {
            return;
        }
        const reply = question.getChoices().indexOf(choice);
        question.setReply(reply);
    }

    getInjectStyleOfChoiceStatementButton(choice) {
        if (choice.isReplyEqualToAnswer()) {
            return {borderWidth: '5px'}
        }
        return {borderWidth: '2px'}
    }

    /** -------------------- async api -------------------- **/
}

export default ExamComponent;
