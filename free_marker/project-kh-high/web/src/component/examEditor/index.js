const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseExamEditorComponent from "./BaseExamEditorComponent";
import Cookie from "../../cookie";
import Router from "../../router";
import ExamSubjectIdStore from "../../store/examSubjectId";

class ExamEditorComponent extends BaseExamEditorComponent {

    constructor(props) {
        super(props);
    }

    getListInjectStyleOfExamEditorQuestionChoiceDiv(param) {}

    getListInjectStyleOfExamEditorQuestionOptionalDiv(param) {}

    getInjectStyleOfExamEditorHistoryFilterDiv(examEditor) {
        return Util.getVisibleOrNone(this.getStore().isHistoryWrongPage());
    }

    getInjectStyleOfExamEditorQuestionAlertDiv(question) {
        return Util.getVisibleOrNone(false);
    }

    getInjectStyleOfExamEditorQuestionCard(question) {
        if (Util.isOdd(question.qid)) {
            return { backgroundColor: "#ccc0c0c0" };
        } else {
            return { backgroundColor: "transparent" };
        }
    }

    /** -------------------- async api -------------------- **/
}

export default ExamEditorComponent;
