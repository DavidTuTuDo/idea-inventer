import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseExamFilterStore from "./BaseExamFilterStore";
import {action, observable,} from "mobx";

class ExamFilterStore extends BaseExamFilterStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    @observable
    subject;

    constructor(props) {
        super(props);
    }

    async onInitialFetchSucceed(collection) {
        const exams = this.getExamHistoryInfo().getHistoryExams();
        this.getHistoryTest().setSelectors(...exams);
        this.getHistoryTest().setSelectedSelector(_.last(exams).value)
        this.getComponent().validateRangeByValue(3);
    }

    @action
    setSubject(subject) {
        this.getRandomTest().setBtnOfStartExam(`${subject}${this.getRandomTest().getBtnOfStartExam()}`)
        this.getHistoryTest().setBtnWithHistory(`${subject}${this.getHistoryTest().getBtnWithHistory()}`)
    }

    /** -------------------- async api -------------------- **/
}

export default ExamFilterStore;
