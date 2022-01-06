import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseExamQuestionStore from "./BaseExamQuestionStore";
import UserInfo from '../../userInfo';

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
        if (UserInfo.isAdmin())
            this.setTip(`${this.getYear()}-${this.getSubject()}-${this.getType()}-${this.getQid()}`);
        else
            this.setTip(`${this.getYear()}年-${this.getSubject()}科目`)
    }

    isReply() {
        return this.getReply() !== -32768;
    }

    isAnswerWrong() {
        if (!this.isReply()) return false;
        return !_.isEqual(this.getReply(), Util.stringToInteger(this.getAnswer()));
    }

    hasPhotos() {
        return _.size(this.getChoices()) > 0;
    }

    setReply(int) {
        super.setReply(int);
        if(this.isReply())
        this.validateAlertImage();
    }

    validateAlertImage = () =>{
        if(this.isAnswerWrong()) {
            this.setAlertImage('images/question_error.svg');
        } else {
            this.setAlertImage('images/question_right.svg');
        }
    }


    /** -------------------- async api -------------------- **/
    /** -------------------- async api -------------------- **/
}

export default ExamQuestionStore;
