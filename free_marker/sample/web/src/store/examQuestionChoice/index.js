import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseExamQuestionChoiceStore from "./BaseExamQuestionChoiceStore";

class ExamQuestionChoiceStore extends BaseExamQuestionChoiceStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    isReplyEqualToAnswer() {
        const question = this.getParentNode();
        if (!question.isReply()) return false;
        return _.isEqual(this.getIndexOfParent(),
            question.getAnswer())
    }

    getIndexOfParent() {
        const self = this;
        const question = this.getParentNode();
        const indexOfChoice = question.getChoices().indexOf(self);
        return indexOfChoice;
    }

    hasPhotos() {
        return this.getImages().length > 0
    }

    isWrongReply() {
        const question = this.getParentNode();
        if (!question.isReply()) return false;
        return (_.isEqual(this.getIndexOfParent(), question.getReply()) &&
            this.getIndexOfParent() !== question.getAnswer());
    }

    /** -------------------- async api -------------------- **/
}

export default ExamQuestionChoiceStore;
