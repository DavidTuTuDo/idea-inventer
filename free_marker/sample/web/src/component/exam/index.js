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
        Util.appendInfo(subject,type,range,countsOfExam)
        switch (type) {
            case 'history':
                this.getStore().setQuestionConditions([
                    {where: (stmt) => stmt.where('subject', '==', _.trim(subject))},
                    {where: (stmt) => stmt.where('year', '==', _.toNumber(_.head(range)))},
                    {orderBy: (stmt) => stmt.orderBy("qid")}
                ])
                break;
            case 'random':
                this.setEnableInitFetch(false);
                const conditions = [
                    {where:(stmt) => stmt.where('subject', '==', _.trim(subject))},
                    {where:(stmt) => stmt.where('year', '>=', _.toNumber(range.shift()))},
                    {where:(stmt) => stmt.where('year', '<=', _.toNumber(range.shift()))}
                ]
                const subjectID = new ExamSubjectIdStore();
                subjectID.fetchSubjectIds(this, ...conditions).then((idMaps) => {
                    console.log(idMaps);
                    const ids = _.sampleSize(idMaps, countsOfExam).map(each => each.quid);
                    console.log(ids);
                    this.getStore().pushNextQuestionIDs(...ids);
                    return this.getStore().fetch(self)
                }).then();

                break;
            default:
                Util.appendError(`8354 type can't not be ${type}`)
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
