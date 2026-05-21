import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import { trim } from 'lodash-es';
import libpath from "path";
import BaseExamQuestionTopicStore from "./BaseExamQuestionTopicStore";

class ExamQuestionTopicStore extends BaseExamQuestionTopicStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getName() {
        const self = super.getName();
        return Util.isEqual(trim(self), "請依照題目作答") ? "" : self;
    }

    /** -------------------- async api -------------------- **/
}
export default ExamQuestionTopicStore;
