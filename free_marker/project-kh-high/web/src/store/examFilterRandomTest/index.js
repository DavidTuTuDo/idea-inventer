import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseExamFilterRandomTestStore from "./BaseExamFilterRandomTestStore";

class ExamFilterRandomTestStore extends BaseExamFilterRandomTestStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
    this.setRangeOfYear([104,109]);
  }

  /** -------------------- async api -------------------- **/
}
export default ExamFilterRandomTestStore;
