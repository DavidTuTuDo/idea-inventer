/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-19-21-49-49
 */
import { observer, inject } from "mobx-react";
import BaseExamComponent from "./BaseExamComponent";
import { utiller as Util } from "utiller";
import _ from "lodash";
import Router from "../../router";

@inject("exam")
@observer
class ExamComponent extends BaseExamComponent {
    constructor(props) {
        super(props);
    }

    getChoiceStatement(choice) {
        const question = choice.getParentNode();
        const statement = super.getChoiceStatement(choice);
        return question.isChoiceDependOnAttachImage() ? `如圖示的 (${statement}) ` : statement;
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
            return "primary";
        }

        if (choice.isRightAnswer()) {
            return "primary";
        }

        if (choice.isMyWrongReply()) {
            return "secondary";
        }

        return "inherit";
    }

    handleStatementButtonColorBehavior(choice) {
        const props = {};
        props.color = this.getChoiceButtonColor(choice);
        return props;
    }

    handleStatementBorderWidthBehavior(choice, thin = false) {
        const mQuestionOrOptional = choice.getParentNode();
        if (!mQuestionOrOptional.getCompleted()) {
            return choice.isSelected() ? { borderWidth: thin ? "3px" : "6px" } : { borderWidth: "2px" };
        } else {
            /** 題目已完成 */
            return choice.isRightAnswer() ? { borderWidth: thin ? "3px" : "6px" } : { borderWidth: "2px" };
        }
    }

    getInjectPropsOfExamQuestionChoiceStatementButton(choice) {
        return this.handleStatementButtonColorBehavior(choice);
    }

    getInjectStyleOfExamQuestionChoiceStatementButton(choice) {
        return this.handleStatementBorderWidthBehavior(choice);
    }

    getInjectPropsOfExamQuestionOptionalChoiceStatementButton(choice) {
        return this.handleStatementButtonColorBehavior(choice);
    }

    getInjectStyleOfExamQuestionOptionalChoiceStatementButton(choice) {
        return this.handleStatementBorderWidthBehavior(choice, true);
    }

    componentDidMount() {
        const isFreezeUsage = !!this.props.freeze;
        if (isFreezeUsage) {
            this.getStore().setFreezePage(true);
            this.clearScrollToBottomJobs();
        }
        super.componentDidMount();
        if (isFreezeUsage) this.getStore().setFreezeQuestion(this.props.question);
    }

    getInjectStyleOfExamQuestionChoiceDiv(choice) {
        if (choice.hasPhotos()) {
            return {
                backgroundColor: "rgba(0,0,0,0.1)"
            };
        } else {
            return {};
        }
    }

    getInjectStyleOfExamQuestionAlertDiv(question) {
        return Util.getVisibleOrHidden(question.getCompleted() && !this.getStore().isFreezePage());
    }

    onExamQuestionChoiceStatementButtonClicked(param) {
        const choice = param.object;
        const question = choice.getParentNode();
        if (question.getCompleted()) {
            return;
        }

        const reply = question.getChoices().indexOf(choice);
        question.setReply(reply);
    }

    getInjectStyleOfExamHistoryFilterDiv(exam) {
        return Util.getVisibleOrNone(this.getStore().isHistoryWrongPage());
    }

    getInjectStyleOfExamQuestionTopicOfAssistantDiv(question) {
        return Util.getVisibleOrNone(question.needAssistantArea());
    }

    getInjectStyleOfExamQuestionDurationTypography(question) {
        return Util.getVisibleOrNone(this.getStore().isHistoryWrongPage());
    }

    getInjectStyleOfExamQuestionReplyTimestampTypography(question) {
        return Util.getVisibleOrNone(this.getStore().isHistoryWrongPage());
    }

    onExamQuestionCalloutHelpButtonClicked(param) {
        const self = this;
        const question = param.object;
        this.getStore()
            .submitConfusedQuestion(question)
            .then((cid) => {
                Router.gotoWhoknowzPage(self, cid);
            });
    }

    onExamQuestionAddToFavoriteButtonClicked(param) {
        const self = this;
        const question = param.object;
        this.getStore()
            .submitToFavoriteQuestion(question)
            .then((whatever) => self.showWarningSnackMessage(`已加入我的最愛`));
    }

    getInjectStyleOfExamQuestionFunctionCenterDiv(question) {
        return Util.getVisibleOrHidden(question.getCompleted() && !this.getStore().isFreezePage());
    }

    getInjectStyleOfExamQuestionTopicOfAssistantNameTypography(topicOfAssistant) {
        return Util.getVisibleOrNone(!_.isEmpty(topicOfAssistant.getName()));
    }

    getInjectStyleOfExamQuestionTopicNameTypography(topic) {
        return Util.getVisibleOrNone(!topic.getParentNode().isMathOptionalQuestion());
    }

    onExamQuestionOptionalChoiceStatementButtonClicked(param) {
        const choice = param.object;
        const reply = choice.getStatement();
        const optional = choice.getParentNode();
        optional.setReply(reply);
    }

    getInjectStyleOfExamQuestionSelectorOfMathFormControlLabel(selectorOfMath) {
        return Util.getVisibleOrNone(false);
    }

    /** -------------------- async api -------------------- **/
}

export default ExamComponent;
