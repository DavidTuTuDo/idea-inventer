import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {observer} from "mobx-react";
import {inject} from "mobx-react";
import BaseExamEditorComponent from "./BaseExamEditorComponent";
import Cookie from "../../cookie";
import Router from "../../router";
import ExamSubjectIdStore from "../../store/examSubjectId";

@inject("exam")
@observer
class ExamEditorComponent extends BaseExamEditorComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getInjectStyleOfExamEditorHistoryFilterDiv(examEditor) {
        return Util.getVisibleOrNone(this.getStore().isHistoryWrongPage())
    }

    getInjectStyleOfQuestionAlertDiv(question) {
        return Util.getVisibleOrNone(false);
    }

    getInjectStyleOfExamEditorQuestionCard(question) {
        if (Util.isOdd(question.qid)) {
            return {backgroundColor: '#ccc0c0c0'}
        } else {
            return {backgroundColor: 'transparent'}
        }
    }

    /** -------------------- async api -------------------- **/
}

export default ExamEditorComponent;
