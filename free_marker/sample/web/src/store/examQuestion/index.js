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
    return _.sampleSize(obj,10);
  }

  initial(obj) {
    super.initial(obj);
    this.setTip(`${this.getYear()}-${this.getSubject()}-${this.getType()}-${this.getQid()}`);
  }

  isReply(){
    return this.getReply() !== -32768;
  }

  isAnswerWrong(){
    if(!this.isReply())  return false;
    return !_.isEqual(this.getReply(), this.getAnswer());
  }

  hasPhotos() {
    this.getChoices()
  }

  getAnswer() {
    const answer = super.getAnswer();
    switch (answer){
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
      default:
        return -9;
    }
  }

  /** -------------------- async api -------------------- **/
  /** -------------------- async api -------------------- **/
}
export default ExamQuestionStore;
