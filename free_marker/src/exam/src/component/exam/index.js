/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-19-21-49-49
 */
import {observer, inject} from "mobx-react";
import BaseExamComponent from "./BaseExamComponent";
import React from 'react';
import {Application} from '../../index.js';

@inject( "exam" )
@observer
class ExamComponent extends BaseExamComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/
    componentDidMount() {
        super.componentDidMount();
        this.props.exam.fetch().then();
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

    getAlertImageSrc(question) {
        if (question.isAnswerWrong()) {
            return 'images/question_error.png'
        }
    }

    onStatementButtonClicked(param) {
        const choice = param.object;
        const question = choice.getParentNode();
        if (question.isReply()) {
            return;
        }
        const reply = question.getChoices().indexOf( choice );
        question.setReply( reply );
    }

    onEndButtonClicked(param) {
        // super.onEndButtonClicked( param );
    }

    getInjectStyleOfStatementButton(choice) {
        if (choice.isReplyEqualToAnswer()) {
            return {borderWidth: '5px'}
        }
        return {borderWidth: '2px'}
    }

    getHeadView() {

    }

    getTailView() {
    }

    /** -------------------- async api -------------------- **/
}

export default ExamComponent;
