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

    async onInitialFetchCompleted(collection) {
        const exams = this.getExamHistoryInfo().getHistoryExams();
        this.getHistoryTest().setSelectors(...exams);
        this.getHistoryTest().setSelectedSelector(_.last(exams).value)
        this.getComponent().validateRangeByValue(3);
    }

    @action
    setSubject(subject) {
        this.getRandomTest().setBtnOfStartExam(`${subject}隨機測驗`)
        this.getHistoryTest().setBtnWithHistory(`${subject}考古題`)
    }

    /** -------------------- async api -------------------- **/
}

export default ExamFilterStore;
