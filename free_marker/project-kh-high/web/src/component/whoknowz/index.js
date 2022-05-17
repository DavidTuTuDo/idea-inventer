import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {observer} from "mobx-react";
import {inject} from "mobx-react";
import BaseWhoknowzComponent from "./BaseWhoknowzComponent";
import ExamQuestionView from "../exam";
import React from 'react';
import ExamStore from '../../store/exam'
@inject("whoknowz")
@observer
class WhoknowzComponent extends BaseWhoknowzComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.getStore().setConfuseId(this.paramOfCid);
        this.getStore().setAnswerId(this.paramOfAid);
        this.exam = new ExamStore();
    }

    getInjectViewOfWhoknowzQuestionDiv(whoknowz) {
        const self = this
        return <ExamQuestionView
            freeze={true}
            component={this}
            injectStore={this.exam}
            isComponentView={true}
            question={whoknowz.question}/>
    }


    onWhoknowzFastCenterCopylinkButtonClicked(param) {
        this.copyCurrentLinkToClipboard();
    }

    askMrLin(message = '') {
        this.openLineChatAccountWithMessage(`@546kkjvt`, message)
    }

    onWhoknowzSubmitButtonClicked(param) {
        this.getStore().submitConfirmedAnswer().then();
    }

    getInjectPropsOfWhoknowzSubmitButton = () => {
        return {disabled : this.getStore().isAnswerReliedOrOwner() ||
                this.getStore().hasTargetAnswerId()}
    }

    getInjectPropsOfWhoknowzAnswerAnswerByTextTextField(answer) {
        return {disabled : this.getStore().isAnswerReliedOrOwner() ||
                this.getStore().hasTargetAnswerId()}
    }

    getInjectStyleOfWhoknowzFastCenterAskmrlinButton = (fastCenter) => {
        return Util.getVisibleOrHidden(this.getStore().isMathOrEnglish())
    }

    enableImageSelectView(multiple) {
        if(this.getStore().isAnswerReliedOrOwner() ||
            this.getStore().hasTargetAnswerId()) {
            /** doing nothing */
        }else {
            return super.enableImageSelectView(multiple)
        }
    }

    isValidOfParamOfAid(aid) {
        return true;
    }

    isValidOfParamOfCid(cid) {
        return this.constraintOfParam(cid);
    }

    onWhoknowzFastCenterAskmrlinButtonClicked(param) {
        this.askMrLin(`請您教教我這題,謝謝!
        \n\n\n
        \n\n\n
        \n\n\n
        ${this.getCurrentWebSiteLink()}`);
    }

    /** -------------------- async api -------------------- **/
}

export default WhoknowzComponent;
