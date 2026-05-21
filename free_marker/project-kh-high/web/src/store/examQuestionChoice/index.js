const edit = true;
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import libpath from "path";
import BaseExamQuestionChoiceStore from "./BaseExamQuestionChoiceStore";

class ExamQuestionChoiceStore extends BaseExamQuestionChoiceStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getChoiceStringID() {
        return Util.integerToString(this.getIndexOfParent());
    }

    getQuestion() {
        return this.getParentNode();
    }

    isSelected() {
        return Util.has(this.getQuestion().getReply(), this.getChoiceStringID());
    }

    getIndexOfParent() {
        const self = this;
        const question = this.getParentNode();
        const indexOfChoice = question.getChoices().indexOf(self);
        return indexOfChoice;
    }

    hasPhotos() {
        return this.getImages().length > 0;
    }

    isRightAnswer() {
        /** 選項在reply裏面, 也在Answer裏面 */
        return this.getQuestion().getCompleted() && Util.has(this.getQuestion().getAnswer(), this.getChoiceStringID());
    }

    isMyWrongReply() {
        /** 選項在reply裏面, 但也在Answer裏面 */
        return (
            this.getQuestion().getCompleted() &&
            Util.has(this.getQuestion().getReply(), this.getChoiceStringID()) &&
            !Util.has(this.getQuestion().getAnswer(), this.getChoiceStringID())
        );
    }

    /** -------------------- async api -------------------- **/
}

export default ExamQuestionChoiceStore;
