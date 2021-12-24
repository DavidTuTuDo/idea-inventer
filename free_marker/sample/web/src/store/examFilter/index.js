import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseExamFilterStore from "./BaseExamFilterStore";

class ExamFilterStore extends BaseExamFilterStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async onInitialFetchSucceed(collection) {
    const exams = this.getExamHistoryInfo().getHistoryExams();
    this.getHistoryTest().setSelectors(...exams);
    this.getHistoryTest().setSelectedSelector(_.last(exams).value)
    this.getComponent().validateRangeByValue(3);
  }

  /** -------------------- async api -------------------- **/
}
export default ExamFilterStore;
