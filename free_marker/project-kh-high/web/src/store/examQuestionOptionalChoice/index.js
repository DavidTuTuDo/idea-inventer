const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import libpath from "path";
import BaseExamQuestionOptionalChoiceStore from "./BaseExamQuestionOptionalChoiceStore";

class ExamQuestionOptionalChoiceStore extends BaseExamQuestionOptionalChoiceStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getOption() {
        return this.getParentNode();
    }

    isSelected() {
        return Util.has(this.getOption().getReply(), this.getStatement());
    }

    isRightAnswer() {
        /** 選項在reply裏面, 也在Answer裏面 */
        return this.getOption().getCompleted() && Util.has(this.getOption().getAnswer(), this.getStatement());
    }

    isMyWrongReply() {
        /** 選項在reply裏面, 但也在Answer裏面 */
        return this.getOption().getCompleted() && Util.has(this.getOption().getReply(), this.getStatement()) && !Util.has(this.getOption().getAnswer(), this.getStatement());
    }

    /** -------------------- async api -------------------- **/
}

export default ExamQuestionOptionalChoiceStore;
