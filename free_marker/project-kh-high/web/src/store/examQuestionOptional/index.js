const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseExamQuestionOptionalStore from "./BaseExamQuestionOptionalStore";

class ExamQuestionOptionalStore extends BaseExamQuestionOptionalStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    setReply(param) {
        if (this.getCompleted()) return;

        const latest = `${param}${this.getReply()}`;
        super.setReply(latest);
        if (this.isAnswerRight() || this.isAnswerWrong()) {
            this.setCompleted(true);
        }
    }

    setCompleted(param) {
        super.setCompleted(param);
        this.notifyQuestionRefresh();
    }

    silentCompleted(param) {
        super.setCompleted(param);
    }

    /** 讓question去檢查每個optional 狀態*/
    notifyQuestionRefresh = () => {
        const question = this.getParentNode();
        question.optionalValidation();
    };

    isChoiceDependOnAttachImage() {
        return false;
    }

    isAnswerWrong() {
        let wrong = false;
        const replies = this.getReply().split("");
        for (const reply of replies) {
            if (!Util.has(this.getAnswer(), reply)) {
                wrong = true;
                break;
            }
        }
        return wrong;
    }

    isAnswerRight() {
        return Util.isEqual(this.getReply(), this.getAnswer());
    }

    /** -------------------- async api -------------------- **/
}

export default ExamQuestionOptionalStore;
