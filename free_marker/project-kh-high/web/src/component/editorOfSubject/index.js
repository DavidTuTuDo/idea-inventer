import {inject} from "mobx-react";
import BaseEditorOfSubjectComponent from "./BaseEditorOfSubjectComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Skeleton from "@material-ui/core/Skeleton";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import {observer} from "mobx-react";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("editorOfSubject")
@observer
class EditorOfSubjectComponent extends BaseEditorOfSubjectComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getListInjectStyleOfExamQuestionChoiceDiv(param) {
        return Util.getVisibleOrNone(false);
    }

    getListInjectStyleOfExamQuestionOptionalDiv(param) {
        return Util.getVisibleOrNone(false);
    }

    getInjectStyleOfExamQuestionTopicOfAssistantNameTypography(topicOfAssistant) {
        return Util.getVisibleOrNone(!_.isEmpty(topicOfAssistant.getName()), true);
    }

    onSelectorOfMathSelectedChange(value, question) {
        const self = this;
        this.getStore().updateMathABOfQuestion(value, question).then((result) => {
            self.showInfoSnackMessage(`${question.getYear()}${question.getSubject()}-第${question.getQid()}題 已更新`);
        })
    }

    onYearSelectedChange(value) {
        this.getStore().setHasPageItems(true);
        this.getStore().cleanQuestions();
        this.getStore().fetch(this.getComponentInstance());
    }

    getInjectStyleOfExamQuestionFunctionCenterDiv(question) {
        return Util.getVisibleOrNone(false);
    }

    getInjectStyleOfExamQuestionDurationTypography(question) {
        return Util.getVisibleOrNone(false);
    }

    getInjectStyleOfExamQuestionReplyTimestampTypography(question) {
        return Util.getVisibleOrNone(false);
    }

    getInjectStyleOfExamQuestionSelectorOfMathFormControlLabel(selectorOfMath) {
        super.getInjectStyleOfExamQuestionSelectorOfMathFormControlLabel(selectorOfMath);
    }

    onEditorOfSubjectAreaOfStatementUpdateButtonClicked(param){
        this.getStore().updateStatementOfMathTypeStuff().then()
    }


    /** -------------------- async api -------------------- **/
}

export default EditorOfSubjectComponent;
