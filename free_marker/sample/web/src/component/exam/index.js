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
import UserInfo from "../../userInfo";
import Config from '../../config';
import libpath from 'path';

@inject("exam")
@observer
class ExamComponent extends BaseExamComponent {

    constructor(props) {
        super(props);
        if (!!this.props.freeze) {
            this.getStore().setFreezeQuestion(this.props.question)
            this.clearScrollToBottomJobs();
        }
    }

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
        if (!question.getCompleted()) {
            return 'primary';
        }

        if (choice.isRightAnswer()) {
            return 'primary';
        }
        if (choice.isMyWrongReply()) {
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
                backgroundColor: 'rgba(0,0,0,0.1)'
            }
        } else {
            return {}
        }
    }

    getInjectStyleOfQuestionAlertDiv(question) {
        return Util.getVisibleOrHidden(question.getCompleted() && !this.getStore().isFreezePage())
    }

    onStatementButtonClicked(param) {
        const choice = param.object;
        const question = choice.getParentNode();
        if (question.getCompleted()) {
            return;
        }

        const reply = question.getChoices().indexOf(choice);
        question.setReply(reply);
    }

    getInjectStyleOfChoiceStatementButton(choice) {
        const question = choice.getParentNode();
        if (!question.getCompleted()) {
            return choice.isSelected() ? {borderWidth: '6px'} : {borderWidth: '2px'}
        } else {
            /** 題目已完成 */
            return choice.isRightAnswer() ? {borderWidth: '6px'} : {borderWidth: '2px'}
        }
    }

    getInjectStyleOfExamHistoryFilterDiv(exam) {
        return Util.getVisibleOrNone(this.getStore().isHistoryWrongPage())
    }

    getInjectStyleOfQuestionTopicOfAssistantDiv(question) {
        return Util.getVisibleOrNone(question.needAssistantArea());
    }

    getInjectStyleOfQuestionDurationTypography(question) {
        return Util.getVisibleOrNone(this.getStore().isHistoryWrongPage())
    }

    getInjectStyleOfQuestionReplyTimestampTypography(question) {
        return Util.getVisibleOrNone(this.getStore().isHistoryWrongPage())
    }

    onCalloutHelpButtonClicked(param) {
        const self = this;
        const question = param.object;
        this.getStore().submitConfusedQuestion(question).then((cid) => {
            self.gotoUrlWithNewTabDirectly(Router.gotoWhoknowzPage(undefined, cid));
        })
    }

    onAddToFavoriteButtonClicked(param) {
        const self = this;
        const question = param.object;
        this.getStore().submitToFavoriteQuestion(question).then((whatever) =>
            self.showWarningSnackMessage(`已加入我的最愛`)
        )
    }

    getInjectStyleOfQuestionFunctionCenterDiv(question) {
        return Util.getVisibleOrHidden(question.getCompleted() && !this.getStore().isFreezePage())
    }

    getInjectStyleOfTopicOfAssistantNameTypography(topicOfAssistant) {
        return Util.getVisibleOrNone(!_.isEmpty(topicOfAssistant.getName()))
    }

    /** -------------------- async api -------------------- **/
}

export default ExamComponent;
