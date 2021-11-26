import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseExamQuestionStore from "./BaseExamQuestionStore";

class ExamQuestionStore extends BaseExamQuestionStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    filter(obj) {
        return _.sampleSize(obj, 10);
    }

    initial(obj) {
        super.initial(obj);
        this.setTip(`${this.getYear()}-${this.getSubject()}-${this.getType()}-${this.getQid()}`);
    }

    isReply() {
        return this.getReply() !== -32768;
    }

    isAnswerWrong() {
        if (!this.isReply()) return false;
        return !_.isEqual(this.getReply(), this.getAnswer());
    }

    hasPhotos() {
        this.getChoices()
    }

    getReplyString() {
        const reply = super.getReply();
        switch (reply) {
            case 0:
                return 'A';
            case 1:
                return 'B';
            case 2:
                return 'C';
            case 3:
                return 'D';
            case 4:
                return 'E';
            case 5:
                return 'F';
            case 6:
                return 'G';
            case 7:
                return 'H';
            case 8:
                return 'I';
            case 9:
                return 'J';
            default:
                return 'Z';
        }
    }

    getAnswer() {
        const answer = super.getAnswer();
        switch (answer) {
            case 'A':
                return 0;
            case 'B':
                return 1;
            case 'C':
                return 2;
            case 'D':
                return 3;
            case 'E':
                return 4;
            case 'F':
                return 5;
            case 'G':
                return 6;
            case 'H':
                return 7;
            case 'I':
                return 8;
            case 'J':
                return 9;
            default:
                return 101;
        }
    }

    /** -------------------- async api -------------------- **/
    /** -------------------- async api -------------------- **/
}

export default ExamQuestionStore;
