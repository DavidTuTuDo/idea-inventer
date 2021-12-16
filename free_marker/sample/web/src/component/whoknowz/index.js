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
import UserInfo from '../../userInfo';
import React from 'react';
@inject("whoknowz")
@observer
class WhoknowzComponent extends BaseWhoknowzComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.getStore().setConfuseId(this.paramOfCid);
    }

    getInjectViewOfQuestionReactFragment(whoknowz) {
        return <ExamQuestionView
            freeze={true}
            question={whoknowz.question}/>
    }

    onCopylinkButtonClicked(param) {
        this.copyCurrentLinkToClipboard();
    }

    onSubmitButtonClicked(param) {
        this.getStore().submitConfirmedAnswer().then();
    }

    getInjectPropsOfWhoknowzSubmitButton = () => {
        return {disabled : this.getStore().isAnswerReliedOrOwner()}
    }

    getInjectPropsOfAnswerAnswerByTextTextField(answer) {
        return {disabled : this.getStore().isAnswerReliedOrOwner()}
    }

    enableImageSelectView(multiple) {
        if(this.getStore().isAnswerReliedOrOwner()) {
            /** doing nothing */
        }else {
            return super.enableImageSelectView(multiple)
        }
    }


    /** -------------------- async api -------------------- **/
}

export default WhoknowzComponent;
