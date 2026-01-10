import { inject } from "mobx-react";
import BaseEditorOfSubjectComponent from "./BaseEditorOfSubjectComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import { observer } from "mobx-react";
import Question from "../../store/examQuestion";
@inject("editorOfSubject")
@observer
class EditorOfSubjectComponent extends BaseEditorOfSubjectComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

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
        this.getStore()
            .updateMathABOfQuestion(value, question)
            .then((result) => {
                self.showInfoSnackMessage(`${question.getYear()}${question.getSubject()}-第${question.getQid()}題 更新為「${self.getLabelByValue(value)}」`);
                console.log(self.getLabelByValue(value));
            });
    }

    getLabelByValue(value) {
        const question = new Question();
        const types = question.getSelectorOfMaths().map((each) => each.data());
        const item = _.find(types, (type) => _.isEqual(type.value, value));
        return item ? item.label : "error";
    }

    onYearSelectedChange(value) {
        this.getStore().setHasNextPageBehavior(true);
        this.getStore().cleanQuestions();
        this.getStore().cleanQuestionConditions();
        this.getStore().cleanQuestionNextIds();
        this.getStore().lastItemOfQuestion = undefined;
        this.getStore().setInitialFetchCompleted(false);
        this.componentDidMount();
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

    onEditorOfSubjectAreaOfStatementUpdateButtonClicked(param) {
        this.exeAsyncT(this.getStore().updateStatementOfMathTypeStuff());
    }

    /** -------------------- async api -------------------- **/
}

export default EditorOfSubjectComponent;
